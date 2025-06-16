import clientPromise from "@/lib/dbConnect";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";

// Helper tanggal dd-mm-yyyy
function toDDMMYYYY(dateStr) {
  if (!dateStr) return "";
  if (/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) return dateStr;
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  const pad = (n) => n.toString().padStart(2, "0");
  return `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()}`;
}

export async function PATCH(request, { params }) {
  const { id } = await params; // <= AWAIT params!
  const client = await clientPromise;
  const db = client.db();
  const body = await request.json();

  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });
  }

  const karyawan = await db
    .collection("karyawan")
    .findOne({ _id: new ObjectId(id) });
  if (!karyawan) {
    return NextResponse.json(
      { error: "Karyawan tidak ditemukan" },
      { status: 404 }
    );
  }

  // Tambah kasbon
  if (body.action === "tambahKasbon" && typeof body.jumlah === "number") {
    const kasbonBaru = { jumlah: body.jumlah, tanggal: toDDMMYYYY(new Date()) };
    await db
      .collection("karyawan")
      .updateOne({ _id: new ObjectId(id) }, { $push: { kasbon: kasbonBaru } });
    return NextResponse.json({
      ...karyawan,
      kasbon: [...(karyawan.kasbon || []), kasbonBaru],
    });
  }

  // Ajukan izin
  if (body.action === "ajukanIzin" && body.izinBaru) {
    const izinBaru = body.izinBaru;
    if (
      !izinBaru.tipe ||
      !izinBaru.tanggal ||
      (izinBaru.tipe === "libur" && !izinBaru.tanggalAkhir)
    ) {
      return NextResponse.json(
        { error: "Data izin tidak lengkap" },
        { status: 400 }
      );
    }
    izinBaru.tanggal = toDDMMYYYY(izinBaru.tanggal);
    if (izinBaru.tanggalAkhir)
      izinBaru.tanggalAkhir = toDDMMYYYY(izinBaru.tanggalAkhir);
    await db
      .collection("karyawan")
      .updateOne({ _id: new ObjectId(id) }, { $push: { izin: izinBaru } });
    return NextResponse.json({
      ...karyawan,
      izin: [...(karyawan.izin || []), izinBaru],
    });
  }

  return NextResponse.json({ error: "Request tidak valid" }, { status: 400 });
}

export async function DELETE(request, { params }) {
  const { id } = await params; // <= AWAIT params!
  const client = await clientPromise;
  const db = client.db();

  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });
  }

  const deleted = await db
    .collection("karyawan")
    .deleteOne({ _id: new ObjectId(id) });

  if (deleted.deletedCount === 0) {
    return NextResponse.json(
      { error: "Karyawan tidak ditemukan" },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true });
}

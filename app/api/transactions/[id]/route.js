import clientPromise from "@/lib/dbConnect";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";

// GET: Detail transaksi
export async function GET(request, context) {
  const params = await context.params;
  const { id } = params;
  try {
    const client = await clientPromise;
    const db = client.db();

    const transaksi = await db
      .collection("transactions")
      .findOne({ _id: new ObjectId(id) });

    if (!transaksi) {
      return NextResponse.json(
        { success: false, error: "Transaksi tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: transaksi });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: e.message },
      { status: 500 }
    );
  }
}

// PATCH: Edit transaksi
export async function PATCH(request, context) {
  const params = await context.params;
  const { id } = params;
  try {
    const client = await clientPromise;
    const db = client.db();
    const body = await request.json();

    if (body.date) body.date = new Date(body.date);
    if (body.total) body.total = Number(body.total);

    const { value: updated } = await db
      .collection("transactions")
      .findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: { ...body } },
        { returnDocument: "after" }
      );

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Transaksi tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: e.message },
      { status: 500 }
    );
  }
}

// DELETE: Hapus transaksi (MENGURANGI penghasilan hariini/bulanini jika perlu)
export async function DELETE(request, context) {
  const params = await context.params;
  const { id } = params;
  try {
    const client = await clientPromise;
    const db = client.db();

    // Ambil data transaksi sebelum dihapus
    const transaksi = await db
      .collection("transactions")
      .findOne({ _id: new ObjectId(id) });

    if (!transaksi) {
      return NextResponse.json(
        { success: false, error: "Transaksi tidak ditemukan" },
        { status: 404 }
      );
    }

    // Hapus transaksi
    const { deletedCount } = await db
      .collection("transactions")
      .deleteOne({ _id: new ObjectId(id) });

    if (deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: "Transaksi tidak ditemukan (sudah dihapus)" },
        { status: 404 }
      );
    }

    // Kurangi penghasilan hariini jika tanggal transaksi hari ini
    const tanggalTransaksi = new Date(transaksi.date);
    const now = new Date();

    const isToday =
      tanggalTransaksi.getDate() === now.getDate() &&
      tanggalTransaksi.getMonth() === now.getMonth() &&
      tanggalTransaksi.getFullYear() === now.getFullYear();

    if (isToday) {
      await db
        .collection("penghasilan")
        .updateOne(
          { _id: "hariini" },
          { $inc: { total: -Math.abs(Number(transaksi.total)) } },
          { upsert: true }
        );
    }

    // Kurangi penghasilan bulanini jika bulan & tahun transaksi sama dengan sekarang
    const isThisMonth =
      tanggalTransaksi.getMonth() === now.getMonth() &&
      tanggalTransaksi.getFullYear() === now.getFullYear();

    if (isThisMonth) {
      await db
        .collection("penghasilan")
        .updateOne(
          { _id: "bulanini" },
          { $inc: { total: -Math.abs(Number(transaksi.total)) } },
          { upsert: true }
        );
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: e.message },
      { status: 500 }
    );
  }
}

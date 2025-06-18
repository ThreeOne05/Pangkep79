import clientPromise from "@/lib/dbConnect";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

// GET: List transaksi (limit terbaru 100)
export async function GET(req) {
  try {
    const client = await clientPromise;
    const db = client.db();

    const url = new URL(req.url, "http://localhost");
    const limit = parseInt(url.searchParams.get("limit") || "100", 10);

    const transactions = await db
      .collection("transactions")
      .find({})
      .sort({ date: -1, _id: -1 }) // Urutan terbaru
      .limit(limit)
      .toArray();

    return NextResponse.json({
      success: true,
      data: transactions,
    });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: e.message },
      { status: 500 }
    );
  }
}

// POST: Tambah transaksi baru + update penghasilan hariini/bulanini
export async function POST(req) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const body = await req.json();

    if (!body.total || !body.date) {
      return NextResponse.json(
        { success: false, error: "total & date harus diisi" },
        { status: 400 }
      );
    }

    const doc = {
      ...body,
      total: Number(body.total),
      date: new Date(body.date),
      createdAt: new Date(),
    };

    const result = await db.collection("transactions").insertOne(doc);

    // === Tambah ke penghasilan hariini & bulanini ===
    const total = Number(body.total);

    // Hari ini
    await db
      .collection("penghasilan")
      .updateOne(
        { _id: "hariini" },
        { $inc: { total: total } },
        { upsert: true }
      );
    // Bulan ini
    await db
      .collection("penghasilan")
      .updateOne(
        { _id: "bulanini" },
        { $inc: { total: total } },
        { upsert: true }
      );

    return NextResponse.json({
      success: true,
      transaction: { ...doc, _id: result.insertedId },
    });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: e.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  const url = new URL(req.url, "http://localhost");
  const id = url.pathname.split("/").pop();
  if (!id)
    return NextResponse.json(
      { success: false, error: "No id" },
      { status: 400 }
    );
  try {
    const client = await clientPromise;
    const db = client.db();

    // Cari dulu transaksi yang akan dihapus
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
    await db.collection("transactions").deleteOne({ _id: new ObjectId(id) });

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

import clientPromise from "@/lib/dbConnect";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const { type, by } = await req.json();

    if (!["today", "month"].includes(type)) {
      return NextResponse.json(
        { success: false, error: "Invalid type" },
        { status: 400 }
      );
    }

    // Waktu Makassar
    const now = new Date();
    const makassar = new Date(
      now.toLocaleString("en-US", { timeZone: "Asia/Makassar" })
    );

    if (type === "today") {
      // Hapus transaksi hanya hari ini
      const start = new Date(
        makassar.getFullYear(),
        makassar.getMonth(),
        makassar.getDate()
      );
      const end = new Date(
        makassar.getFullYear(),
        makassar.getMonth(),
        makassar.getDate() + 1
      );
      await db.collection("transactions").deleteMany({
        date: { $gte: start, $lt: end },
      });
    } else if (type === "month") {
      // Hapus transaksi hanya bulan ini
      const start = new Date(makassar.getFullYear(), makassar.getMonth(), 1);
      const end = new Date(makassar.getFullYear(), makassar.getMonth() + 1, 1);
      await db.collection("transactions").deleteMany({
        date: { $gte: start, $lt: end },
      });
    }

    // Update dokumen reset_settings
    const settings =
      (await db
        .collection("reset_settings")
        .findOne({ _id: "reset_settings" })) || {};

    if (type === "today") {
      settings.resetHariIni = makassar;
      settings.resetHariIniBy = by || "unknown";
    } else {
      settings.resetBulanIni = makassar;
      settings.resetBulanIniBy = by || "unknown";
    }

    await db
      .collection("reset_settings")
      .updateOne(
        { _id: "reset_settings" },
        { $set: settings },
        { upsert: true }
      );

    return NextResponse.json({
      success: true,
      message: `Reset ${type === "today" ? "hari ini" : "bulan ini"} berhasil`,
    });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: e.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();

    const settings = await db
      .collection("reset_settings")
      .findOne({ _id: "reset_settings" });

    return NextResponse.json({
      success: true,
      resetHariIni: settings?.resetHariIni || null,
      resetBulanIni: settings?.resetBulanIni || null,
    });
  } catch (e) {
    return NextResponse.json(
      {
        success: false,
        error: e.message,
        resetHariIni: null,
        resetBulanIni: null,
      },
      { status: 500 }
    );
  }
}

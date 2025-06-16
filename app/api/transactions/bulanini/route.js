import clientPromise from "@/lib/dbConnect";
import { NextResponse } from "next/server";

// GET: Ambil total pemasukan bulan ini dari collection "penghasilan"
export async function GET() {
  const client = await clientPromise;
  const db = client.db();

  const penghasilan =
    (await db.collection("penghasilan").findOne({ _id: "bulanini" })) || {};

  return NextResponse.json({ success: true, total: penghasilan.total || 0 });
}

// POST: Reset penghasilan bulan ini (set total ke 0)
export async function POST() {
  const client = await clientPromise;
  const db = client.db();

  await db
    .collection("penghasilan")
    .updateOne({ _id: "bulanini" }, { $set: { total: 0 } }, { upsert: true });

  return NextResponse.json({ success: true });
}

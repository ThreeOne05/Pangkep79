import clientPromise from "@/lib/dbConnect";
import { NextResponse } from "next/server";

// GET: Ambil total pemasukan hari ini dari collection "penghasilan"
export async function GET() {
  const client = await clientPromise;
  const db = client.db();

  const penghasilan =
    (await db.collection("penghasilan").findOne({ _id: "hariini" })) || {};

  return NextResponse.json({ success: true, total: penghasilan.total || 0 });
}

// POST: Reset penghasilan hari ini (set total ke 0)
export async function POST() {
  const client = await clientPromise;
  const db = client.db();

  await db
    .collection("penghasilan")
    .updateOne({ _id: "hariini" }, { $set: { total: 0 } }, { upsert: true });

  return NextResponse.json({ success: true });
}

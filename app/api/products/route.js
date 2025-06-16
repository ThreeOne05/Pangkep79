import clientPromise from "@/lib/dbConnect";
import { NextResponse } from "next/server";

export async function GET() {
  const client = await clientPromise;
  const db = client.db();
  const products = await db
    .collection("products")
    .find({})
    .sort({ createdAt: -1 })
    .toArray();
  return NextResponse.json({ products });
}

export async function POST(req) {
  const client = await clientPromise;
  const db = client.db();
  const body = await req.json();

  // (Opsional) Validasi minimal
  if (!body.name || !body.price || !body.image) {
    return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
  }

  const result = await db.collection("products").insertOne({
    ...body,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  return NextResponse.json({ ...body, _id: result.insertedId });
}

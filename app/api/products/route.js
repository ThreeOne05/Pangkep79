import clientPromise from "@/lib/dbConnect";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const client = await clientPromise;
    const db = client.db();

    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get("limit")) || 50;
    const skip = parseInt(url.searchParams.get("skip")) || 0;
    const category = url.searchParams.get("category");

    const query = {};
    if (category) query.category = category;

    const products = await db
      .collection("products")
      .find(query, {
        projection: {
          name: 1,
          price: 1,
          image: 1,
          category: 1,
          quantity: 1,
          createdAt: 1,
          order: 1,
        },
      })
      .sort({ order: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    return NextResponse.json({ products });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const body = await req.json();

    if (!body.name || !body.price || !body.image) {
      return NextResponse.json(
        { error: "Data tidak lengkap" },
        { status: 400 }
      );
    }

    // Cari order terbesar di kategori
    const last = await db
      .collection("products")
      .find({ category: body.category })
      .sort({ order: -1 })
      .limit(1)
      .toArray();
    const nextOrder =
      last.length > 0 && typeof last[0].order === "number"
        ? last[0].order + 1
        : 0;

    const result = await db.collection("products").insertOne({
      ...body,
      order: nextOrder,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return NextResponse.json({
      ...body,
      _id: result.insertedId,
      order: nextOrder,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

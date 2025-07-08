import clientPromise from "@/lib/dbConnect";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";

// PATCH /api/products/reorder
export async function PATCH(req) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const { category, orderedIds } = await req.json();

    if (!category || !Array.isArray(orderedIds)) {
      return NextResponse.json(
        { error: "category dan orderedIds harus ada" },
        { status: 400 }
      );
    }

    // Update field order berdasarkan urutan di array
    const bulkOps = orderedIds.map((id, idx) => ({
      updateOne: {
        filter: { _id: new ObjectId(id), category },
        update: { $set: { order: idx } },
      },
    }));

    if (bulkOps.length === 0) {
      return NextResponse.json({ error: "orderedIds kosong" }, { status: 400 });
    }

    const result = await db.collection("products").bulkWrite(bulkOps);

    return NextResponse.json({ success: true, modified: result.modifiedCount });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

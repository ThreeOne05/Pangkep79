import clientPromise from "@/lib/dbConnect";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";

// Next.js 14/15: context.params is a Promise and must be awaited
export async function DELETE(request, context) {
  try {
    const params = await context.params;
    const { id } = params;
    const client = await clientPromise;
    const db = client.db();

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });
    }

    const deleted = await db
      .collection("analisis")
      .deleteOne({ _id: new ObjectId(id) });

    if (deleted.deletedCount === 0) {
      return NextResponse.json(
        { error: "Data analisis tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting analisis:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

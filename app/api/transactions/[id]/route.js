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

// DELETE: Hapus transaksi (tidak mengurangi penghasilan hariini/bulanini)
export async function DELETE(request, context) {
  const params = await context.params;
  const { id } = params;
  try {
    const client = await clientPromise;
    const db = client.db();

    const { deletedCount } = await db
      .collection("transactions")
      .deleteOne({ _id: new ObjectId(id) });

    if (deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: "Transaksi tidak ditemukan" },
        { status: 404 }
      );
    }

    // Tidak mengurangi penghasilan hariini/bulanini!
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: e.message },
      { status: 500 }
    );
  }
}

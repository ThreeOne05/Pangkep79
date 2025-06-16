import { NextResponse } from "next/server";
import { put } from "@vercel/blob";

/**
 * POST /api/upload
 * - Upload gambar ke Vercel Blob Storage
 * - Mengembalikan URL gambar (imageUrl) yang siap disimpan di database
 *
 * Form field yang diterima: "image"
 */
export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("image");
    if (!file || !file.name) {
      return NextResponse.json(
        { message: "No file uploaded" },
        { status: 400 }
      );
    }

    // Upload file ke Vercel Blob Storage (akses public)
    const blob = await put(file.name, file, { access: "public" });

    // Kembalikan URL gambar
    return NextResponse.json({
      imageUrl: blob.url,
    });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

import clientPromise from "@/lib/dbConnect";
import { NextResponse } from "next/server";

export async function GET(request) {
  const client = await clientPromise;
  const db = client.db();
  const url = new URL(request.url);
  const hanyaKasir = url.searchParams.get("kasir");
  let filter = {};
  if (hanyaKasir) {
    filter = { kasir: { $exists: true } };
  }
  const karyawan = await db.collection("karyawan").find(filter).toArray();
  return NextResponse.json(karyawan);
}

export async function POST(request) {
  const client = await clientPromise;
  const db = client.db();
  const body = await request.json();
  if (!body.nama) {
    return NextResponse.json({ error: "Nama wajib diisi" }, { status: 400 });
  }
  const baru = {
    nama: body.nama,
    izin: [],
    kasbon: [],
  };
  if (body.kasir && body.kasir.username && body.kasir.password) {
    baru.kasir = {
      username: body.kasir.username,
      password: body.kasir.password,
    };
  }
  const result = await db.collection("karyawan").insertOne(baru);
  return NextResponse.json({ ...baru, _id: result.insertedId });
}

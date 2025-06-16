import clientPromise from "@/lib/dbConnect";
import { NextResponse } from "next/server";

function validateIncomes(incomes) {
  if (!Array.isArray(incomes)) return false;
  return incomes.every(
    (income) =>
      typeof income.date === "string" &&
      income.date.trim() !== "" &&
      typeof income.name === "string" &&
      income.name.trim() !== "" &&
      typeof income.total === "number" &&
      income.total >= 0
  );
}

function validateExpenses(expenses) {
  if (!Array.isArray(expenses)) return false;
  return expenses.every(
    (expense) =>
      typeof expense.date === "string" &&
      expense.date.trim() !== "" &&
      typeof expense.name === "string" &&
      expense.name.trim() !== "" &&
      typeof expense.price === "number" &&
      expense.price >= 0
  );
}

function validateAnalisis(data) {
  const errors = [];
  if (
    !data.boxName ||
    typeof data.boxName !== "string" ||
    !data.boxName.trim()
  ) {
    errors.push("Nama box wajib diisi");
  }
  if (!validateIncomes(data.incomes || [])) {
    errors.push("Semua pemasukan wajib ada tanggal, nama, dan total");
  }
  if (data.expenses && !validateExpenses(data.expenses)) {
    errors.push("Setiap pengeluaran wajib ada tanggal, nama, dan harga");
  }
  return errors;
}

function calculateTotals(incomes, expenses) {
  const totalIncome = (incomes || []).reduce(
    (sum, inc) => sum + (inc.total || 0),
    0
  );
  const totalExpense = (expenses || []).reduce(
    (sum, exp) => sum + (exp.price || 0),
    0
  );
  return { totalIncome, totalExpense, profit: totalIncome - totalExpense };
}

function formatAnalisisData(data) {
  const { totalIncome, totalExpense, profit } = calculateTotals(
    data.incomes || [],
    data.expenses || []
  );
  return {
    boxName: data.boxName,
    incomes: data.incomes || [],
    expenses: data.expenses || [],
    totalIncome,
    totalExpense,
    profit,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const all = await db
      .collection("analisis")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    return NextResponse.json(
      all.map((item) => ({
        ...item,
        _id: item._id.toString(),
      }))
    );
  } catch (error) {
    console.error("Error fetching analisis:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const body = await request.json();

    // Validasi
    const errors = validateAnalisis(body);
    if (errors.length > 0) {
      return NextResponse.json({ error: errors.join(", ") }, { status: 400 });
    }

    // Format & simpan data
    const formattedData = formatAnalisisData(body);
    const result = await db.collection("analisis").insertOne(formattedData);

    return NextResponse.json({ ...formattedData, _id: result.insertedId });
  } catch (error) {
    console.error("Error creating analisis:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

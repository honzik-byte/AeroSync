import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ message: "Vytvoření letadla zatím není implementované." }, { status: 501 });
}

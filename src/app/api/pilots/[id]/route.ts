import { NextResponse } from "next/server";

export async function PATCH() {
  return NextResponse.json({ message: "Úprava pilota zatím není implementovaná." }, { status: 501 });
}

export async function DELETE() {
  return NextResponse.json({ message: "Smazání pilota zatím není implementované." }, { status: 501 });
}

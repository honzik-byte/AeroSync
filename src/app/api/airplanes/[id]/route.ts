import { NextResponse } from "next/server";

export async function PATCH() {
  return NextResponse.json({ message: "Úprava letadla zatím není implementovaná." }, { status: 501 });
}

export async function DELETE() {
  return NextResponse.json({ message: "Smazání letadla zatím není implementované." }, { status: 501 });
}

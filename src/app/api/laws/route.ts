import { NextResponse } from "next/server";
import { IT_LAWS } from "@/lib/utils/law-constants";

export async function GET() {
  return NextResponse.json({ laws: IT_LAWS });
}

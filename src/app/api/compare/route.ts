import { NextResponse } from "next/server";
import { fetchCompareData } from "@/lib/mcp/law-api";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lawId = searchParams.get("lawId");

  if (!lawId) {
    return NextResponse.json({ error: "lawId is required" }, { status: 400 });
  }

  const data = await fetchCompareData(lawId);
  if (!data) {
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }

  return NextResponse.json(data);
}

import { NextRequest, NextResponse } from "next/server";
import { getLawById } from "@/lib/utils/law-constants";
import { getMockArticles, getMockAmendments } from "@/lib/mcp/mock-data";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ lawId: string }> }
) {
  const { lawId } = await params;
  const law = getLawById(lawId);

  if (!law) {
    return NextResponse.json({ error: "Law not found" }, { status: 404 });
  }

  const articles = getMockArticles(lawId);
  const amendments = getMockAmendments(lawId);

  return NextResponse.json({ law, articles, amendments });
}

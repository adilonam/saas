import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // Auth removed - API is now public for all users

    return NextResponse.json(
      { message: "OK", subscriptionActive: true },
      { status: 200 }
    );
  } catch (error) {
    console.error("Sign error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

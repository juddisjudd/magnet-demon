import { NextRequest, NextResponse } from "next/server";
import { authenticateUser, generateToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { message: "Username and password are required" },
        { status: 400 }
      );
    }

    const user = authenticateUser(username, password);
    if (!user) {
      return NextResponse.json(
        { message: "Invalid username or password" },
        { status: 401 }
      );
    }

    const token = await generateToken(user);

    return NextResponse.json({ token, user });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

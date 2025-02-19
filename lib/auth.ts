import { NextRequest, NextResponse } from "next/server";
import { jwtVerify, SignJWT } from "jose";

export interface UserData {
  id: number;
  username: string;
  isAdmin: boolean;
}

// Simple in-memory user database (replace with PostgreSQL in production)
const users = [
  {
    id: 1,
    username: "admin",
    password: "admin123", // Obviously not secure, for development only
    isAdmin: true,
  },
  {
    id: 2,
    username: "user",
    password: "user123",
    isAdmin: false,
  },
];

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "development-jwt-secret-key-change-in-production"
);

export async function generateToken(
  user: Omit<UserData, "isAdmin"> & { isAdmin?: boolean }
): Promise<string> {
  const token = await new SignJWT({
    id: user.id,
    username: user.username,
    isAdmin: user.isAdmin || false,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);

  return token;
}

export async function verifyToken(token: string): Promise<UserData | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as UserData;
  } catch (error) {
    return null;
  }
}

export function authenticateUser(
  username: string,
  password: string
): UserData | null {
  const user = users.find(
    (u) => u.username === username && u.password === password
  );

  if (!user) return null;

  return {
    id: user.id,
    username: user.username,
    isAdmin: user.isAdmin,
  };
}

export function authMiddleware(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = authHeader.split(" ")[1];
  return verifyToken(token);
}

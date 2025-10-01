// src/app/api/auth/login/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Import our singleton Prisma client
import bcrypt from "bcrypt";
import * as z from "zod";

// We use Zod to define the expected shape of the request body and validate it.
const userSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = userSchema.parse(body);

    // 1. Find the user in the database
    const user = await prisma.user.findUnique({
      where: { email: email },
    });

    if (!user) {
      // Use a generic error message for security
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // 2. Compare the provided password with the hashed password in the database
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // 3. If login is successful, return the user's data (excluding the password!)
    // NOTE: In a real app, you would create and return a session token (JWT) here.
    // We will add that in the next major step.
    const { passwordHash, ...userWithoutPassword } = user;

    return NextResponse.json({ user: userWithoutPassword }, { status: 200 });

  } catch (error) {
    // If Zod validation fails, return a 400 error
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    
    // For any other server errors
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
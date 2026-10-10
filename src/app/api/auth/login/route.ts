import { type NextRequest, NextResponse } from "next/server"
import { createToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  // Get credentials from URL search parameters
  const searchParams = request.nextUrl.searchParams
  const username = searchParams.get("username")
  const password = searchParams.get("password")
  const remember = searchParams.get("remember") === "true"

  // Basic validation
  if (!username) {
    return NextResponse.json({ success: false, message: "Username is required" }, { status: 400 })
  }

  if (!password) {
    return NextResponse.json({ success: false, message: "Password is required" }, { status: 400 })
  }

  // In a real app, you would validate against a database
  // For now, we'll use hardcoded credentials
  if (username === "admin" && password === "password") {
    // Create a user object
    const user = {
      id: "1",
      name: "Admin User",
      email: username,
      role: "admin",
    }

    // Create tokens
    const token = await createToken(user)
    const refreshToken = await createToken(user, "30d")

    // Create the response
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token: token,
    })

    // Set cookies on the response
    const expires = new Date()
    expires.setDate(expires.getDate() + (remember ? 30 : 1))

    response.cookies.set({
      name: "auth_token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      expires,
      path: "/",
    })

    response.cookies.set({
      name: "refresh_token",
      value: refreshToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      path: "/",
    })

    return response
  }

  // If credentials are invalid
  return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 })
}


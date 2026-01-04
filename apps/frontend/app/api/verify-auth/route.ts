import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
    
    if (!BACKEND_URL) {
      return NextResponse.json(
        { authenticated: false, message: "Backend URL not configured" },
        { status: 500 }
      );
    }

    // Get the cookie from the incoming request
    const cookie = request.headers.get("cookie");

    // Forward the request to the backend with the cookie
    const response = await fetch(`${BACKEND_URL}/api/verify`, {
      method: "GET",
      headers: {
        "Cookie": cookie || "",
      },
      credentials: "include",
    });

    const data = await response.json();

    if (!response.ok || !data.authenticated) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      );
    }

    return NextResponse.json({
      authenticated: true,
      user: data.user,
    });
  } catch (error) {
    console.error("Auth verification error:", error);
    return NextResponse.json(
      { authenticated: false, message: "Error verifying authentication" },
      { status: 500 }
    );
  }
}

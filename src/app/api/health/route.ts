import { NextResponse } from "next/server";

export async function GET() {
  try {
    const healthData = {
      status: "ok",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
      version: process.env.APP_VERSION || "1.0.0",
    };

    return NextResponse.json(healthData, {
      status: 200,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      },
    });
  } catch (error) {
    console.error("Health check endpoint failed:", error);
    
    return NextResponse.json(
      {
        status: "error",
        timestamp: new Date().toISOString(),
        message: "Internal server error during health check",
      },
      { 
        status: 500,
        headers: {
          "Cache-Control": "no-store",
        }
      }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";

const FLASK_SERVER_URL = "http://localhost:5000/merge"; // Replace with the deployed Flask server URL if needed

export async function POST(req: NextRequest) {
  try {
    // Parse incoming FormData from the request
    const formData = await req.formData();

    const video = formData.get("video") as File;
    const audio = formData.get("audio") as File;

    if (!video || !audio) {
      return NextResponse.json(
        { error: "Both video and audio files are required." },
        { status: 400 }
      );
    }

    // Create a new FormData to send to the Flask server
    const flaskFormData = new FormData();
    flaskFormData.append("video", video);
    flaskFormData.append("audio", audio);

    // Forward the request to the Flask server
    const flaskResponse = await fetch(FLASK_SERVER_URL, {
      method: "POST",
      body: flaskFormData,
    });

    if (!flaskResponse.ok) {
      const errorText = await flaskResponse.text();
      return NextResponse.json(
        { error: errorText },
        { status: flaskResponse.status }
      );
    }

    // Fetch the response content from the Flask server
    const buffer = await flaskResponse.arrayBuffer();

    // Return the merged video to the client
    return new NextResponse(Buffer.from(buffer), {
      headers: {
        "Content-Type": "video/mp4",
        "Content-Disposition": 'attachment; filename="merged_video.mp4"',
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

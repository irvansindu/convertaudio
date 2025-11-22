import { NextRequest, NextResponse } from "next/server";
import ffmpeg from "fluent-ffmpeg";
import { writeFile, unlink, mkdir } from "fs/promises";
import { createReadStream } from "fs";
import path from "path";
import { Readable } from "stream";

// Set FFmpeg path explicitly (Windows)
try {
  const ffmpegPath = process.env.FFMPEG_PATH || "ffmpeg";
  ffmpeg.setFfmpegPath(ffmpegPath);
  console.log("FFmpeg path set to:", ffmpegPath);
} catch (error) {
  console.error("Error setting FFmpeg path:", error);
}

// Configuration
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB
const ALLOWED_MIME_TYPES = [
  "video/mp4",
  "video/quicktime",
  "video/x-matroska",
  "video/x-msvideo",
  "video/webm",
  "audio/wav",
  "audio/mpeg",
  "audio/aac",
  "audio/ogg",
  "audio/flac",
  "audio/x-wav",
  "audio/x-m4a",
];

const ALLOWED_EXTENSIONS = [
  ".mp4",
  ".mov",
  ".mkv",
  ".avi",
  ".webm",
  ".wav",
  ".mp3",
  ".aac",
  ".ogg",
  ".flac",
  ".m4a",
];

// Helper function to convert stream to buffer
async function streamToBuffer(stream: Readable): Promise<Buffer> {
  const chunks: Uint8Array[] = [];
  return new Promise((resolve, reject) => {
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(chunks)));
  });
}

export async function POST(request: NextRequest) {
  let inputFilePath: string | null = null;
  let outputFilePath: string | null = null;

  try {
    // Parse the multipart form data
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const format = (formData.get("format") as string) || "mp3";

    // Allowed output formats
    const ALLOWED_OUTPUT_FORMATS = ["mp3", "wav", "aac", "m4a", "ogg", "flac"];

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    if (!ALLOWED_OUTPUT_FORMATS.includes(format)) {
      return NextResponse.json(
        { error: "Unsupported output format" },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File is too large. Maximum file size is 100 MB." },
        { status: 413 }
      );
    }

    // Validate file type
    const fileExtension = path.extname(file.name).toLowerCase();
    if (
      !ALLOWED_MIME_TYPES.includes(file.type) &&
      !ALLOWED_EXTENSIONS.includes(fileExtension)
    ) {
      return NextResponse.json(
        {
          error:
            "Unsupported file type. Please upload a valid video or audio file.",
        },
        { status: 415 }
      );
    }

    // Generate unique filenames for input and output
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(7);
    const sanitizedFileName = file.name
      .replace(/[^a-zA-Z0-9.-]/g, "_")
      .substring(0, 100);

    inputFilePath = path.join(
      process.cwd(),
      "tmp",
      `input_${timestamp}_${randomString}_${sanitizedFileName}`
    );
    outputFilePath = path.join(
      process.cwd(),
      "tmp",
      `output_${timestamp}_${randomString}.${format}`
    );

    // Ensure tmp directory exists (create it if it doesn't)
    const tmpDir = path.join(process.cwd(), "tmp");
    try {
      await mkdir(tmpDir, { recursive: true });
    } catch (error) {
      // Directory might already exist, that's fine
      console.log("tmp directory already exists or error creating it:", error);
    }

    // Convert File to Buffer and save to temporary location
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await writeFile(inputFilePath, buffer);

    // Get audio codec and bitrate based on format
    let audioCodec = "libmp3lame";
    let audioBitrate = "192k";
    let outputFormat = format;
    
    switch (format) {
      case "mp3":
        audioCodec = "libmp3lame";
        audioBitrate = "192k";
        break;
      case "aac":
        // Use native AAC encoder with ADTS container
        audioCodec = "aac";
        audioBitrate = "192k";
        outputFormat = "adts"; // AAC ADTS stream format
        break;
      case "m4a":
        // M4A is AAC in MP4 container
        audioCodec = "aac";
        audioBitrate = "192k";
        outputFormat = "ipod"; // MP4 container optimized for audio
        break;
      case "ogg":
        audioCodec = "libvorbis";
        audioBitrate = "192k";
        break;
      case "flac":
        audioCodec = "flac";
        audioBitrate = "";
        break;
      case "wav":
        audioCodec = "pcm_s16le";
        audioBitrate = "";
        break;
    }

    // Convert the file using fluent-ffmpeg
    await new Promise<void>((resolve, reject) => {
      const command = ffmpeg(inputFilePath!).toFormat(outputFormat);
      
      if (audioCodec) {
        command.audioCodec(audioCodec);
      }
      
      if (audioBitrate) {
        command.audioBitrate(audioBitrate);
      }
      
      // Add strict experimental flag for native AAC encoder
      if (format === "aac" || format === "m4a") {
        command.outputOptions(["-strict", "experimental"]);
      }
      
      command
        .on("start", (commandLine) => {
          console.log("FFmpeg process started:", commandLine);
        })
        .on("progress", (progress) => {
          console.log("Processing: ", progress.percent, "% done");
        })
        .on("end", () => {
          console.log("Conversion finished successfully");
          resolve();
        })
        .on("error", (err) => {
          console.error("FFmpeg error:", err);
          reject(new Error(`Conversion failed: ${err.message}`));
        })
        .save(outputFilePath!);
    });

    // Read the converted file
    const outputBuffer = await streamToBuffer(createReadStream(outputFilePath));

    // Clean up temporary files
    try {
      await unlink(inputFilePath);
      await unlink(outputFilePath);
    } catch (cleanupError) {
      console.error("Error cleaning up temporary files:", cleanupError);
      // Don't fail the request if cleanup fails
    }

    // Generate output filename with correct extension
    const outputFileName = file.name.replace(/\.[^/.]+$/, "") + `.${format}`;
    
    // Get correct MIME type for the format
    const mimeTypes: { [key: string]: string } = {
      mp3: "audio/mpeg",
      wav: "audio/wav",
      aac: "audio/aac",
      m4a: "audio/mp4",
      ogg: "audio/ogg",
      flac: "audio/flac",
    };
    
    const contentType = mimeTypes[format] || "audio/mpeg";

    // Return the converted file
    return new NextResponse(new Uint8Array(outputBuffer), {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${outputFileName}"`,
        "Content-Length": outputBuffer.length.toString(),
      },
    });
  } catch (error) {
    // Clean up files in case of error
    if (inputFilePath) {
      try {
        await unlink(inputFilePath);
      } catch {
        // Ignore cleanup errors
      }
    }
    if (outputFilePath) {
      try {
        await unlink(outputFilePath);
      } catch {
        // Ignore cleanup errors
      }
    }

    console.error("Conversion error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Conversion failed. Please try again.",
      },
      { status: 500 }
    );
  }
}

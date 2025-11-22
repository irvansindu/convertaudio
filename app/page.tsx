/// <reference types="react" />
"use client";

import { useState, useRef, ChangeEvent, DragEvent } from "react";

type ConversionState = "idle" | "converting" | "success" | "error";

export default function Home() {
  // File upload states
  const [file, setFile] = useState<File | null>(null);
  const [state, setState] = useState<ConversionState>("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [downloadUrl, setDownloadUrl] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const [downloadFilename, setDownloadFilename] = useState<string>("");
  const [outputFormat, setOutputFormat] = useState<string>("mp3");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB
  const ALLOWED_TYPES = [
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
  ];

  const validateFile = (file: File): boolean => {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      setErrorMessage(
        `File size exceeds 100 MB limit. Your file is ${(
          file.size /
          (1024 * 1024)
        ).toFixed(2)} MB`
      );
      setState("error");
      return false;
    }

    // Check file type
    const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();
    if (
      !ALLOWED_TYPES.includes(file.type) &&
      !ALLOWED_EXTENSIONS.includes(fileExtension)
    ) {
      setErrorMessage(
        "Invalid file type. Please upload a video or audio file."
      );
      setState("error");
      return false;
    }

    return true;
  };

  const handleFileSelect = (selectedFile: File) => {
    if (validateFile(selectedFile)) {
      setFile(selectedFile);
      setState("idle");
      setErrorMessage("");
      setDownloadUrl("");
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleConvert = async () => {
    if (!file) return;

    setState("converting");
    setErrorMessage("");
    setDownloadUrl("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("format", outputFormat);

      const response = await fetch("/api/convert", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Conversion failed");
      }

      // Get the blob from the response
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      // Extract filename from Content-Disposition header
      const contentDisposition = response.headers.get("Content-Disposition");
      let filename = "audio.mp3";
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }

      setDownloadUrl(url);
      setDownloadFilename(filename);
      setState("success");
    } catch (error) {
      console.error("Conversion error:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Conversion failed. Please try again."
      );
      setState("error");
    }
  };

  const handleDownload = () => {
    if (!downloadUrl) return;

    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = downloadFilename || "audio.mp3";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const resetForm = () => {
    setFile(null);
    setState("idle");
    setErrorMessage("");
    setDownloadUrl("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            AudioConvert
          </h1>
          <p className="text-gray-300 text-lg font-medium">
            Your universal audio converter
          </p>
          <p className="text-gray-400 mt-3">
            Convert MP3, WAV, AAC, M4A, OGG, FLAC • Fast & Secure • No Limits
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Please only convert content you own or are allowed to use.
          </p>
        </div>

        {/* Main Content */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-gray-700">
            {/* Idle State - File Upload */}
            {state === "idle" && !file && (
              <div
                className={`border-2 border-dashed rounded-xl p-12 text-center transition-all ${
                  isDragging
                    ? "border-blue-500 bg-blue-500/10"
                    : "border-gray-600 hover:border-blue-400"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="mb-6">
                  <div className="inline-block p-6 bg-blue-500/10 rounded-full mb-4">
                    <svg
                      className="w-16 h-16 text-blue-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-semibold mb-2">
                    Drop your file here
                  </h3>
                  <p className="text-gray-400 mb-4">
                    or click to browse from your computer
                  </p>
                  <p className="text-sm text-gray-500">
                    Supported: MP4, MOV, MKV, AVI, WebM, WAV, MP3, AAC, OGG,
                    FLAC
                  </p>
                  <p className="text-sm text-gray-500">Max size: 100 MB</p>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileInputChange}
                  accept={ALLOWED_EXTENSIONS.join(",")}
                  className="hidden"
                  id="fileInput"
                />
                <label
                  htmlFor="fileInput"
                  className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg cursor-pointer transition-colors shadow-lg hover:shadow-xl"
                >
                  Select File
                </label>
              </div>
            )}

            {/* File Selected */}
            {state === "idle" && file && (
              <div>
                <div className="bg-gray-700/50 rounded-lg p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-500/20 rounded-lg">
                        <svg
                          className="w-8 h-8 text-blue-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-lg">{file.name}</p>
                        <p className="text-sm text-gray-400">
                          {(file.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={resetForm}
                      className="p-2 hover:bg-gray-600 rounded-lg transition-colors"
                    >
                      <svg
                        className="w-6 h-6 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Format Selector */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Output Format
                  </label>
                  <select
                    value={outputFormat}
                    onChange={(e) => setOutputFormat(e.target.value)}
                    className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                  >
                    <option value="mp3">MP3 - Most Compatible</option>
                    <option value="wav">WAV - Lossless Quality</option>
                    <option value="aac">AAC - High Quality</option>
                    <option value="m4a">M4A - Apple Format</option>
                    <option value="ogg">OGG - Open Format</option>
                    <option value="flac">FLAC - Lossless Compression</option>
                  </select>
                </div>

                <button
                  onClick={handleConvert}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-lg transition-all shadow-lg hover:shadow-xl"
                >
                  Convert to {outputFormat.toUpperCase()}
                </button>
              </div>
            )}

            {/* Converting State */}
            {state === "converting" && (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-6"></div>
                <p className="text-xl font-semibold mb-2">Converting...</p>
                <p className="text-gray-400">
                  This may take a few moments depending on file size
                </p>
              </div>
            )}

            {/* Success State */}
            {state === "success" && (
              <div className="text-center py-8">
                <div className="inline-block p-6 bg-green-500/10 rounded-full mb-6">
                  <svg
                    className="w-16 h-16 text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold mb-4 text-green-400">
                  Conversion Successful!
                </h3>
                <p className="text-gray-300 mb-6">
                  Your file has been converted to {outputFormat.toUpperCase()}
                </p>

                <div className="space-y-3">
                  <button
                    onClick={handleDownload}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-4 px-6 rounded-lg transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                    Download {outputFormat.toUpperCase()}
                  </button>

                  <button
                    onClick={resetForm}
                    className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                  >
                    Convert Another File
                  </button>
                </div>
              </div>
            )}

            {/* Error State */}
            {state === "error" && errorMessage && (
              <div>
                <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-6 mb-6">
                  <div className="flex items-start gap-4">
                    <svg
                      className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div>
                      <h4 className="font-semibold text-red-400 mb-1">Error</h4>
                      <p className="text-sm text-gray-300">{errorMessage}</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={resetForm}
                  className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>

          {/* Footer Info */}
          <div className="mt-8 text-center text-sm text-gray-400">
            <p className="flex items-center justify-center gap-2">
              🔒 Your files are processed securely and are not stored on our
              servers.
            </p>
            <p className="mt-2">
              ⚠️ Downloading copyrighted content from YouTube without
              permission may violate their Terms of Service.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

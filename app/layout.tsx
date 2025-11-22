import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AudioConvert - Your Universal Audio Converter",
  description: "Free online audio converter. Convert your audio and video files to MP3, WAV, AAC, M4A, OGG, or FLAC format. Fast, secure, and easy to use.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}

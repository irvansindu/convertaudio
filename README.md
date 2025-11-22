# Audio Converter to MP3

A full-stack media-to-MP3 converter built with Next.js 14, TypeScript, and Tailwind CSS. This application allows users to convert various video and audio formats to MP3 format with a modern, responsive user interface.

## Features

- 🎵 **Multiple Format Support**: Convert MP4, MOV, MKV, AVI, WebM, WAV, AAC, OGG, FLAC, and more to MP3
- 🎨 **Modern UI**: Clean, responsive design with drag-and-drop file upload
- ⚡ **Fast Conversion**: Powered by FFmpeg with 192kbps bitrate
- 🔒 **Secure**: Files are processed locally and automatically deleted after conversion
- 📱 **Responsive**: Works seamlessly on desktop and mobile devices
- 🌓 **Dark Mode**: Automatic dark mode support based on system preferences
- ✅ **Validation**: File size limits (100 MB) and format validation

## Prerequisites

Before you begin, ensure you have the following installed on your system:

1. **Node.js** (version 18 or higher)
   - Download from: https://nodejs.org/
   - Verify installation: `node --version`

2. **FFmpeg** (REQUIRED for file conversion)
   - **Windows**: 
     - Download from: https://ffmpeg.org/download.html
     - Or use Chocolatey: `choco install ffmpeg`
   - **macOS**: 
     - Use Homebrew: `brew install ffmpeg`
   - **Linux**: 
     - Ubuntu/Debian: `sudo apt-get install ffmpeg`
     - CentOS/RHEL: `sudo yum install ffmpeg`
   - Verify installation: `ffmpeg -version`

## Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```
   or if you prefer yarn:
   ```bash
   yarn install
   ```

2. **Verify FFmpeg is installed**:
   ```bash
   ffmpeg -version
   ```
   You should see FFmpeg version information. If not, please install FFmpeg before proceeding.

## Running the Application

### Development Mode

To start the development server:

```bash
npm run dev
```

or with yarn:

```bash
yarn dev
```

The application will be available at: **http://localhost:3000**

### Production Build

To build the application for production:

```bash
npm run build
npm start
```

or with yarn:

```bash
yarn build
yarn start
```

## Usage

1. **Open the application** in your web browser (http://localhost:3000)
2. **Upload a file** by either:
   - Clicking the upload area and selecting a file
   - Dragging and dropping a file onto the upload area
3. **Click "Convert to MP3"** to start the conversion
4. **Wait** for the conversion to complete (progress is shown)
5. **Download** your converted MP3 file

### Supported File Formats

- **Video**: MP4, MOV, MKV, AVI, WebM
- **Audio**: WAV, AAC, OGG, FLAC, MP3, M4A

### File Size Limit

- Maximum file size: **100 MB**
- Files larger than this limit will be rejected with an error message

## Project Structure

```
media-to-mp3-converter/
├── app/
│   ├── api/
│   │   └── convert/
│   │       └── route.ts       # API endpoint for file conversion
│   ├── globals.css            # Global styles and Tailwind directives
│   ├── layout.tsx             # Root layout component
│   └── page.tsx               # Main page with upload UI
├── tmp/                       # Temporary directory for file processing (auto-created)
├── .gitignore
├── next.config.mjs            # Next.js configuration
├── package.json               # Dependencies and scripts
├── postcss.config.mjs         # PostCSS configuration
├── tailwind.config.ts         # Tailwind CSS configuration
├── tsconfig.json              # TypeScript configuration
└── README.md                  # This file
```

## How It Works

1. **Frontend** (`app/page.tsx`):
   - React client component with file upload interface
   - Drag-and-drop functionality
   - File validation (size and type)
   - Upload progress and conversion status
   - Download functionality for converted files

2. **Backend** (`app/api/convert/route.ts`):
   - Next.js Route Handler (API endpoint)
   - Receives uploaded file via multipart/form-data
   - Validates file size and type
   - Saves file temporarily to `/tmp` directory
   - Uses `fluent-ffmpeg` to convert to MP3 format (192 kbps)
   - Streams converted file back to client
   - Automatically cleans up temporary files

## Configuration

### Changing File Size Limit

Edit both files to change the maximum file size:

1. In `app/page.tsx`:
```typescript
const MAX_FILE_SIZE = 100 * 1024 * 1024; // Change this value
```

2. In `app/api/convert/route.ts`:
```typescript
const MAX_FILE_SIZE = 100 * 1024 * 1024; // Change this value
```

### Changing Audio Bitrate

Edit `app/api/convert/route.ts`:

```typescript
ffmpeg(inputFilePath!)
  .toFormat("mp3")
  .audioBitrate(192) // Change bitrate here (e.g., 128, 256, 320)
```

## Important Notes

### Copyright and Legal Usage

⚠️ **Please only convert media files you own or have permission to use.** 

- Respect copyright laws and intellectual property rights
- Do not use this tool to convert copyrighted content without authorization
- Users are responsible for ensuring they have the right to convert and download files

### FFmpeg Requirement

This application **requires FFmpeg to be installed** on the server/host machine. Without FFmpeg:
- The application will start successfully
- The UI will work normally
- File conversion will fail with an error

Make sure FFmpeg is properly installed and accessible from the command line before deploying.

## Troubleshooting

### "FFmpeg not found" error

**Problem**: Conversion fails with an error about FFmpeg not being found.

**Solution**: 
1. Verify FFmpeg is installed: `ffmpeg -version`
2. Ensure FFmpeg is in your system PATH
3. Restart your terminal/IDE after installing FFmpeg
4. Restart the development server

### "File is too large" error

**Problem**: Upload fails with file size error.

**Solution**: 
- The maximum file size is 100 MB by default
- Either reduce your file size or increase the limit in the configuration

### Conversion is slow

**Problem**: File conversion takes a long time.

**Solution**: 
- Large files naturally take longer to convert
- Consider reducing the bitrate for faster conversion
- Ensure your system has sufficient resources available

### TypeScript/Lint errors in IDE

**Problem**: IDE shows TypeScript errors even though you followed all steps.

**Solution**:
- Make sure you ran `npm install` to install all dependencies
- Restart your IDE/editor
- These errors should disappear once dependencies are installed

## Technologies Used

- **[Next.js 14](https://nextjs.org/)** - React framework with App Router
- **[React 18](https://react.dev/)** - UI library
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[fluent-ffmpeg](https://github.com/fluent-ffmpeg/node-fluent-ffmpeg)** - FFmpeg wrapper for Node.js
- **[FFmpeg](https://ffmpeg.org/)** - Multimedia framework for conversion

## License

This project is open source and available for personal and educational use.

## Support

If you encounter any issues or have questions:
1. Check the Troubleshooting section above
2. Verify FFmpeg is properly installed
3. Ensure all dependencies are installed (`npm install`)
4. Check the browser console for error messages

---

**Happy Converting! 🎵**

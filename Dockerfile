FROM node:18-alpine

# Install FFmpeg
RUN apk add --no-cache ffmpeg

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including dev dependencies needed for build)
RUN npm install

# Copy application code
COPY . .

# Build Next.js application
RUN npm run build

# Expose port
EXPOSE 3000

# Set environment to production
ENV NODE_ENV=production

# Start application
CMD ["npm", "start"]

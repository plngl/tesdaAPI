# Use an official Node.js LTS image (Debian bullseye slim = smaller)
FROM node:18-bullseye-slim

# Install system dependencies required by Chromium / Playwright
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    wget \
    xvfb \
    libgtk-3-0 \
    libnotify-dev \
    libgconf-2-4 \
    libgbm-dev \
    libnss3 \
    libxss1 \
    libasound2 \
    libxtst6 \
    fonts-liberation \
    libappindicator3-1 \
    libglib2.0-0 \
    libcairo2 \
    libpango-1.0-0 \
    libatk1.0-0 \
    libdbus-1-3 \
    libdrm2 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libwayland-client0 \
    libwayland-server0 \
    libgbm1 \
 && rm -rf /var/lib/apt/lists/*

# Create and set working directory
WORKDIR /app

# Copy package files first (leverage Docker cache for faster rebuilds)
COPY package*.json ./

# Install app dependencies
RUN npm install --omit=dev

# Install Playwright Chromium + dependencies
RUN npx playwright install --with-deps chromium

# Copy the rest of the application code
COPY . .

# Expose the app port (match Render's default or your Express port)
EXPOSE 10000

# Run the server
CMD ["node", "server.js"]

#!/bin/bash

# Exit on any error
set -e

echo "Updating package list..."
sudo apt-get update

echo "Installing React Native DevTools / Electron dependencies..."

# List of required packages for running GUI apps (like RN DevTools) headlessly on Linux.
# Note: We are using the 't64' suffix for some packages as required by Ubuntu 24.04+.
# If you run this on an older Ubuntu version, you may need to remove the 't64' suffixes.

sudo apt-get install -y \
  libatk1.0-0t64 \
  libatk-bridge2.0-0t64 \
  libcups2t64 \
  libdrm2 \
  libxkbcommon0 \
  libxcomposite1 \
  libxdamage1 \
  libxrandr2 \
  libgbm1 \
  libpango-1.0-0 \
  libcairo2 \
  libasound2t64 \
  libnss3 \
  libgtk-3-0 \
  libxss1

echo "Dependencies installed successfully!"
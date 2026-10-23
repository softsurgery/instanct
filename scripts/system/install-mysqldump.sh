#!/bin/bash

# Exit on any error
set -e

if command -v mysqldump >/dev/null 2>&1; then
  echo "mysqldump is already installed:"
  mysqldump --version
  exit 0
fi

echo "Updating package list..."
sudo apt-get update

echo "Installing default-mysql-client (mysqldump)..."
sudo apt-get install -y --no-install-recommends default-mysql-client

echo ""
echo "mysqldump installed successfully!"
mysqldump --version

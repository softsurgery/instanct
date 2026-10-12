#!/bin/bash

# Exit on any error
set -e

echo "Updating package list..."
sudo apt update

echo "Installing libatomic1..."
sudo apt install -y libatomic1

echo ""
echo "libatomic1 installed successfully!"

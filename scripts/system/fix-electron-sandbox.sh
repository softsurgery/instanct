#!/bin/bash

# Exit on any error
set -e

echo "Applying AppArmor unprivileged user namespaces fix for Electron/Chromium apps..."

# Apply the fix for the current session
sudo sysctl -w kernel.apparmor_restrict_unprivileged_userns=0

echo ""
echo "Fix applied successfully for this session!"
echo ""
echo "Note: If you restart your server, this setting will revert."
echo "To make this permanent, run this command instead:"
echo "  echo 'kernel.apparmor_restrict_unprivileged_userns=0' | sudo tee /etc/sysctl.d/99-userns.conf && sudo sysctl -p /etc/sysctl.d/99-userns.conf"
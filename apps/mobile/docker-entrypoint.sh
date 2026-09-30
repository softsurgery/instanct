#!/bin/sh
set -e

# Expo login authentication before start
if [ -n "$EXPO_TOKEN" ]; then
  echo "==> Authenticating Expo CLI using EXPO_TOKEN..."
  npx expo whoami || true
elif [ -n "$EXPO_USERNAME" ] && [ -n "$EXPO_PASSWORD" ]; then
  echo "==> Logging into Expo as '$EXPO_USERNAME'..."
  if [ -n "$EXPO_OTP" ]; then
    printf '%s\n' "$EXPO_PASSWORD" | npx expo login -u "$EXPO_USERNAME" -p - --otp "$EXPO_OTP" || echo "Warning: Expo login failed."
  else
    printf '%s\n' "$EXPO_PASSWORD" | npx expo login -u "$EXPO_USERNAME" -p - || echo "Warning: Expo login failed."
  fi
elif [ -n "$EXPO_USER" ] && [ -n "$EXPO_PASS" ]; then
  echo "==> Logging into Expo as '$EXPO_USER'..."
  printf '%s\n' "$EXPO_PASS" | npx expo login -u "$EXPO_USER" -p - || echo "Warning: Expo login failed."
else
  echo "==> No EXPO_TOKEN or EXPO_USERNAME/EXPO_PASSWORD provided; skipping automated Expo login."
fi

exec "$@"

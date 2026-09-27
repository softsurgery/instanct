#!/bin/sh
set -eu

enable_https() {
  if [ -f /etc/letsencrypt/live/instanct.com/fullchain.pem ]; then
    cp /opt/nginx/https.conf /etc/nginx/https.conf
    touch /etc/nginx/https.enabled
  else
    : > /etc/nginx/https.conf
    rm -f /etc/nginx/https.enabled
  fi
}

enable_https

(
  while true; do
    sleep 21600
    if [ -f /etc/letsencrypt/live/instanct.com/fullchain.pem ]; then
      cp /opt/nginx/https.conf /etc/nginx/https.conf
      touch /etc/nginx/https.enabled
    fi
    nginx -s reload || true
  done
) &

exec nginx -g 'daemon off;'

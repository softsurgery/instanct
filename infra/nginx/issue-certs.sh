#!/bin/sh
set -eu

cd "$(dirname "$0")"

domains=""
while IFS= read -r domain || [ -n "$domain" ]; do
  case "$domain" in
    ""|\#*) continue ;;
  esac
  domains="$domains -d $domain"
done < domains.txt

docker compose -f docker-compose.yml run --rm --entrypoint certbot certbot-renew \
  certonly \
  --webroot -w /var/www/certbot \
  --email hello@instanct.com \
  --agree-tos \
  --no-eff-email \
  --keep-until-expiring \
  --non-interactive \
  $domains

docker compose -f docker-compose.yml exec nginx \
  sh -c 'cp /opt/nginx/https.conf /etc/nginx/https.conf && touch /etc/nginx/https.enabled && nginx -t && nginx -s reload'

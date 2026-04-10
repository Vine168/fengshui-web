#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# setup-server.sh
# Run this ONCE on your fresh Ubuntu server to prepare it for fengshui-web
#
# Usage:
#   chmod +x setup-server.sh
#   sudo bash setup-server.sh
# ─────────────────────────────────────────────────────────────────────────────

set -e  # exit on any error

echo "========================================"
echo "  fengshui-web Ubuntu Server Setup"
echo "========================================"

# ─── 1. System update ───────────────────────────────────────────────────────
echo "[1/7] Updating system packages..."
apt update && apt upgrade -y

# ─── 2. Install Nginx ───────────────────────────────────────────────────────
echo "[2/7] Installing Nginx..."
apt install -y nginx

systemctl enable nginx
systemctl start nginx
echo "      Nginx installed and started."

# ─── 3. Install Certbot (for HTTPS / SSL) ───────────────────────────────────
echo "[3/7] Installing Certbot..."
apt install -y certbot python3-certbot-nginx

# ─── 4. Create web directories ──────────────────────────────────────────────
echo "[4/7] Creating web directories..."

# Production
mkdir -p /var/www/fengshui-web
chown -R www-data:www-data /var/www/fengshui-web
chmod -R 755 /var/www/fengshui-web

# Staging
mkdir -p /var/www/fengshui-staging
chown -R www-data:www-data /var/www/fengshui-staging
chmod -R 755 /var/www/fengshui-staging

# Give current user write permission so GitHub Actions (scp) can deploy
CURRENT_USER=${SUDO_USER:-$(whoami)}
usermod -aG www-data $CURRENT_USER
chown -R $CURRENT_USER:www-data /var/www/fengshui-web
chown -R $CURRENT_USER:www-data /var/www/fengshui-staging

echo "      Directories created."

# ─── 5. Setup Nginx site config ─────────────────────────────────────────────
echo "[5/7] Setting up Nginx site config..."

# Copy nginx config from deploy folder (run this from the project root)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [ -f "$SCRIPT_DIR/nginx.conf" ]; then
    cp "$SCRIPT_DIR/nginx.conf" /etc/nginx/sites-available/fengshui-web

    # Enable the site
    ln -sf /etc/nginx/sites-available/fengshui-web /etc/nginx/sites-enabled/fengshui-web

    # Remove default nginx site
    rm -f /etc/nginx/sites-enabled/default

    nginx -t && systemctl reload nginx
    echo "      Nginx site configured."
else
    echo "      [SKIP] nginx.conf not found at $SCRIPT_DIR/nginx.conf"
    echo "      Manually copy deploy/nginx.conf to /etc/nginx/sites-available/fengshui-web"
fi

# ─── 6. Setup SSH authorized key for GitHub Actions ─────────────────────────
echo "[6/7] SSH key setup reminder..."
echo ""
echo "  To allow GitHub Actions to deploy via SSH:"
echo ""
echo "  1. On your LOCAL machine, generate a deploy key:"
echo "     ssh-keygen -t ed25519 -C 'github-actions' -f ~/.ssh/fengshui_deploy -N ''"
echo ""
echo "  2. Copy public key to this server:"
echo "     ssh-copy-id -i ~/.ssh/fengshui_deploy.pub $CURRENT_USER@<this-server-ip>"
echo "     OR manually append to: ~/.ssh/authorized_keys"
echo ""
echo "  3. Copy private key content to GitHub Secrets:"
echo "     cat ~/.ssh/fengshui_deploy     <- paste this into PROD_SSH_KEY"
echo ""

# ─── 7. Configure UFW firewall ──────────────────────────────────────────────
echo "[7/7] Configuring firewall (UFW)..."
apt install -y ufw
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable
echo "      Firewall configured: SSH + HTTP/HTTPS allowed."

echo ""
echo "========================================"
echo "  Setup complete!"
echo "========================================"
echo ""
echo "Next steps:"
echo "  1. Edit /etc/nginx/sites-available/fengshui-web"
echo "     Replace 'yourdomain.com' with your actual domain"
echo ""
echo "  2. Add GitHub Secrets in your repo:"
echo "     PROD_SERVER_HOST   = $(curl -s ifconfig.me 2>/dev/null || echo '<your-server-ip>')"
echo "     PROD_SERVER_USER   = $CURRENT_USER"
echo "     PROD_SSH_KEY       = <private key content>"
echo "     PROD_API_BASE_URL  = https://yourdomain.com/api/v1"
echo "     DEV_SERVER_HOST    = <staging-server-ip>"
echo "     DEV_SERVER_USER    = <staging-user>"
echo "     DEV_SSH_KEY        = <staging private key>"
echo "     DEV_API_BASE_URL   = https://staging.yourdomain.com/api/v1"
echo ""
echo "  3. Setup HTTPS (after domain DNS is pointed to this server):"
echo "     sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com"
echo ""

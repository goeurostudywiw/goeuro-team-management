# 🚀 GOEURO Team Management & Public Portal
## Oracle Cloud Always Free VPS — Production Deployment Guide

This guide details the complete, step-by-step process to deploy GOEURO onto an **Oracle Cloud Always Free (ARM Ampere) VPS** with **$0 monthly hosting cost**, persistent database, automated SSL certificates, and high performance.

---

## 📋 1. Oracle Cloud Account & Server Setup (Prerequisites)

### Step 1.1: Create Account
1. Visit **[cloud.oracle.com](https://cloud.oracle.com)** and sign up for an Oracle Cloud Free Tier account.
2. **Home Region**: Choose **Singapore (ap-singapore-1)** or **Tokyo** (lowest latency to Myanmar) or **Frankfurt** (if prioritizing Germany).
3. Complete credit/debit card verification ($1 temporary authorization, refunded immediately).

### Step 1.2: Create Compute Instance (Always Free)
1. Go to **Compute** → **Instances** → **Create Instance**.
2. **Name**: `goeuro-prod-server`
3. **Placement**: Default AD
4. **Image and Shape**:
   - **Image**: Click *Change Image* → Select **Ubuntu 22.04 LTS** (or 24.04 LTS)
   - **Shape**: Click *Change Shape* → Select **Ampere (ARM)** → `VM.Standard.A1.Flex`
   - Set **OCPUs**: `2` or `4` (Always Free allows up to 4 OCPUs)
   - Set **Memory (RAM)**: `12 GB` or `24 GB` (Always Free allows up to 24 GB RAM)
5. **Networking**: Create new Virtual Cloud Network (VCN) with public subnet.
6. **SSH Keys**: Download both the Private Key (`.key`) and Public Key to your computer.
7. **Boot Volume**: Specify `100 GB` (Free tier allows up to 200 GB SSD).
8. Click **Create** and wait 1–2 minutes for the Instance state to turn **RUNNING (Green)**.
9. Note down your **Public IPv4 Address** (e.g., `150.136.xx.xx`).

---

## 🔒 2. Oracle Cloud Firewall Configuration (Crucial Step!)

By default, Oracle Cloud blocks all ports except Port 22 (SSH). You must open Port 80 and Port 443 in the Oracle Web Console:

1. In the Instance details, click on your **Subnet** name (e.g., *subnet-2026...*).
2. Click on **Default Security List for...**.
3. Under **Ingress Rules**, click **Add Ingress Rules**:
   - **Rule 1 (HTTP)**:
     - Source CIDR: `0.0.0.0/0`
     - IP Protocol: `TCP`
     - Destination Port Range: `80`
     - Description: `HTTP Web Traffic`
   - **Rule 2 (HTTPS)**:
     - Source CIDR: `0.0.0.0/0`
     - IP Protocol: `TCP`
     - Destination Port Range: `443`
     - Description: `HTTPS Secure Web Traffic`
   - **Rule 3 (Optional: Coturn WebRTC Video)**:
     - Source CIDR: `0.0.0.0/0`
     - IP Protocol: `UDP`
     - Destination Port Range: `3478`
     - Description: `WebRTC STUN/TURN`
4. Click **Add Ingress Rules**.

---

## 🌐 3. Domain & DNS Records Configuration

Log in to your Domain Registrar (Cloudflare, Namecheap, GoDaddy, etc.) and add DNS records:

| Type | Name / Host | Target / Value | TTL |
| :--- | :--- | :--- | :--- |
| **A** | `@` (root) | `YOUR_ORACLE_PUBLIC_IP` | Auto / 300 |
| **A** | `www` | `YOUR_ORACLE_PUBLIC_IP` | Auto / 300 |

*(Wait 2–5 minutes for DNS propagation)*

---

## 💻 4. Server Initialization & Deployment (On VPS via SSH)

### Step 4.1: Connect to Server via SSH
From your local terminal (PowerShell or Mac/Linux terminal):
```bash
ssh -i "path/to/your-private-key.key" ubuntu@YOUR_ORACLE_PUBLIC_IP
```

### Step 4.2: Open Ubuntu OS Internal Firewall
Run the following commands on the server to allow web traffic past Ubuntu's internal iptables:
```bash
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT
sudo apt-get update && sudo apt-get install -y iptables-persistent
sudo netfilter-persistent save
```

### Step 4.3: Install Docker & Git
```bash
sudo apt update && sudo apt install -y docker.io docker-compose git
sudo usermod -aG docker ubuntu
# Apply new group membership:
newgrp docker
```

### Step 4.4: Clone Codebase to Server
```bash
git clone https://github.com/YOUR_ORGANIZATION/goeuro-team-management.git /home/ubuntu/goeuro
cd /home/ubuntu/goeuro
```

### Step 4.5: Configure Production Environment Variables
Create `.env` inside `/home/ubuntu/goeuro`:
```bash
cat << 'EOF' > .env
DATABASE_URL="file:/app/prisma/dev.db"
NEXT_PUBLIC_APP_URL="https://goeurostudy.com"
NEXT_PUBLIC_ENABLE_DEMO="false"
EOF
```
*(Replace `https://goeurostudy.com` with your real domain)*

### Step 4.6: Launch Application Stack with Docker Compose
```bash
docker-compose up -d --build
```
This builds the Next.js production container, sets up Nginx reverse proxy, and connects SQLite volume persistence.

---

## 📜 5. Automated Free SSL Certificate (Let's Encrypt)

Once your DNS points to your server and the app is running on port 80:

```bash
docker-compose run --rm certbot certonly --webroot --webroot-path /var/www/certbot -d goeurostudy.com -d www.goeurostudy.com
```

Then edit `nginx/default.conf` to uncomment the HTTPS block and reload Nginx:
```bash
docker-compose restart nginx
```
Your website is now **100% live with valid HTTPS/SSL padlock**, fast response times, and $0 monthly server costs!

---

## 💾 6. Automated Daily Database Backup (Cron Job)

To ensure student cases and financial ledgers are 100% safe:

Run `crontab -e` on the VPS and add this line:
```cron
0 2 * * * cp /home/ubuntu/goeuro/prisma/dev.db /home/ubuntu/backups/dev_$(date +\%Y\%m\%d).db
```
*(Automatically creates a daily timestamped backup of the SQLite database every night at 2:00 AM)*

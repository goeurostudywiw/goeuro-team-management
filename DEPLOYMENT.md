# GOEURO STUDY Web Platform — Production Deployment & Hosting Guide
**Version 1.2 Compliant • September 2026**

This complete guide explains how to host the **GOEURO STUDY** corporate web platform and internal team operations portal publicly on the internet.

---

## 🌟 Quick Overview: Hosting Options

| Hosting Platform | Difficulty | Estimated Cost | Best For | Recommended |
|---|---|---|---|---|
| **Railway.app** | 🟢 Very Easy (5 mins) | Free trial / ~$5/mo | Fastest setup, automatic HTTPS, Git deploy | ⭐️ **Top Pick** |
| **Render.com** | 🟢 Very Easy (5 mins) | Free tier / ~$7/mo | 1-Click GitHub connect, free SSL certificate | ⭐️ **Great Choice** |
| **Ubuntu Linux VPS** | 🟡 Intermediate (15 mins) | $4 - $6/mo (Hetzner, DigitalOcean) | Full ownership, unlimited storage, custom domain | ⭐️ **Best for Long-term** |
| **Docker** | 🟡 Intermediate | Any VPS / Server | Containerized portable deployment | Enterprise |

---

## 🇲🇲 မြန်မာလို အဆင့်ဆင့် လမ်းညွှန်ချက် (Step-by-Step Burmese Guide)

### ရွေးချယ်မှု ၁ - Railway သို့မဟုတ် Render (အလွယ်ဆုံးနှင့် အမြန်ဆုံး ၅ မိနစ်အတွင်း လွှင့်နည်း)
အကယ်၍ သင်သည် Server command တွေမသုံးချင်ဘဲ GitHub ကနေ ၁-Click ဖြင့် အင်တာနက်ပေါ် လွှင့်လိုပါက **Railway.app** သို့မဟုတ် **Render.com** ကို ရွေးချယ်ပါ။

#### အဆင့် ၁ - GitHub ပေါ်သို့ Code တင်ပါ
1. သင့်ကွန်ပျူတာပေါ်ရှိ GOEURO Team Management folder ကို GitHub Repository အသစ်တစ်ခုဆောက်ပြီး `git push` လုပ်ပါ။

#### အဆင့် ၂ - Render / Railway တွင် အကောင့်ဖွင့်ပြီး ချိတ်ပါ
1. [render.com](https://render.com) သို့မဟုတ် [railway.app](https://railway.app) တွင် GitHub ဖြင့် Login ဝင်ပါ။
2. **"New Web Service"** ကို နှိပ်ပြီး ခုနကတင်ထားသော GOEURO repository ကို ရွေးပါ။

#### အဆင့် ၃ - Setting များ ဖြည့်ပါ
- **Name**: `goeuro-study`
- **Environment**: `Node`
- **Region**: `Singapore` (မြန်မာနိုင်ငံမှ ဝင်ရောက်ကြည့်ရှုရာတွင် အမြန်ဆုံးဖြစ်စေရန်)
- **Branch**: `main`
- **Build Command**:
  ```bash
  npm install && npm run build
  ```
- **Start Command**:
  ```bash
  npm start
  ```

#### အဆင့် ၄ - Environment Variables ထည့်ပါ
Environment Variables tab တွင် အောက်ပါတို့ကို ထည့်ပေးပါ:
- `DATABASE_URL`: `file:./prisma/dev.db`
- `NODE_ENV`: `production`
- `NEXT_PUBLIC_APP_URL`: သင့် Render / Railway ကပေးသော URL (ဥပမာ `https://goeuro-study.onrender.com` သို့မဟုတ် သင့်ကိုယ်ပိုင် domain)

#### အဆင့် ၅ - Persistent Disk ချိတ်ပါ (အလွန်အရေးကြီးသည်!)
Student dossier အချက်အလက်များ၊ meeting attendance snapshots (ဓာတ်ပုံများ) နှင့် consultation recordings များ ဆာဗာ restart ဖြစ်သွားသည့်အခါ မပျောက်စေရန်:
- Render တွင် **Disks** section သို့သွားပြီး **"Add Disk"** ကို နှိပ်ပါ။
- **Mount Path**: `/app/prisma` (1 GB လုံလောက်ပါသည်)
- ထို့နောက် ဒုတိယ Disk တစ်ခုထပ်ထည့်ပါ: **Mount Path**: `/app/public/uploads` (5 GB - 10 GB)

#### အဆင့် ၆ - "Create Web Service" နှိပ်ပြီး စတင်သုံးစွဲပါ
- ၃ မိနစ်ခန့် build ပြီးသည်နှင့် သင့် Web Platform သည် ကမ္ဘာအနှံ့မှ ချက်ချင်း ဝင်ရောက်ကြည့်ရှုနိုင်မည်ဖြစ်ပြီး SSL (https://) အလိုအလျောက် ရရှိပါမည်။

---

### ရွေးချယ်မှု ၂ - Linux VPS ဖြင့် လွှင့်နည်း (Ubuntu 22.04 / 24.04 LTS)
Hetzner, DigitalOcean, Linode, AWS EC2 တို့တွင် တိုက်ရိုက် host ပြုလုပ်နည်းဖြစ်ပါသည်။

#### အဆင့် ၁ - VPS ထဲသို့ SSH ဝင်ပြီး Node.js 20 သွင်းပါ
```bash
# Update server packages
sudo apt update && sudo apt upgrade -y

# Install Node.js 20 LTS & Git
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs git build-essential nginx

# Verify versions
node -v # Should be v20.x
npm -v
```

#### အဆင့် ၂ - Code ရယူပြီး Dependencies သွင်းပါ
```bash
# Go to web directory
cd /var/www
git clone <YOUR_GIT_REPO_URL> goeuro
cd goeuro

# Install dependencies
npm install
```

#### အဆင့် ၃ - Database Setup & Initial Seed ပြုလုပ်ပါ
```bash
# Initialize SQLite database schema
npx prisma db push

# Seed initial system users (Founder, Admin, Counselors)
npm run db:seed
```

#### အဆင့် ၄ - Next.js Production Build ပြုလုပ်ပါ
```bash
npm run build
```

#### အဆင့် ၅ - PM2 Process Manager ဖြင့် အမြဲ Run ထားပါ
Server ပိတ်သွားခြင်း၊ restart ကျသွားခြင်းများ ဖြစ်ပေါ်ပါက auto ပြန်တက်စေရန် PM2 ကို သုံးပါ:
```bash
# Install PM2 globally
sudo npm install -g pm2

# Start GOEURO Application
pm2 start npm --name "goeuro-web" -- start

# Save PM2 process list and configure auto-start on boot
pm2 save
pm2 startup
```

#### အဆင့် ၆ - Nginx Reverse Proxy ချိတ်ပါ
Nginx config ဖိုင် ဖန်တီးပါ:
```bash
sudo nano /etc/nginx/sites-available/goeuro
```
အောက်ပါ code ကို ကူးထည့်ပါ (domain name နေရာတွင် မိမိ domain ထည့်ပါ):
```nginx
server {
    listen 80;
    server_name study.goeuro.de your-domain.com;

    client_max_body_size 100M;

    location / {
        proxy_pass http://127.0.0.1:3005;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```
Activate လုပ်ပြီး Nginx reload ပြုလုပ်ပါ:
```bash
sudo ln -s /etc/nginx/sites-available/goeuro /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### အဆင့် ၇ - အခမဲ့ Free SSL (HTTPS) သွင်းပါ
Certbot ဖြင့် Let's Encrypt Free SSL ကို ၁ မိနစ်အတွင်း တပ်ဆင်နိုင်ပါသည်:
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## 🐳 ရွေးချယ်မှု ၃ - Docker ဖြင့် Run နည်း

Code ထဲတွင် Multi-stage production `Dockerfile` အသင့်ပါဝင်ပြီးဖြစ်ပါသည်။

```bash
# 1. Build Docker Image
docker build -t goeuro-study:v1.2 .

# 2. Run Container with Persistent Data Volumes
docker run -d \
  -p 3005:3005 \
  -v /var/data/goeuro/prisma:/app/prisma \
  -v /var/data/goeuro/uploads:/app/public/uploads \
  --restart unless-stopped \
  --name goeuro-app \
  goeuro-study:v1.2
```

---

## ⚙️ Environment Variables Reference

| Variable | Required | Default | Description |
|---|---|---|---|
| `PORT` | Optional | `3005` | Port number the Next.js server listens on |
| `DATABASE_URL` | Yes | `"file:./prisma/dev.db"` | SQLite database connection string or PostgreSQL URL |
| `NEXT_PUBLIC_APP_URL` | Yes | `http://localhost:3005` | Public canonical URL of your website |
| `NODE_ENV` | Yes | `"production"` | Runtime environment mode |
| `NEXT_PUBLIC_ICE_SERVERS` | Optional | Google Public STUN | Custom STUN/TURN server configuration for WebRTC video |

---

## 🔒 Security & Backup Recommendations

1. **Daily Database Backup**:
   - `prisma/dev.db` ဖိုင်ကို နေ့စဉ် backup လုပ်ပါ (ဥပမာ cron job ဖြင့် Google Drive သို့မဟုတ် S3 သို့ sync လုပ်ထားပါ)။
2. **Media Dossier Storage**:
   - `public/uploads/` ဖိုင်တွဲသည် ကျောင်းသားများနှင့် counselor များ၏ consultation snapshots များနှင့် audio/video recordings များကို သိမ်းဆည်းထားသဖြင့် backup ပုံမှန်ယူပါ။
3. **Founder / Super Admin Initial Credentials**:
   - Seeding ပြီးပါက `/settings` မှတစ်ဆင့် default passwords များကို ပြောင်းလဲသတ်မှတ်ပါ။

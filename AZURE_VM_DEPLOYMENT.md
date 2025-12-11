# Azure VM Deployment Guide

This guide walks you through deploying the teachRelief backend on an Azure Virtual Machine using Docker.

## Prerequisites

- Azure account with active subscription
- SSH key pair (or ability to generate one)
- Domain name (optional, for HTTPS)

---

## Step 1: Create an Azure VM

### Via Azure Portal (Web UI)

1. **Go to [portal.azure.com](https://portal.azure.com)** and sign in

2. **Click "Create a resource"** → Search for "Virtual Machine" → Click "Create"

3. **Basics Tab:**
   | Field | Value |
   |-------|-------|
   | Subscription | Your subscription |
   | Resource group | Create new: `teachrelief-rg` |
   | Virtual machine name | `teachrelief-vm` |
   | Region | Choose closest to your users |
   | Image | **Ubuntu Server 22.04 LTS - x64 Gen2** |
   | Size | **Standard_B2ms** (2 vCPU, 8GB RAM) - Click "See all sizes" |
   | Authentication | SSH public key (recommended) |
   | Username | `azureuser` |
   | SSH public key | Paste your public key or generate new |

4. **Disks Tab:**
   - OS disk type: **Standard SSD** (or Premium for better performance)
   - Size: **64 GB minimum** (for Docker images)

5. **Networking Tab:**
   - Virtual network: Create new or use existing
   - Public IP: Create new
   - NIC NSG: Basic
   - Public inbound ports: **Allow SSH (22)**

6. **Review + Create** → Click **Create**

7. **Download the private key** if you generated a new one

---

## Step 2: Connect to Your VM

```bash
# Get your VM's public IP from Azure Portal (VM Overview page)
# Connect via SSH
ssh -i ~/.ssh/your-private-key.pem azureuser@<YOUR_VM_PUBLIC_IP>
```

---

## Step 3: Install Docker on the VM

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Docker
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Add your user to docker group (no sudo needed for docker commands)
sudo usermod -aG docker $USER

# Apply group changes (or logout and login again)
newgrp docker

# Verify Docker is working
docker --version
docker compose version
```

---

## Step 4: Configure Azure Network Security Group (NSG)

Open port 1000 for your backend API:

1. **Azure Portal** → Your VM → **Networking** (left sidebar)

2. Click **"Add inbound port rule"**:
   | Field | Value |
   |-------|-------|
   | Source | Any (or your frontend's IP for security) |
   | Source port ranges | * |
   | Destination | Any |
   | Destination port ranges | **1000** |
   | Protocol | TCP |
   | Action | Allow |
   | Priority | 100 |
   | Name | `Allow-Backend-1000` |

3. Click **Add**

---

## Step 5: Clone Your Repository & Deploy

```bash
# Install git if not present
sudo apt install -y git

# Clone your repository
git clone https://github.com/YOUR_USERNAME/teachRelief.git
cd teachRelief/teachRelief

# Create environment file
cp .env.example .env

# Edit environment variables with your actual values
nano .env
```

**Update these values in `.env`:**
```env
POSTGRES_PASSWORD=<strong-random-password>
JWT_SECRET=<at-least-32-character-random-string>
GEMINI_API_KEY=<your-actual-gemini-key>
CORS_ORIGIN=https://your-frontend-domain.com
```

---

## Step 6: Build and Start Services

```bash
# Build and start all containers (this takes 10-15 minutes first time)
docker compose up -d --build

# Watch the build progress
docker compose logs -f

# Once running, check status
docker compose ps
```

**Note:** The first OCR request will take longer as EasyOCR downloads language models (~100MB).

---

## Step 7: Run Database Migrations

```bash
# Run Prisma migrations to create database tables
docker compose exec backend npx prisma migrate deploy --schema=/app/packages/db/prisma/schema.prisma
```

---

## Step 8: Verify Deployment

```bash
# Check all containers are healthy
docker compose ps

# Test backend is responding
curl http://localhost:1000/api

# Check logs if something isn't working
docker compose logs backend
docker compose logs ocr
docker compose logs postgres
```

---

## Useful Commands

```bash
# Stop all services
docker compose down

# Restart a specific service
docker compose restart backend

# View real-time logs
docker compose logs -f backend

# SSH into backend container
docker compose exec backend sh

# Rebuild after code changes
docker compose up -d --build backend
```

---

## Optional: Set Up HTTPS with Nginx

For production, you should add HTTPS. Here's a quick nginx setup:

```bash
# Install nginx and certbot
sudo apt install -y nginx certbot python3-certbot-nginx

# Create nginx config
sudo nano /etc/nginx/sites-available/teachrelief
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:1000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Then:
```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/teachrelief /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Get SSL certificate (replace with your domain)
sudo certbot --nginx -d your-domain.com

# Auto-renewal is set up automatically
```

---

## Cost Estimate

| Resource | Monthly Cost (approx) |
|----------|----------------------|
| Standard_B2ms VM (2 vCPU, 8GB) | ~$60-70 |
| 64GB Standard SSD | ~$5 |
| Public IP | ~$3 |
| Bandwidth (100GB) | ~$8 |
| **Total** | **~$75-85/month** |

**Cost-saving tips:**
- Use **Azure Spot instances** for dev/test (up to 90% savings, but can be evicted)
- **Reserved instances** (1-year commitment) save ~30%
- **Stop the VM** when not in use (you only pay for storage)

---

## Troubleshooting

### Container won't start
```bash
# Check logs for errors
docker compose logs backend --tail=50
```

### OCR service out of memory
```bash
# Check memory usage
docker stats

# If needed, upgrade VM to Standard_B4ms (4 vCPU, 16GB RAM)
```

### Database connection refused
```bash
# Ensure postgres is healthy
docker compose ps postgres

# Check postgres logs
docker compose logs postgres
```

### Can't connect from internet
1. Verify NSG rule for port 1000 exists
2. Check VM's public IP is correct
3. Ensure backend is listening: `docker compose logs backend | grep "listening"`

### Prisma migration errors
```bash
# Check if database is accessible
docker compose exec backend npx prisma db push --schema=/app/packages/db/prisma/schema.prisma

# Or reset database (WARNING: deletes all data)
docker compose exec backend npx prisma migrate reset --schema=/app/packages/db/prisma/schema.prisma
```

---

## Architecture Overview

```
┌─────────────────────────────────────┐
│         Azure VM                    │
│  ┌───────────────────────────────┐  │
│  │    Docker Compose             │  │
│  │                               │  │
│  │  ┌──────────┐  ┌──────────┐  │  │
│  │  │ Backend  │  │   OCR    │  │  │
│  │  │ :1000    │  │  :8000   │  │  │
│  │  └────┬─────┘  └────┬─────┘  │  │
│  │       │             │        │  │
│  │       └──────┬──────┘        │  │
│  │              │               │  │
│  │         ┌────▼────┐          │  │
│  │         │ Postgres│          │  │
│  │         │  :5432  │          │  │
│  │         └─────────┘          │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
         ▲
         │
    Internet
    Port 1000
```

---

## Security Recommendations

1. **Use Azure Key Vault** for storing secrets (optional but recommended)
2. **Configure HTTPS** via nginx reverse proxy or Azure Application Gateway
3. **Restrict SSH access** with NSG rules (only allow your IP)
4. **Use private networking** for database access if using external DB
5. **Regular updates**: `sudo apt update && sudo apt upgrade -y`
6. **Firewall**: Consider using `ufw` to restrict ports
7. **Backup**: Set up automated backups for PostgreSQL data

---

## Next Steps

After successful deployment:

1. Test all API endpoints
2. Monitor resource usage: `docker stats`
3. Set up log aggregation (optional)
4. Configure monitoring alerts in Azure
5. Set up automated backups for database

---

## Support

If you encounter issues:
- Check container logs: `docker compose logs <service-name>`
- Verify environment variables: `docker compose exec backend env`
- Check network connectivity: `docker compose exec backend ping ocr`
- Review Azure VM metrics in the portal


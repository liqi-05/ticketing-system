# Deploying FairTix

This guide covers how to deploy the FairTix system to the cloud.

The simplest and most robust way to run this Dockerized application is using a **Virtual Private Server (VPS)** like a DigitalOcean Droplet.

## Option 1: DigitalOcean Droplet (Recommended)
This method gives you a full Linux server running your exact Docker environment.

### 1. Create a Droplet
1.  Log in to [DigitalOcean](https://cloud.digitalocean.com).
2.  Click **Create -> Droplets**.
3.  Choose an image: **Docker** (from the Marketplace tab) is easiest, or just standard Ubuntu.
4.  Choose a plan: **Basic ($6/mo)** is sufficient for this demo.
5.  Create the droplet.

### 2. Connect to the Server
Open your terminal (PowerShell or Command Prompt):
```powershell
ssh root@<YOUR_DROPLET_IP_ADDRESS>
```

### 3. Deploy the Code
Once inside the server (remote terminal):
```bash
# Clone your repository
git clone https://github.com/liqi-05/ticketing-system.git

# Enter the project directory
cd ticketing-system/ticketing-system

# Start the application
docker-compose up -d --build
```

### 4. Done!
Visit `http://<YOUR_DROPLET_IP_ADDRESS>:3000` in your browser.

## Option 2: Railway / Render (Alternative)
Since this is a multi-container setup (Frontend + Backend + Database + Redis), "Serverless" platforms like Vercel won't work easily.

Platform-as-a-Service (PaaS) providers like Railway can read `docker-compose.yml`, but you may need to configure the networking helper variables.

## Notes for Production
- **User Accounts**: The system is currently in "Demo Mode". Use the provided seeded accounts or the auto-generated guest accounts.
- **Database Persistence**: Data is stored in a Docker Volume. It persists across restarts but will be lost if you delete the volume.

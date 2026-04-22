# AWS EC2 MVP Deployment Guide

This guide describes how to deploy the Dockerized FreshOps AI stack onto a single AWS EC2 instance. This is a straightforward, single-instance Minimum Viable Product (MVP) deployment.

## Deployment Assumptions
- **Host Machine**: A single AWS EC2 instance running Ubuntu 24.04 LTS (or Amazon Linux 2023).
- **Orchestration**: Docker and Docker Compose are installed on the instance.
- **Data Persistence**: MongoDB Atlas provides data persistence remotely (no local database container).
- **Asset Storage**: AWS S3 holds the uploaded assets remotely.
- **Traffic**: The instance will serve both the backend API and the frontend static assets. No load balancer is attached for the MVP.

## Required Infrastructure Configuration

When launching the EC2 instance, carefully configure your **Security Group** to allow the necessary inbound traffic:

| Port | Protocol | Purpose                             | Source    |
|------|----------|-------------------------------------|-----------|
| `22` | TCP      | SSH access to manage the instance   | Your IP   |
| `80` | TCP      | Public access to the Web Interface  | 0.0.0.0/0 |
| `4000` | TCP    | Public access to the API Backend    | 0.0.0.0/0 |

*Important: If using a custom VPC architecture later, ensure outbound traffic allows access to AWS S3, Clarifai APIs, and MongoDB Atlas ports (typically 27017).*

## Required Environment Variables

Before starting the application, you must define the following secrets in the `/backend/.env` file on your EC2 instance. Without these, the backend's startup diagnostics will gracefully halt the server.

```env
# Server
PORT=4000
NODE_ENV=production
CORS_ORIGIN=*

# MongoDB
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/freshops

# Clarifai AI
CLARIFAI_PAT=<your_personal_access_token>
CLARIFAI_USER_ID=<user_id>
CLARIFAI_APP_ID=<app_id>
CLARIFAI_MODEL_ID=food-item-recognition

# AWS S3 Storage
AWS_REGION=<aws_region>
AWS_ACCESS_KEY_ID=<your_access_key>
AWS_SECRET_ACCESS_KEY=<your_secret_key>
AWS_S3_BUCKET=<your_bucket_name>
```

## Step-by-Step EC2 Setup

**1. Connect via SSH**
```bash
ssh -i /path/to/your-key.pem ubuntu@<ec2-public-ip>
```

**2. Install Docker & Docker Compose**
Execute the standard Docker installation for Linux (Ubuntu):
```bash
# Add Docker's official GPG key & Repo
sudo apt-get update
sudo apt-get install -y ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# (Optional) Add your user to the docker group
sudo usermod -aG docker $USER
```
*Note: If you add yourself to the docker group, log out and log back in.*

**3. Clone your Repository**
```bash
git clone https://github.com/Ayush277/FreshOpsAI.git
cd FreshOpsAI
```

**4. Prepare the Environment File**
```bash
nano backend/.env
# (Paste in the required environmental variables listed above)
```

**5. Deploy the Stack**
We use a combination of the main `docker-compose.yml` and the `docker-compose.prod.yml` override which maps the frontend to the public port `80` (instead of `8080` locally).

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

**6. Verify Deployment**
Check if everything is running successfully:
```bash
docker compose ps
docker compose logs -f backend
```
You can now access your application from your browser at `http://<ec2-public-ip>`.

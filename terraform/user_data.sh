#!/bin/bash
set -euo pipefail

# ============================================================================
# FreshOps AI - EC2 User Data Script
# This script runs when the EC2 instance starts for the first time
# It installs Docker, Docker Compose, AWS CLI, and prepares the environment
# ============================================================================

# Logging
exec > >(tee /var/log/user-data.log)
exec 2>&1

echo "========================================="
echo "FreshOps AI EC2 Initialization Started"
echo "========================================="
echo "Timestamp: $(date)"
echo "Environment: ${environment}"
echo "Region: ${aws_region}"

# Update system packages
echo "Updating system packages..."
apt-get update -y
apt-get upgrade -y

# Install Docker
echo "Installing Docker..."
apt-get install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

apt-get update -y
apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Start Docker service
systemctl start docker
systemctl enable docker

# Install Docker Compose (standalone)
echo "Installing Docker Compose..."
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
docker-compose --version

# Install AWS CLI
echo "Installing AWS CLI..."
apt-get install -y awscli

# Create application directory
echo "Creating application directory..."
mkdir -p /opt/freshops-ai
cd /opt/freshops-ai

# Create initial docker-compose configuration
cat > docker-compose.prod.yml << 'EOF'
name: freshops-ai-prod

services:
  backend:
    image: $${BACKEND_IMAGE}
    container_name: freshops-backend
    ports:
      - "4000:4000"
    environment:
      - NODE_ENV=production
      - MONGO_URL=$${MONGO_URL:-mongodb://mongo:27017/freshops}
      - AWS_REGION=$${AWS_DEFAULT_REGION}
    restart: unless-stopped
    networks:
      - freshops-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:4000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  frontend:
    image: $${FRONTEND_IMAGE}
    container_name: freshops-frontend
    ports:
      - "8080:80"
    depends_on:
      - backend
    restart: unless-stopped
    networks:
      - freshops-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:80"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

networks:
  freshops-network:
    driver: bridge
EOF

# Create .env file placeholder
cat > .env.prod << EOF
# FreshOps AI Production Environment
ENVIRONMENT=${environment}
AWS_REGION=${aws_region}
PROJECT_NAME=${project_name}
EOF

# Configure Docker to use JSON logging driver for CloudWatch
mkdir -p /etc/docker
cat > /etc/docker/daemon.json << 'EOF'
{
  "log-driver": "awslogs",
  "log-opts": {
    "awslogs-group": "/freshops-ai/prod",
    "awslogs-region": "${aws_region}",
    "awslogs-stream-prefix": "docker"
  }
}
EOF

systemctl daemon-reload
systemctl restart docker

# Add ubuntu user to docker group
usermod -aG docker ubuntu

# Create deployment script
cat > /opt/freshops-ai/deploy.sh << 'EOF'
#!/bin/bash
set -e

echo "========================================="
echo "FreshOps AI Deployment Started"
echo "========================================="
echo "Timestamp: $(date)"

cd /opt/freshops-ai

# Load environment variables
if [ -f .env.prod ]; then
    export $(cat .env.prod | grep -v '#' | xargs)
fi

echo "Pulling latest Docker images from ECR..."
aws ecr get-login-password --region $${AWS_DEFAULT_REGION} | \
  docker login --username AWS --password-stdin $${ECR_REGISTRY}

echo "Stopping existing containers..."
docker-compose -f docker-compose.prod.yml down || true

echo "Pulling and starting new containers..."
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d

echo "Waiting for services to start..."
sleep 10

echo "Checking service health..."
echo "Frontend Health:"
curl -f http://localhost:8080 || echo "Frontend still starting..."

echo "Backend Health:"
curl -f http://localhost:4000/health || echo "Backend still starting..."

echo "========================================="
echo "Deployment completed!"
echo "========================================="
docker ps

EOF

chmod +x /opt/freshops-ai/deploy.sh

# Install CloudWatch agent
echo "Installing CloudWatch agent..."
wget https://s3.amazonaws.com/amazoncloudwatch-agent/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb
dpkg -i -E ./amazon-cloudwatch-agent.deb

# Create cron job for log cleanup
echo "Setting up log rotation..."
cat > /etc/logrotate.d/freshops-ai << EOF
/var/log/user-data.log {
    daily
    rotate 7
    compress
    delaycompress
    notifempty
    create 0644 root root
}
EOF

# Final summary
echo ""
echo "========================================="
echo "EC2 Initialization Completed"
echo "========================================="
echo "Docker Version: $(docker --version)"
echo "Docker Compose Version: $(docker-compose --version)"
echo "AWS CLI Version: $(aws --version)"
echo "Application Directory: /opt/freshops-ai"
echo "Deploy Script: /opt/freshops-ai/deploy.sh"
echo "========================================="

# Mark initialization as complete
touch /var/lib/cloud/instance/boot-finished

echo "User data script completed at $(date)"

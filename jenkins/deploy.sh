#!/usr/bin/env bash

# ==============================================================================
# FreshOps AI - Jenkins Deployment Helper Script
# This script is executed by the Jenkins Jenkinsfile during the Deploy stage.
# It assumes Docker images are pushed to a registry and deployed to AWS EC2.
# ==============================================================================

# Exit immediately if a command exits with a non-zero status
set -e

# Disable interactive prompts for SSH
export SSH_ARGS="-o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -o PasswordAuthentication=no -o BatchMode=yes"

# Validate required variables
if [ -z "$EC2_HOST" ] || [ -z "$EC2_USER" ] || [ -z "$SSH_KEY_PATH" ]; then
    echo "============================================================"
    echo "⚠️ SKIPPING REMOTE DEPLOYMENT"
    echo "EC2_HOST, EC2_USER, or SSH_KEY_PATH environment variables are not set."
    echo "Configure these credentials in your Jenkins environment to deploy."
    echo "============================================================"
    exit 0
fi

echo "🚀 Initiating deployment to ${EC2_USER}@${EC2_HOST}..."

# 1. Create a deployment directory on the EC2 instance
echo "📂 Preparing deployment directory..."
ssh -i "$SSH_KEY_PATH" $SSH_ARGS "${EC2_USER}@${EC2_HOST}" "mkdir -p ~/freshops-ai-deploy"

# 2. Securely copy the Compose orchestration files to the instance
echo "📦 Transferring docker-compose files..."
scp -i "$SSH_KEY_PATH" $SSH_ARGS \
    docker-compose.yml docker-compose.prod.yml \
    "${EC2_USER}@${EC2_HOST}:~/freshops-ai-deploy/"

# 3. SSH into the instance to execute the deployment
echo "🚢 Pulling and restarting containers on the host..."
ssh -i "$SSH_KEY_PATH" $SSH_ARGS "${EC2_USER}@${EC2_HOST}" << 'EOF'
    # Exit if any command on the remote server fails
    set -e

    cd ~/freshops-ai-deploy

    # NOTE: Assuming the `.env` file containing AWS / DB secrets is securely 
    # maintained on the EC2 host at ~/freshops-ai-deploy/.env
    if [ ! -f .env ]; then
        echo "⚠️ Warning: .env file not found in the deployment directory!"
    fi

    # Optional: Log into Docker Hub/ECR if images are private 
    # (Requires DOCKER_USER and DOCKER_PASS variables injected)
    # echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin

    echo "⬇️ Pulling latest images..."
    # Suppress warnings if local image builds weren't pushed during testing
    docker compose -f docker-compose.yml -f docker-compose.prod.yml pull || true

    echo "🔄 Recreating and starting containers..."
    docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --force-recreate

    echo "🧹 Pruning old dangling images to save disk space..."
    docker image prune -a -f --filter "until=24h"

    echo "✅ Containers are up and running!"
EOF

echo "🎉 Deployment script completed successfully."

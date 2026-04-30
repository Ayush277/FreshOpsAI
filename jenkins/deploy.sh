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

REMOTE_DIR="${REMOTE_DIR:-/home/${EC2_USER}/freshops-ai-deploy}"

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
ssh -i "$SSH_KEY_PATH" $SSH_ARGS "${EC2_USER}@${EC2_HOST}" "mkdir -p '$REMOTE_DIR'"

# 2. Sync the application source to the instance
echo "📦 Transferring application source..."
rsync -az --delete \
    -e "ssh -i '$SSH_KEY_PATH' $SSH_ARGS" \
    --exclude '.git' \
    --exclude '.github' \
    --exclude 'node_modules' \
    --exclude 'frontend/node_modules' \
    --exclude 'backend/node_modules' \
    . "${EC2_USER}@${EC2_HOST}:$REMOTE_DIR/"

# 3. SSH into the instance to execute the deployment
echo "🚢 Pulling and restarting containers on the host..."
ssh -i "$SSH_KEY_PATH" $SSH_ARGS "${EC2_USER}@${EC2_HOST}" << EOF
    # Exit if any command on the remote server fails
    set -e

    cd "$REMOTE_DIR"

    # NOTE: The repository sync should include backend/.env or the server-local
    # environment file already present on the EC2 host.
    if [ ! -f .env ]; then
        echo "⚠️ Warning: .env file not found in the deployment directory!"
    fi

    echo "🔄 Recreating and starting containers..."
    docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build --remove-orphans

    echo "🔍 Container status..."
    docker compose -f docker-compose.yml -f docker-compose.prod.yml ps

    echo "🧹 Pruning old dangling images to save disk space..."
    docker image prune -a -f --filter "until=24h"

    echo "✅ Containers are up and running!"
EOF

echo "🎉 Deployment script completed successfully."

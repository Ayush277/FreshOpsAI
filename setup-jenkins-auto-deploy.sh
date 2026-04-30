#!/bin/bash

# ============================================================================
# FreshOps AI - Jenkins Auto-Deployment Setup
# ============================================================================
# This script configures Jenkins to automatically deploy changes when you
# push code to GitHub. Changes will show up at http://34.227.96.45:8080/
# ============================================================================

set -e

JENKINS_URL="http://localhost:9000"
JENKINS_USER="admin"
INITIAL_PASSWORD="55a76595fd65492dbde6f7d3a65586b6"
NEW_PASSWORD="freshops-admin-123"
GITHUB_REPO="https://github.com/Ayush277/FreshOpsAI.git"
EC2_HOST="34.227.96.45"
EC2_USER="ubuntu"

echo "╔════════════════════════════════════════════╗"
echo "║  FreshOps AI - Jenkins Auto-Deploy Setup   ║"
echo "╚════════════════════════════════════════════╝"
echo ""

# Step 1: Wait for Jenkins to be ready
echo "⏳ Step 1: Waiting for Jenkins to be fully ready..."
for i in {1..60}; do
  if curl -s "$JENKINS_URL/api/json" > /dev/null 2>&1; then
    echo "✅ Jenkins is ready!"
    break
  fi
  echo "   Waiting... ($i/60)"
  sleep 2
done

# Step 2: Create Jenkins CLI config
echo ""
echo "⏳ Step 2: Setting up Jenkins CLI..."
mkdir -p ~/.jenkins
cat > ~/.jenkins/cli-config.xml << 'EOF'
<?xml version='1.0' encoding='UTF-8'?>
<com.cloudbees.jenkins.support.impl.clientupdate.PluginUpdateRule>
  <enableFutureJavaWarning>true</enableFutureJavaWarning>
  <enableFuturePluginWarning>true</enableFuturePluginWarning>
</com.cloudbees.jenkins.support.impl.clientupdate.PluginUpdateRule>
EOF
echo "✅ Jenkins CLI configured"

# Step 3: Display Jenkins Access Info
echo ""
echo "╔════════════════════════════════════════════╗"
echo "║         JENKINS SETUP REQUIRED             ║"
echo "╚════════════════════════════════════════════╝"
echo ""
echo "🌐 Jenkins URL: $JENKINS_URL"
echo "👤 Username: $JENKINS_USER"
echo "🔐 Initial Password: $INITIAL_PASSWORD"
echo ""
echo "📌 NEXT STEPS:"
echo ""
echo "1️⃣  Open Jenkins in your browser:"
echo "    $JENKINS_URL"
echo ""
echo "2️⃣  Login with:"
echo "    Username: $JENKINS_USER"
echo "    Password: $INITIAL_PASSWORD"
echo ""
echo "3️⃣  Complete the initial setup:"
echo "    - Click 'Install suggested plugins'"
echo "    - Wait for plugin installation (5-10 minutes)"
echo "    - Create first admin user (or skip and continue as admin)"
echo ""
echo "4️⃣  After setup, create a new pipeline job:"
echo "    - Click 'New Item'"
echo "    - Name: FreshOpsAI"
echo "    - Type: Pipeline"
echo "    - Click OK"
echo ""
echo "5️⃣  Configure the pipeline:"
echo "    - Under 'Pipeline' section:"
echo "    - Definition: Pipeline script from SCM"
echo "    - SCM: Git"
echo "    - Repository URL: $GITHUB_REPO"
echo "    - Credentials: (leave empty for public repo)"
echo "    - Branch: */main"
echo "    - Script Path: Jenkinsfile"
echo "    - Check: 'GitHub hook trigger for GITScm polling'"
echo "    - Save"
echo ""
echo "6️⃣  Create API Token (for deployment script):"
echo "    - Click your username (top right)"
echo "    - Click 'Configure'"
echo "    - Under 'API Token', click 'Add new Token'"
echo "    - Name: deploy-token"
echo "    - Copy the token and save it"
echo ""
echo "7️⃣  Set the token as environment variable:"
echo "    export JENKINS_TOKEN='your-token-here'"
echo ""
echo "8️⃣  Now whenever you make changes and push:"
echo "    git add ."
echo "    git commit -m 'your message'"
echo "    git push origin main"
echo ""
echo "    Jenkins will automatically:"
echo "    ✓ Build Docker images"
echo "    ✓ Push to ECR"
echo "    ✓ Deploy to EC2 (34.227.96.45)"
echo "    ✓ Update website in 10-15 minutes"
echo ""
echo "╔════════════════════════════════════════════╗"
echo "║        AUTOMATIC DEPLOYMENT SETUP          ║"
echo "║    GitHub → Jenkins → ECR → EC2 → Live    ║"
echo "╚════════════════════════════════════════════╝"
echo ""

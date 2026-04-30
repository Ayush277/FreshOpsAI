#!/bin/bash

# ============================================================================
# FreshOps AI - Quick Setup Script
# ============================================================================
# Run this script to quickly set up Jenkins, AWS, and Terraform
# Prerequisites: Docker, AWS CLI, Terraform
# ============================================================================

set -euo pipefail

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
JENKINS_PORT=8080
AWS_REGION=us-east-1
PROJECT_NAME=freshops-ai
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo -e "${BLUE}╔════════════════════════════════════════════╗"
echo "║  FreshOps AI - Quick Setup                   ║"
echo "╚════════════════════════════════════════════╝${NC}"
echo ""

# Function to check command
check_command() {
    if ! command -v "$1" &> /dev/null; then
        echo -e "${RED}✗ $1 is not installed${NC}"
        return 1
    fi
    echo -e "${GREEN}✓ $1 is installed${NC}"
    return 0
}

# Function to print section
print_section() {
    echo ""
    echo -e "${YELLOW}▶▶▶ $1${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
}

# Check prerequisites
print_section "Checking Prerequisites"

MISSING_TOOLS=0
check_command "docker" || MISSING_TOOLS=1
check_command "aws" || MISSING_TOOLS=1
check_command "terraform" || MISSING_TOOLS=1
check_command "git" || MISSING_TOOLS=1

if [ $MISSING_TOOLS -eq 1 ]; then
    echo -e "${RED}Please install missing tools and try again${NC}"
    echo "Installation guide:"
    echo "  Docker: https://docs.docker.com/get-docker/"
    echo "  AWS CLI: https://aws.amazon.com/cli/"
    echo "  Terraform: https://www.terraform.io/downloads"
    echo "  Git: https://git-scm.com/downloads"
    exit 1
fi

# Verify AWS credentials
print_section "Verifying AWS Credentials"

if aws sts get-caller-identity &>/dev/null; then
    AWS_ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
    echo -e "${GREEN}✓ AWS credentials verified${NC}"
    echo "Account: $AWS_ACCOUNT"
else
    echo -e "${RED}✗ AWS credentials not configured${NC}"
    echo "Run: aws configure"
    exit 1
fi

# Option 1: Start Jenkins
print_section "Starting Jenkins Server"

echo "Starting Jenkins container..."
JENKINS_CONTAINER_ID=$(docker ps -aq -f "name=jenkins" 2>/dev/null)

if [ -n "$JENKINS_CONTAINER_ID" ]; then
    echo -e "${YELLOW}Jenkins container already exists, removing...${NC}"
    docker rm -f "$JENKINS_CONTAINER_ID"
fi

docker run -d \
    --name jenkins \
    -p $JENKINS_PORT:8080 \
    -p 50000:50000 \
    -v jenkins_home:/var/jenkins_home \
    -v /var/run/docker.sock:/var/run/docker.sock \
    -e JAVA_OPTS="-Xmx1024m" \
    jenkins/jenkins:lts-alpine

echo -e "${GREEN}✓ Jenkins started${NC}"
echo "URL: http://localhost:$JENKINS_PORT"

# Get initial password
print_section "Jenkins Initial Setup"

echo "Waiting for Jenkins to start..."
sleep 10

JENKINS_PASSWORD=$(docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword 2>/dev/null || echo "PASSWORD_NOT_READY")

if [ "$JENKINS_PASSWORD" != "PASSWORD_NOT_READY" ]; then
    echo -e "${GREEN}✓ Jenkins is ready${NC}"
    echo "Initial Admin Password: $JENKINS_PASSWORD"
    echo "Save this password - you'll need it on first login"
else
    echo -e "${YELLOW}Jenkins still initializing, check logs later${NC}"
    echo "Command: docker logs jenkins"
fi

# Setup AWS credentials in Jenkins
print_section "Setting Up AWS Access"

echo "Create IAM user for Jenkins..."
echo "Run these commands:"
echo ""
echo "  aws iam create-user --user-name jenkins-ci"
echo "  aws iam create-access-key --user-name jenkins-ci"
echo "  aws iam attach-user-policy --user-name jenkins-ci --policy-arn arn:aws:iam::aws:policy/AdministratorAccess"
echo ""
echo "Save the Access Key ID and Secret Access Key"
echo "You'll need these in Jenkins Credentials configuration"

# Create SSH key pair
print_section "Creating SSH Key Pair"

if [ ! -f ~/.ssh/freshops-ai.pem ]; then
    echo "Creating EC2 key pair..."
    aws ec2 create-key-pair --key-name $PROJECT_NAME --region $AWS_REGION \
        --query 'KeyMaterial' --output text > ~/.ssh/freshops-ai.pem
    chmod 600 ~/.ssh/freshops-ai.pem
    echo -e "${GREEN}✓ Key pair created${NC}"
    echo "Location: ~/.ssh/freshops-ai.pem"
else
    echo -e "${YELLOW}Key pair already exists${NC}"
fi

# Setup S3 for Terraform state
print_section "Setting Up Terraform State Storage"

TIMESTAMP=$(date +%s)
S3_BUCKET="${PROJECT_NAME}-terraform-state-${TIMESTAMP}"

echo "Creating S3 bucket for Terraform state: $S3_BUCKET"
aws s3api create-bucket --bucket "$S3_BUCKET" --region $AWS_REGION

# Enable versioning
aws s3api put-bucket-versioning \
    --bucket "$S3_BUCKET" \
    --versioning-configuration Status=Enabled

# Block public access
aws s3api put-public-access-block \
    --bucket "$S3_BUCKET" \
    --public-access-block-configuration \
    BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true

# Enable encryption
aws s3api put-bucket-encryption \
    --bucket "$S3_BUCKET" \
    --server-side-encryption-configuration '{"Rules": [{"ApplyServerSideEncryptionByDefault": {"SSEAlgorithm": "AES256"}}]}'

echo -e "${GREEN}✓ S3 bucket created${NC}"

# Create DynamoDB table
print_section "Creating DynamoDB Lock Table"

aws dynamodb create-table \
    --table-name terraform-lock \
    --attribute-definitions AttributeName=LockID,AttributeType=S \
    --key-schema AttributeName=LockID,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST \
    --region $AWS_REGION || echo "Table may already exist"

echo -e "${GREEN}✓ DynamoDB table ready${NC}"

# Initialize Terraform
print_section "Initializing Terraform"

cd "$SCRIPT_DIR/terraform"

terraform init \
    -backend-config="bucket=$S3_BUCKET" \
    -backend-config="key=${PROJECT_NAME}/terraform.tfstate" \
    -backend-config="region=$AWS_REGION" \
    -backend-config="dynamodb_table=terraform-lock"

echo -e "${GREEN}✓ Terraform initialized${NC}"

# Create terraform.tfvars
if [ ! -f terraform.tfvars ]; then
    cat > terraform.tfvars << EOF
aws_region      = "$AWS_REGION"
project_name    = "$PROJECT_NAME"
environment     = "prod"
instance_type   = "t3.micro"
key_name        = "$PROJECT_NAME"
bucket_name     = "${PROJECT_NAME}-uploads"
log_retention_days = 7
EOF
    echo -e "${GREEN}✓ terraform.tfvars created${NC}"
fi

# Display summary
print_section "Setup Complete!"

echo ""
echo -e "${BLUE}📋 Summary:${NC}"
echo ""
echo "Jenkins:"
echo "  URL: http://localhost:$JENKINS_PORT"
echo "  Initial Password: $JENKINS_PASSWORD"
echo ""
echo "AWS Resources:"
echo "  Region: $AWS_REGION"
echo "  Account: $AWS_ACCOUNT"
echo "  S3 Bucket (Terraform state): $S3_BUCKET"
echo "  SSH Key: ~/.ssh/freshops-ai.pem"
echo ""
echo "Next Steps:"
echo "  1. Complete Jenkins initial setup at http://localhost:$JENKINS_PORT"
echo "  2. Install required Jenkins plugins (see SETUP_GUIDE.md)"
echo "  3. Configure Jenkins credentials with AWS IAM user keys"
echo "  4. Create Jenkins pipeline job"
echo "  5. Test with: ./deploy.sh dev false $AWS_REGION"
echo ""
echo -e "${BLUE}📖 Full Setup Guide:${NC}"
echo "  Read: SETUP_GUIDE.md"
echo ""
echo -e "${GREEN}Happy Deploying! 🚀${NC}"
echo ""

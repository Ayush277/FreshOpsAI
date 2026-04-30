#!/bin/bash

# ============================================================================
# FreshOps AI - One-Click Automation Trigger Script
# ============================================================================
# This is the main trigger script that launches the Jenkins CI/CD pipeline
# Usage: ./deploy.sh [environment] [run-push-to-ecr] [run-deploy] [deploy-host] [aws-region]
# ============================================================================

set -euo pipefail

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(cd "$SCRIPT_DIR" && pwd)"
ENVIRONMENT="${1:-prod}"
RUN_PUSH_TO_ECR="${2:-false}"
RUN_DEPLOY="${3:-false}"
DEPLOY_HOST="${4:-}"
DEPLOY_USER="${5:-ubuntu}"
AWS_REGION="${6:-us-east-1}"
JENKINS_URL="${JENKINS_URL:-http://localhost:8080}"

# Functions
print_banner() {
    echo -e "${BLUE}"
    echo "╔════════════════════════════════════════════╗"
    echo "║  FreshOps AI - One-Click Deployment       ║"
    echo "║  Automated CI/CD Pipeline Trigger         ║"
    echo "╚════════════════════════════════════════════╝"
    echo -e "${NC}"
}

print_section() {
    echo ""
    echo -e "${YELLOW}▶▶▶ $1${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# Check prerequisites
check_prerequisites() {
    print_section "Checking Prerequisites"
    
    # Check Jenkins CLI availability
    if ! command -v jenkins-cli &> /dev/null; then
        print_error "Jenkins CLI not found. Installing..."
        # Install Jenkins CLI (or provide instructions)
    fi
    
    # Check Git
    if ! command -v git &> /dev/null; then
        print_error "Git is not installed!"
        exit 1
    fi
    print_success "Git is installed"
    
    # Check curl
    if ! command -v curl &> /dev/null; then
        print_error "curl is not installed!"
        exit 1
    fi
    print_success "curl is installed"
    
    # Check Docker (optional but recommended)
    if ! command -v docker &> /dev/null; then
        print_info "Docker is not installed (optional)"
    else
        print_success "Docker is installed"
    fi
}

# Validate configuration
validate_config() {
    print_section "Validating Configuration"
    
    # Validate environment
    if [[ ! $ENVIRONMENT =~ ^(dev|staging|prod)$ ]]; then
        print_error "Invalid environment: $ENVIRONMENT"
        print_info "Allowed values: dev, staging, prod"
        exit 1
    fi
    print_success "Environment: $ENVIRONMENT"
    
    # Validate AWS region
    print_info "AWS Region: $AWS_REGION"
    
    # Validate push flag
    if [[ ! $RUN_PUSH_TO_ECR =~ ^(true|false)$ ]]; then
        print_error "Invalid push flag: $RUN_PUSH_TO_ECR"
        exit 1
    fi
    print_success "Push to ECR: $RUN_PUSH_TO_ECR"

    # Validate deploy flag
    if [[ ! $RUN_DEPLOY =~ ^(true|false)$ ]]; then
        print_error "Invalid deploy flag: $RUN_DEPLOY"
        exit 1
    fi
    print_success "Deploy enabled: $RUN_DEPLOY"

    if [[ "$RUN_DEPLOY" == "true" && -z "$DEPLOY_HOST" ]]; then
        print_error "DEPLOY_HOST is required when RUN_DEPLOY is true"
        exit 1
    fi
}

# Prepare repository
prepare_repository() {
    print_section "Preparing Repository"
    
    cd "$PROJECT_ROOT"
    
    # Check if we're in a git repo
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        print_error "Not in a git repository!"
        exit 1
    fi
    
    # Get current branch
    CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
    print_info "Current branch: $CURRENT_BRANCH"
    
    # Check for uncommitted changes
    if ! git diff-index --quiet HEAD --; then
        print_error "Uncommitted changes detected!"
        echo "Please commit your changes before deploying"
        git status
        exit 1
    fi
    print_success "Repository is clean"
    
    # Get latest commit
    LATEST_COMMIT=$(git log -1 --pretty=%H)
    COMMIT_MESSAGE=$(git log -1 --pretty=%B)
    print_info "Latest commit: $LATEST_COMMIT"
    print_info "Commit message: $COMMIT_MESSAGE"
    
    # Ensure we have latest changes
    print_info "Pulling latest changes from remote..."
    git pull origin "$CURRENT_BRANCH" || print_info "Already up to date"
}

# Display deployment parameters
display_parameters() {
    print_section "Deployment Parameters"
    
    echo ""
    echo "Environment:       $ENVIRONMENT"
    echo "AWS Region:        $AWS_REGION"
    echo "Run Push to ECR:   $RUN_PUSH_TO_ECR"
    echo "Run Deploy:        $RUN_DEPLOY"
    echo "Deploy Host:       ${DEPLOY_HOST:-N/A}"
    echo "Jenkins URL:       $JENKINS_URL"
    echo "Repository Branch: $CURRENT_BRANCH"
    echo "Latest Commit:     ${LATEST_COMMIT:0:8}"
    echo ""
}

# Confirm deployment
confirm_deployment() {
    print_section "Confirmation Required"
    
    echo "Ready to trigger Jenkins pipeline with the above parameters?"
    echo ""
    echo -e "${YELLOW}⚠️  WARNING: This will:${NC}"
    echo "  • Trigger the Jenkins pipeline"
    echo "  • Clone/pull latest code from GitHub"
    echo "  • Build Docker images for frontend and backend"
    if [ "$RUN_PUSH_TO_ECR" = "true" ]; then
        echo "  • Push images to Amazon ECR"
    fi
    if [ "$RUN_DEPLOY" = "true" ]; then
        echo "  • Deploy application to an existing AWS host"
    fi
    echo ""
    
    read -p "Do you want to continue? (yes/no): " -r CONFIRMATION
    if [[ ! $CONFIRMATION =~ ^[Yy][Ee][Ss]$ ]]; then
        print_info "Deployment cancelled"
        exit 0
    fi
}

# Trigger Jenkins pipeline
trigger_jenkins_pipeline() {
    print_section "Triggering Jenkins Pipeline"
    
    # Build Jenkins API URL
    JENKINS_API_URL="${JENKINS_URL}/job/FreshOpsAI/buildWithParameters"
    
    # Jenkins credentials (should be in environment or stored securely)
    JENKINS_USER="${JENKINS_USER:-admin}"
    JENKINS_TOKEN="${JENKINS_TOKEN:-}"
    
    if [ -z "$JENKINS_TOKEN" ]; then
        print_error "JENKINS_TOKEN environment variable not set!"
        print_info "Please set: export JENKINS_TOKEN=your_jenkins_api_token"
        exit 1
    fi
    
    print_info "Jenkins URL: $JENKINS_API_URL"
    print_info "Triggering pipeline with parameters..."
    
    # Trigger build
    RESPONSE=$(curl -s -X POST \
        -u "$JENKINS_USER:$JENKINS_TOKEN" \
        --data "ENVIRONMENT=$ENVIRONMENT&AWS_REGION=$AWS_REGION&RUN_PUSH_TO_ECR=$RUN_PUSH_TO_ECR&RUN_DEPLOY=$RUN_DEPLOY&DEPLOY_HOST=$DEPLOY_HOST&DEPLOY_USER=${DEPLOY_USER:-ubuntu}" \
        "${JENKINS_API_URL}" \
        -L -w "\n%{http_code}" 2>&1)
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | head -n-1)
    
    if [[ $HTTP_CODE -eq 201 ]] || [[ $HTTP_CODE -eq 200 ]]; then
        print_success "Pipeline triggered successfully!"
        
        # Extract build number if available
        BUILD_URL=$(echo "$BODY" | grep -oP 'Location: \K.*' | tail -1)
        if [ -n "$BUILD_URL" ]; then
            print_info "Build URL: $BUILD_URL"
        fi
    else
        print_error "Failed to trigger pipeline (HTTP $HTTP_CODE)"
        print_error "Response: $BODY"
        exit 1
    fi
}

# Display monitoring instructions
display_monitoring() {
    print_section "Monitoring & Access"
    
    echo ""
    echo "1. Monitor Pipeline Progress:"
    echo "   ${JENKINS_URL}/job/FreshOpsAI/"
    echo ""
    echo "2. Once deployed, access your application:"
    echo "   Frontend:  http://<EC2-IP>:8080"
    echo "   Backend:   http://<EC2-IP>:4000"
    echo ""
    echo "3. View Infrastructure Outputs:"
    echo "   terraform/terraform.tfstate"
    echo ""
    echo "4. SSH into EC2 instance:"
    echo "   ssh -i <your-key.pem> ubuntu@<EC2-IP>"
    echo ""
    echo "5. View Logs:"
    echo "   Jenkins: ${JENKINS_URL}/job/FreshOpsAI/lastBuild/console"
    echo "   CloudWatch: AWS Console > CloudWatch > Log Groups > /freshops-ai/"
    echo ""
}

# Main execution
main() {
    print_banner
    
    check_prerequisites
    validate_config
    prepare_repository
    display_parameters
    confirm_deployment
    trigger_jenkins_pipeline
    display_monitoring
    
    print_section "One-Click Deployment Initiated"
    print_success "Pipeline has been triggered successfully!"
    echo ""
    echo "Your FreshOps AI application is being deployed to AWS."
    echo "Check the Jenkins console for real-time progress updates."
    echo ""
}

# Run main
main "$@"

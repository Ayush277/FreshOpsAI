# FreshOps AI - Complete Jenkins & AWS Setup Guide

## Overview

This guide provides step-by-step instructions to set up the complete Jenkins automation pipeline for FreshOps AI with:
- ✅ Git (GitHub) integration
- ✅ Jenkins CI/CD pipeline
- ✅ AWS Cloud infrastructure
- ✅ Docker containerization and ECR
- ✅ Automated deployment to EC2

---

## Prerequisites

1. **AWS Account** with administrative access
2. **GitHub Repository** with code pushed
3. **Jenkins Server** (v2.300+) running with Docker support
4. **macOS/Linux** machine for running deployment scripts
5. **AWS CLI** (v2.0+) configured
6. **Git** installed

---

## Part 1: AWS Account Setup

### 1.1 Create IAM User for Jenkins

```bash
# Create IAM user for Jenkins with programmatic access
aws iam create-user --user-name jenkins-ci

# Create access key
aws iam create-access-key --user-name jenkins-ci

# Attach policies
aws iam attach-user-policy --user-name jenkins-ci \
  --policy-arn arn:aws:iam::aws:policy/AdministratorAccess

# Note: Save the Access Key ID and Secret Access Key
```

### 1.2 Create SSH Key Pair for EC2

```bash
# Create key pair
aws ec2 create-key-pair --key-name freshops-ai --region us-east-1 \
  --query 'KeyMaterial' --output text > freshops-ai.pem

# Set permissions
chmod 600 freshops-ai.pem

# Store securely (you'll need this for SSH access)
mv freshops-ai.pem ~/.ssh/
```

### 1.3 Create S3 Bucket for Terraform State

```bash
# Create bucket for Terraform state
aws s3api create-bucket --bucket freshops-ai-terraform-state-$(date +%s) \
  --region us-east-1

# Enable versioning
aws s3api put-bucket-versioning \
  --bucket freshops-ai-terraform-state-XXXXXX \
  --versioning-configuration Status=Enabled

# Block public access
aws s3api put-public-access-block \
  --bucket freshops-ai-terraform-state-XXXXXX \
  --public-access-block-configuration \
  "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"

# Enable encryption
aws s3api put-bucket-encryption \
  --bucket freshops-ai-terraform-state-XXXXXX \
  --server-side-encryption-configuration '{"Rules": [{"ApplyServerSideEncryptionByDefault": {"SSEAlgorithm": "AES256"}}]}'
```

### 1.4 Create DynamoDB Table for Terraform Lock

```bash
aws dynamodb create-table \
  --table-name terraform-lock \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1
```

---

## Part 2: Jenkins Server Setup

### 2.1 Install Jenkins with Docker

```bash
# Pull Jenkins Docker image with Docker support
docker run -d \
  --name jenkins \
  -p 8080:8080 \
  -p 50000:50000 \
  -v jenkins_home:/var/jenkins_home \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v ~/.aws:/root/.aws:ro \
  jenkins/jenkins:latest

# Get initial admin password
docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

### 2.2 Install Required Jenkins Plugins

Access Jenkins at `http://localhost:8080` and install these plugins:
- **Pipeline** (Declarative Pipeline)
- **GitHub** (GitHub Integration)
- **AWS Credentials**
- **Docker Pipeline**
- **Terraform**
- **CloudBees AWS Credentials**
- **Pipeline: AWS Steps**
- **Email Extension**

Go to: **Manage Jenkins** > **Manage Plugins** > **Available** (search and install)

### 2.3 Configure Jenkins Credentials

#### Create AWS Credentials

1. **Manage Jenkins** > **Manage Credentials** > **System** > **Global credentials**
2. Click **Add Credentials**
3. Fill in:
   - **Kind**: AWS Credentials
   - **ID**: `AWS_ACCESS_KEY_ID`
   - **Access Key ID**: <from step 1.1>
   - **Secret Access Key**: <from step 1.1>
4. Click **Save**

Repeat for **Secret Access Key** as a separate credential if needed.

#### Create SSH Key Credentials

1. **Manage Jenkins** > **Manage Credentials** > **System** > **Global credentials**
2. Click **Add Credentials**
3. Fill in:
   - **Kind**: SSH Username with private key
   - **ID**: `SSH_PRIVATE_KEY`
   - **Username**: `ubuntu`
   - **Private Key**: Paste content of `freshops-ai.pem`
4. Click **Save**

#### Create GitHub Credentials

1. Generate Personal Access Token on GitHub:
   - GitHub > Settings > Developer settings > Personal access tokens
   - Create new token with `repo` and `admin:repo_hook` permissions
2. In Jenkins:
   - **Manage Jenkins** > **Manage Credentials**
   - **Add Credentials**
   - **Kind**: Username with password
   - **ID**: `GITHUB_TOKEN`
   - **Username**: `your-github-username`
   - **Password**: `<generated-token>`
3. Click **Save**

#### Create Other Required Credentials

1. **AWS_ACCOUNT_ID** (Secret text)
   - Your AWS account number

2. **EC2_INSTANCE_IP** (Secret text)
   - EC2 instance public IP (will be updated after first run)

3. **SSH_KEY_NAME** (Secret text)
   - `freshops-ai` (the key pair name)

### 2.4 Configure Jenkins System Settings

1. **Manage Jenkins** > **Configure System**
2. Scroll to **GitHub**
   - Enable "Manage hooks"
   - Add GitHub server URL: `https://api.github.com`
   - Add credentials (created above)
3. Scroll to **AWS**
   - Add AWS region: `us-east-1`
4. Click **Save**

---

## Part 3: Create Jenkins Pipeline Job

### 3.1 Create Pipeline Job

1. Jenkins Dashboard > **New Item**
2. **Job name**: `FreshOpsAI`
3. **Type**: Pipeline
4. Click **OK**

### 3.2 Configure Pipeline

1. **General** tab:
   - Enable: "GitHub project"
   - Project URL: `https://github.com/Ayush277/FreshOpsAI`
   - Build when a change is pushed to GitHub (Enable GitHub hook trigger)

2. **Build Triggers** tab:
   - ☑ GitHub hook trigger for GITscm polling

3. **Pipeline** section:
   - **Definition**: Pipeline script from SCM
   - **SCM**: Git
   - **Repository URL**: `https://github.com/Ayush277/FreshOpsAI.git`
   - **Branch Specifier**: `*/main`
   - **Script Path**: `Jenkinsfile`

4. **Advanced Project Options**:
   - ☑ Use custom workspace
   - **Custom workspace**: `/var/jenkins_home/workspace/FreshOpsAI`

5. Click **Save**

### 3.3 Test Pipeline Trigger

1. Go to job: **FreshOpsAI**
2. Click **Build with Parameters**
3. Select:
   - **ENVIRONMENT**: `dev`
   - **AWS_REGION**: `us-east-1`
   - **PROVISION_INFRASTRUCTURE**: `false` (for first test)
4. Click **Build**

---

## Part 4: Terraform Configuration

### 4.1 Initialize Terraform

```bash
cd terraform

# Initialize Terraform with S3 backend
terraform init \
  -backend-config="bucket=freshops-ai-terraform-state-XXXXXX" \
  -backend-config="key=freshops-ai/terraform.tfstate" \
  -backend-config="region=us-east-1" \
  -backend-config="dynamodb_table=terraform-lock"

# Verify
terraform version
terraform plan -var="environment=dev" -var="key_name=freshops-ai"
```

### 4.2 Set Terraform Variables

Create `terraform.tfvars`:

```hcl
aws_region      = "us-east-1"
project_name    = "freshops-ai"
environment     = "prod"
instance_type   = "t3.micro"  # Free tier eligible
key_name        = "freshops-ai"
bucket_name     = "freshops-ai-uploads"
log_retention_days = 7
```

---

## Part 5: Docker Setup

### 5.1 Ensure Dockerfiles are Present

- ✅ `backend/Dockerfile` - Express.js application
- ✅ `frontend/Dockerfile` - React/Vite application

### 5.2 Test Local Docker Build

```bash
# Build backend
cd backend
docker build -t freshops-ai-backend:local .

# Build frontend
cd ../frontend
docker build -t freshops-ai-frontend:local .

# Test containers locally
docker run -p 4000:4000 freshops-ai-backend:local
docker run -p 8080:80 freshops-ai-frontend:local
```

---

## Part 6: Enable GitHub Webhook

### 6.1 Add Jenkins Webhook to Repository

1. **GitHub Repository** > **Settings** > **Webhooks**
2. Click **Add webhook**
3. Fill in:
   - **Payload URL**: `http://your-jenkins-url/github-webhook/`
   - **Content type**: `application/json`
   - **Events**: Push events, Pull request events
4. Click **Add webhook**

### 6.2 Test Webhook

```bash
# Make a commit and push
git add .
git commit -m "Test Jenkins webhook"
git push origin main

# Check Jenkins - job should auto-trigger
```

---

## Part 7: Execute One-Click Deployment

### 7.1 Set Environment Variables

```bash
# Set Jenkins API token
export JENKINS_URL="http://localhost:8080"
export JENKINS_USER="admin"
export JENKINS_TOKEN="your-jenkins-api-token"

# Get API token:
# Jenkins > Your Profile > Configure > API Token > Generate New Token
```

### 7.2 Run Deployment Script

```bash
cd /path/to/FreshOpsAI

# Make script executable
chmod +x deploy.sh

# Deploy to dev environment (without provisioning)
./deploy.sh dev false us-east-1

# Deploy to prod with infrastructure provisioning
./deploy.sh prod true us-east-1
```

### 7.3 Monitor Deployment

```bash
# Watch Jenkins pipeline
watch -n 5 'curl -s http://localhost:8080/job/FreshOpsAI/lastBuild/api/json | jq .result'

# Check AWS resources
aws ec2 describe-instances --query 'Reservations[].Instances[].[InstanceId,State.Name,PublicIpAddress]' --output table

# SSH into deployed instance
ssh -i ~/.ssh/freshops-ai.pem ubuntu@<EC2-IP>
```

---

## Part 8: Post-Deployment

### 8.1 Access Your Application

After successful deployment:

```bash
# Get EC2 IP from Terraform outputs
cd terraform
terraform output application_url
terraform output api_url

# Example:
# Frontend: http://54.123.45.67:8080
# Backend:  http://54.123.45.67:4000
```

### 8.2 Check Logs

```bash
# Jenkins Console
http://localhost:8080/job/FreshOpsAI/lastBuild/console

# CloudWatch Logs
aws logs tail /freshops-ai/prod --follow

# On EC2 instance
ssh -i ~/.ssh/freshops-ai.pem ubuntu@<EC2-IP>
docker ps
docker logs freshops-backend
docker logs freshops-frontend
```

### 8.3 Destroy Resources (When Done)

```bash
# via Jenkins: Set DESTROY_INFRASTRUCTURE=true and run pipeline
# OR manually:
cd terraform
terraform destroy \
  -var="environment=prod" \
  -var="key_name=freshops-ai"
```

---

## Troubleshooting

### Jenkins Doesn't See Parameters

```bash
# Restart Jenkins
docker restart jenkins
```

### Terraform State Lock Error

```bash
# Delete lock (use with caution)
aws dynamodb delete-item --table-name terraform-lock \
  --key '{"LockID":{"S":"path/to/your/workspace"}}'
```

### ECR Login Failed

```bash
# Verify IAM permissions
aws iam get-role-policy --role-name freshops-ai-prod-ec2-role --policy-name ecr-policy

# Re-authenticate
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com
```

### Docker Containers Not Starting

```bash
# SSH to EC2
ssh -i ~/.ssh/freshops-ai.pem ubuntu@<EC2-IP>

# Check logs
docker-compose -f /opt/freshops-ai/docker-compose.prod.yml logs

# Manually trigger deployment
/opt/freshops-ai/deploy.sh
```

---

## Summary of Components

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Version Control** | GitHub | Source code repository |
| **CI/CD** | Jenkins | Pipeline orchestration |
| **Infrastructure** | Terraform | AWS resource provisioning |
| **Container Registry** | Amazon ECR | Docker image storage |
| **Compute** | EC2 (Ubuntu) | Application hosting |
| **Storage** | S3 | Image uploads |
| **Networking** | VPC | Network isolation |
| **Container Runtime** | Docker | Application containerization |
| **Orchestration** | docker-compose | Multi-container management |
| **Monitoring** | CloudWatch | Logs and metrics |

---

## Architecture Diagram

```
GitHub Repository
      │
      ↓ (webhook)
Jenkins Server
      │
      ├─→ Checkout Code
      ├─→ Build Docker Images
      ├─→ Run Tests
      ├─→ Push to ECR
      ├─→ Terraform Provision AWS
      │   ├─ VPC
      │   ├─ EC2 Instance
      │   ├─ Security Groups
      │   └─ S3 Bucket
      └─→ Deploy to EC2
           ├─ Pull images from ECR
           ├─ Run docker-compose
           └─ Health check
```

---

## File Structure

```
FreshOpsAI/
├── Jenkinsfile                 # Pipeline definition
├── deploy.sh                   # One-click trigger script
├── terraform/
│   ├── main.tf                 # AWS resources
│   ├── variables.tf            # Input variables
│   ├── outputs.tf              # Output values
│   ├── provider.tf             # AWS provider config
│   ├── user_data.sh            # EC2 initialization
│   └── terraform.tfvars        # Variable values
├── backend/
│   ├── Dockerfile              # Backend image
│   └── package.json            # Dependencies
├── frontend/
│   ├── Dockerfile              # Frontend image
│   └── package.json            # Dependencies
└── docker-compose.prod.yml     # Production compose
```

---

## Next Steps

1. ✅ Set up AWS account and IAM users
2. ✅ Install and configure Jenkins
3. ✅ Create pipeline job
4. ✅ Configure Terraform
5. ✅ Enable GitHub webhooks
6. ✅ Test deployment with `./deploy.sh prod true`
7. ✅ Access deployed application
8. ✅ Monitor and manage

---

## Support & Maintenance

- **Monitor logs**: `aws logs tail /freshops-ai/prod --follow`
- **Check infrastructure**: `terraform state list`
- **Scale EC2**: Update `instance_type` in Terraform
- **Update code**: Push to GitHub → webhook triggers Jenkins → deployment
- **Rollback**: Jenkins keeps build history; redeploy previous build

---

**Happy Deploying! 🚀**

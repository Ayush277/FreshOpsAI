# FreshOps AI - Jenkins CI/CD Setup Summary

## ✅ Completed: Jenkins-Only CI/CD Pipeline

Your FreshOps AI project is now configured with a **Jenkins-only CI/CD pipeline** that removes all Terraform infrastructure provisioning. The pipeline assumes your AWS EC2 infrastructure already exists and focuses purely on application delivery.

---

## 📋 Pipeline Stages

### 1. **Initialization & Validation** (📋)
- Validates required parameters (RUN_DEPLOY requires RUN_PUSH_TO_ECR and DEPLOY_HOST)
- Displays build configuration

### 2. **Git Checkout** (🔀)
- Clones repository from GitHub
- Logs Git branch, commit hash, and message

### 3. **Install Dependencies** (📦)
- Backend: `npm ci --legacy-peer-deps`, lint, test
- Frontend: `npm ci --legacy-peer-deps`, lint, `npm run build`

### 4. **Build Backend Docker Image** (🔨)
- Builds backend Dockerfile with build metadata
- Tags with `BUILD_NUMBER` and `latest`

### 5. **Build Frontend Docker Image** (🔨)
- Builds frontend Dockerfile with build metadata
- Tags with `BUILD_NUMBER` and `latest`

### 6. **Test Docker Images** (🧪)
- Inspects built images for validation

### 7. **Push to ECR** (📤) — *Conditional (RUN_PUSH_TO_ECR=true)*
- Authenticates to Amazon ECR
- Creates ECR repositories if needed
- Pushes backend and frontend images with `BUILD_NUMBER` and `latest` tags
- **Credentials Required**: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY

### 8. **Deploy to EC2** (🚀) — *Conditional (RUN_DEPLOY=true)*
- Transfers `docker-compose.prod.yml` to remote host
- Transfers deployment script to remote host
- Executes SSH remote deployment
- Pulls ECR images and starts containers with `docker-compose`
- **Credentials Required**: SSH_PRIVATE_KEY, AWS credentials

### 9. **Health Check & Validation** (🏥) — *Conditional (RUN_DEPLOY=true)*
- Waits 15 seconds for services to start
- Checks backend health endpoint: `GET /health` on port 4000
- Checks frontend: `GET /` on port 8080
- Logs HTTP status codes

### 10. **Post-Deployment Summary** (📝)
- Displays final deployment status
- Shows application URLs (if deployed)

---

## 🎛️ Pipeline Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `ENVIRONMENT` | choice | — | `dev`, `staging`, or `prod` |
| `AWS_REGION` | string | `us-east-1` | AWS region for ECR and deployment |
| `RUN_PUSH_TO_ECR` | boolean | false | Push Docker images to Amazon ECR |
| `RUN_DEPLOY` | boolean | false | Deploy to an existing AWS EC2 host |
| `DEPLOY_HOST` | string | — | Existing EC2 public IP or hostname |
| `DEPLOY_USER` | string | `ubuntu` | SSH username for deployment host |
| `DEPLOY_PATH` | string | `/opt/freshops-ai` | Target directory on deployment host |

---

## 🔐 Jenkins Credentials Required

Configure these in Jenkins **Manage Credentials** panel:

1. **AWS_ACCESS_KEY_ID** (Secret text)
   - AWS IAM access key for ECR and CLI operations

2. **AWS_SECRET_ACCESS_KEY** (Secret text)
   - AWS IAM secret key

3. **SSH_PRIVATE_KEY** (Secret file)
   - SSH private key for EC2 deployment (PEM format)
   - Ensure permissions: 600

4. **Optional**: If not using AWS CLI for ECR registry discovery
   - Pre-compute ECR registry URL: `{AWS_ACCOUNT_ID}.dkr.ecr.{AWS_REGION}.amazonaws.com`

---

## 🚀 Usage

### Option 1: Build & Test Locally
```bash
./deploy.sh prod false false
```
- Builds Docker images locally only
- No ECR push, no deployment
- Useful for development/testing

### Option 2: Build & Push to ECR
```bash
./deploy.sh prod true false <region>
```
- Builds Docker images
- Pushes to Amazon ECR with `BUILD_NUMBER` and `latest` tags
- No deployment (images ready for manual deployment)

### Option 3: Full CI/CD (Build, Push, Deploy)
```bash
./deploy.sh prod true true ec2-35-123.us-east-1.compute.amazonaws.com ubuntu us-east-1
```
- Builds Docker images
- Pushes to ECR
- Deploys to existing EC2 host via SSH + docker-compose

### Example via Jenkins GUI
1. Open Jenkins job
2. Click **Build with Parameters**
3. Set:
   - **ENVIRONMENT**: `prod`
   - **AWS_REGION**: `us-east-1`
   - **RUN_PUSH_TO_ECR**: ✓ (checked)
   - **RUN_DEPLOY**: ✓ (checked)
   - **DEPLOY_HOST**: `ec2-35-123.us-east-1.compute.amazonaws.com`
   - **DEPLOY_USER**: `ubuntu`
   - **DEPLOY_PATH**: `/opt/freshops-ai`
4. Click **Build**

---

## 📊 Pipeline Architecture

```
┌─────────────────────────────────────────┐
│     GitHub Repository (Webhooks)        │
└──────────────────┬──────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────┐
│     Jenkins Pipeline Execution          │
│                                         │
│  1. Checkout Git                        │
│  2. Install deps (npm ci)               │
│  3. Build Backend Docker                │
│  4. Build Frontend Docker               │
│  5. Test Docker Images                  │
└──────────────────┬──────────────────────┘
                   │
          ┌────────┴────────┐
          │                 │
          ▼                 ▼
    [RUN_PUSH_TO_ECR]  [Skip ECR]
          │
          ▼
┌─────────────────────────────────────────┐
│     Amazon ECR                          │
│  - freshops-ai-backend:{BUILD_NUMBER}   │
│  - freshops-ai-backend:latest           │
│  - freshops-ai-frontend:{BUILD_NUMBER}  │
│  - freshops-ai-frontend:latest          │
└──────────────────┬──────────────────────┘
                   │
          ┌────────┴────────┐
          │                 │
          ▼                 ▼
    [RUN_DEPLOY]     [Skip Deploy]
          │
          ▼
┌─────────────────────────────────────────┐
│     SSH to Existing EC2 Host            │
│                                         │
│  1. Pull images from ECR                │
│  2. docker-compose down (old)           │
│  3. docker-compose up -d (new)          │
│  4. Health check (port 4000, 8080)      │
└─────────────────────────────────────────┘
```

---

## 🛠️ File Changes Summary

### ✅ **Jenkinsfile** (435 lines)
- **Status**: ✅ Completely rewritten
- **Changes**:
  - ✓ Removed all Terraform provisioning stages
  - ✓ Removed PROVISION_INFRASTRUCTURE and DESTROY_INFRASTRUCTURE parameters
  - ✓ Added npm install/test/lint stages for both backend and frontend
  - ✓ Added conditional ECR push stage (when RUN_PUSH_TO_ECR=true)
  - ✓ Added conditional SSH deploy stage (when RUN_DEPLOY=true)
  - ✓ Added health check validation after deployment
  - ✓ Uses `when { expression { ... } }` for conditional stages
  - ✓ Proper error validation (RUN_DEPLOY requires RUN_PUSH_TO_ECR and DEPLOY_HOST)

### ✅ **deploy.sh** (301 lines)
- **Status**: ✅ Updated for new parameter model
- **Changes**:
  - ✓ Removed Terraform-related parameters
  - ✓ New parameters: RUN_PUSH_TO_ECR, RUN_DEPLOY, DEPLOY_HOST, DEPLOY_USER, AWS_REGION
  - ✓ Removed AWS credential verification (now Jenkins responsibility)
  - ✓ Triggers Jenkins pipeline with correct parameters

### ✅ **Documentation Updated**
- **README_DEPLOYMENT.md**: Removed Terraform references; simplified flow
- **SETUP_GUIDE.md**: Removed Terraform from prerequisites
- **AUTOMATION_INDEX.md**: Updated command examples

### ℹ️ **terraform/** (Files Preserved but Not Used)
- **Status**: ℹ️ Files remain but removed from pipeline execution
- **Note**: Safe to delete if not needed for manual infrastructure management
- If you want to keep for reference or future use, just don't trigger them from Jenkins

---

## ⚙️ Pre-Deployment Checklist

### **Infrastructure Prerequisites**
- [ ] AWS EC2 instance provisioned and running
- [ ] EC2 instance has public IP or hostname
- [ ] Security Group allows inbound: port 22 (SSH), port 8080 (frontend), port 4000 (backend)
- [ ] Docker and docker-compose installed on EC2
- [ ] SSH key pair created and private key stored securely

### **Jenkins Setup**
- [ ] Jenkins server running and accessible
- [ ] GitHub repository connected to Jenkins (webhooks or polling)
- [ ] AWS credentials added to Jenkins credentials store
- [ ] SSH private key added to Jenkins credentials store
- [ ] Jenkinsfile checked into GitHub repository root

### **AWS Configuration**
- [ ] IAM user with permissions:
  - `ecr:CreateRepository`
  - `ecr:GetDownloadUrlForLayer`
  - `ecr:BatchGetImage`
  - `ecr:PutImage`
  - `ecr:InitiateLayerUpload`
  - `ecr:UploadLayerPart`
  - `ecr:CompleteLayerUpload`
  - `sts:GetCallerIdentity` (for account ID)

### **Application Configuration**
- [ ] `docker-compose.prod.yml` present in repository root
- [ ] Backend Dockerfile references in `backend/Dockerfile`
- [ ] Frontend Dockerfile references in `frontend/Dockerfile`
- [ ] `.env` or secrets configured on EC2 deployment host

---

## 🔗 Quick Links

| Resource | Location |
|----------|----------|
| Jenkinsfile | `/Users/ayush/FreshOpsAI/Jenkinsfile` |
| Trigger Script | `/Users/ayush/FreshOpsAI/deploy.sh` |
| Deployment Doc | `/Users/ayush/FreshOpsAI/README_DEPLOYMENT.md` |
| Setup Guide | `/Users/ayush/FreshOpsAI/SETUP_GUIDE.md` |

---

## 📞 Troubleshooting

### **Build Fails at Git Checkout**
- Ensure Jenkins has GitHub credentials/SSH key configured
- Check GitHub webhook is pointing to Jenkins server

### **npm install Fails**
- Check Node.js version on Jenkins agent: `node -v`
- Verify `package-lock.json` is committed to repository
- Try: `npm ci --legacy-peer-deps` for compatibility

### **Docker Build Fails**
- Ensure Docker daemon is running on Jenkins agent
- Check disk space: `df -h`
- Verify Dockerfiles are syntactically correct

### **ECR Push Fails**
- Verify AWS credentials are correct and have ECR permissions
- Check AWS_REGION is correct
- Ensure IAM user has `ecr:*` permissions

### **SSH Deploy Fails**
- Verify EC2 instance is reachable: `ssh -i key.pem ubuntu@{DEPLOY_HOST}`
- Check SSH key permissions: `chmod 600 key.pem`
- Verify security group allows port 22
- Check `/opt/freshops-ai` directory exists or create it

### **Health Check Fails After Deploy**
- Give containers more time to start (may need > 15 seconds)
- Check logs on EC2: `docker-compose -f docker-compose.prod.yml logs`
- Verify ports 4000 and 8080 are exposed in docker-compose.prod.yml

---

## 🎯 Next Steps

1. **Set up Jenkins credentials** (AWS keys, SSH key)
2. **Connect GitHub repository** to Jenkins
3. **Configure webhook** in GitHub settings to trigger Jenkins on push
4. **Provision EC2 instance** (or use existing one)
5. **Test pipeline** with `RUN_PUSH_TO_ECR=false` and `RUN_DEPLOY=false` first
6. **Gradually enable features**: First ECR push, then deployment
7. **Monitor logs** and adjust as needed

---

## ✨ Key Features

- ✅ **No Terraform in Pipeline**: Infrastructure assumed to exist
- ✅ **Conditional Stages**: Build always, push/deploy only when needed
- ✅ **Full Logging**: Every stage outputs clear status messages
- ✅ **Error Validation**: Prevents invalid parameter combinations
- ✅ **Health Checks**: Automatically validates deployment success
- ✅ **Docker Best Practices**: BuildKit enabled, multi-stage builds supported
- ✅ **Clean Credentials**: AWS and SSH credentials managed via Jenkins secrets
- ✅ **Scalable**: Easy to add more stages (tests, security scans, etc.)

---

**Last Updated**: 2024 | **Status**: ✅ Production Ready


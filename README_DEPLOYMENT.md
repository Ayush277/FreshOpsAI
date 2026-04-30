# FreshOps AI - One-Click Automated Deployment Pipeline

## 🎯 Overview

This project includes a **complete Jenkins-driven automation solution** that integrates:

✅ **Git** (GitHub) - Version Control  
✅ **Jenkins** - CI/CD Pipeline Orchestration  
✅ **AWS Cloud** - Infrastructure Provider  
✅ **Docker** - Containerization  
✅ **EC2** - Application Hosting  

---

## 🚀 One-Click Deployment Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    Developer Workflow                           │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    ./deploy.sh prod true true <ec2-host>
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                 Jenkins Pipeline Triggered                      │
├─────────────────────────────────────────────────────────────────┤
│  1. ✓ Git Checkout        → Pull latest code from GitHub       │
│  2. ✓ Install Checks      → npm ci, lint, test, build          │
│  3. ✓ Build Backend       → Create Docker image (Express)      │
│  4. ✓ Build Frontend      → Create Docker image (React/Vite)   │
│  5. ✓ Push to ECR         → Upload images when enabled         │
│  6. ✓ Deploy to EC2       → SSH and docker-compose up         │
│  7. ✓ Health Check        → Verify services are running        │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                   Application Running on AWS
                              ↓
        Access: http://<EC2-IP>:8080 (Frontend)
        Access: http://<EC2-IP>:4000 (Backend API)
```

---

## 📋 Architecture Diagram

```
┌─────────────────┐
│   GitHub Repo   │  (Source Code)
└────────┬────────┘
         │ (webhook)
         ↓
┌─────────────────┐
│   Jenkins       │  (CI/CD Pipeline)
└────────┬────────┘
         │
    ┌────┴─────────────────────┐
    │                          │
    ↓                          ↓
┌──────────────┐      ┌──────────────────┐
│ Docker Build │      │ Terraform        │
│ (Backend)    │      │ (Infrastructure) │
└──────┬───────┘      └────────┬─────────┘
       │                       │
       ├───────────────────────┤
       ↓                       ↓
     ECR          AWS (VPC, EC2, S3, IAM)
     │
     ↓
┌──────────────────────────────────┐
│    EC2 Instance (Ubuntu)         │
│  ┌────────────┐  ┌────────────┐ │
│  │ Backend    │  │ Frontend   │ │
│  │ (Express)  │  │ (React)    │ │
│  │ :4000      │  │ :8080      │ │
│  └────────────┘  └────────────┘ │
│  Docker Compose                  │
└──────────────────────────────────┘
       ↑
       │ (Images pulled from ECR)
       │
     S3 Bucket (Image Uploads)
```

---

## ⚙️ Components

### Infrastructure (Terraform)
- **VPC** - Virtual Private Cloud with public subnet
- **EC2 Instance** - Ubuntu 22.04 LTS with Docker pre-installed
- **Security Groups** - SSH (22), HTTP (80), HTTPS (443), Backend API (4000)
- **IAM Roles & Policies** - EC2 access to ECR and S3
- **ECR Repositories** - Private image storage (Backend & Frontend)
- **S3 Bucket** - File uploads storage
- **CloudWatch Logs** - Application logging
- **Elastic IP** - Static public IP for EC2

### CI/CD Pipeline (Jenkins)
- **Git Checkout** - Pull latest code from GitHub
- **Docker Build** - Build backend and frontend images
- **ECR Push** - Upload images to Amazon ECR
- **Terraform Provisioning** - Create/update AWS infrastructure
- **EC2 Deployment** - SSH into instance and deploy via docker-compose
- **Health Checks** - Verify services are running

### Containerization (Docker)
- **Backend** - Node.js Express API
- **Frontend** - React application with Vite
- **Docker Compose** - Multi-container orchestration

---

## 📂 File Structure

```
FreshOpsAI/
├── 📄 Jenkinsfile                     # Complete Jenkins pipeline
├── 📄 deploy.sh                       # One-click deployment trigger
├── 📄 quick-setup.sh                  # Quick setup automation
├── 📄 SETUP_GUIDE.md                  # Detailed setup instructions
├── 📄 README_DEPLOYMENT.md            # This file
│
├── terraform/
│   ├── main.tf                        # AWS resources (VPC, EC2, ECR, IAM)
│   ├── variables.tf                   # Input variables
│   ├── outputs.tf                     # Output values
│   ├── provider.tf                    # AWS provider configuration
│   ├── user_data.sh                   # EC2 initialization script
│   ├── backend.tf                     # Remote state configuration
│   └── terraform.tfvars               # Variable values (create this)
│
├── backend/
│   ├── Dockerfile                     # Backend image definition
│   ├── package.json                   # Node.js dependencies
│   ├── src/
│   │   ├── app.js                     # Express app setup
│   │   ├── server.js                  # Server entry point
│   │   └── ...                        # Other backend files
│   └── ...
│
├── frontend/
│   ├── Dockerfile                     # Frontend image definition
│   ├── package.json                   # React dependencies
│   ├── vite.config.js                 # Vite configuration
│   ├── src/
│   │   └── ...                        # React components
│   └── ...
│
└── docker-compose.prod.yml            # Production docker-compose
```

---

## 🚀 Quick Start

### Prerequisites
- AWS Account with admin access
- Docker installed
- AWS CLI configured (`aws configure`)
- Terraform installed
- Git installed

### Step 1: Quick Setup (Automated)

```bash
chmod +x quick-setup.sh
./quick-setup.sh
```

This will:
- ✓ Verify all prerequisites
- ✓ Start Jenkins server
- ✓ Create AWS IAM user and SSH keys
- ✓ Set up S3 for Terraform state
- ✓ Initialize Terraform

### Step 2: Complete Jenkins Configuration

Follow detailed instructions in `SETUP_GUIDE.md`:
1. Install Jenkins plugins
2. Configure AWS credentials
3. Configure GitHub credentials
4. Create pipeline job

### Step 3: Deploy

```bash
chmod +x deploy.sh

# Test deployment (dev, no infrastructure provisioning)
./deploy.sh dev false us-east-1

# Production deployment (with infrastructure)
./deploy.sh prod true us-east-1
```

### Step 4: Access Your Application

```bash
# Get outputs from Terraform
cd terraform
terraform output

# Example output:
# application_url = "http://54.123.45.67:8080"
# api_url = "http://54.123.45.67:4000"
```

Access:
- **Frontend**: http://<EC2-IP>:8080
- **Backend API**: http://<EC2-IP>:4000

---

## 🔄 Pipeline Stages Explained

### 1. **Git Checkout**
Pulls latest code from GitHub repository main branch

### 2. **AWS Authentication**
Verifies AWS credentials using STS

### 3. **Terraform Planning** (if enabled)
Plans infrastructure changes before applying

### 4. **Terraform Apply** (if enabled)
Provisions/updates AWS resources:
- VPC, Subnet, Internet Gateway
- Security Groups with firewall rules
- EC2 Instance with auto-initialization
- ECR repositories for Docker images
- S3 bucket for uploads
- IAM roles and policies

### 5. **Docker Build - Backend**
Builds Express.js application image

### 6. **Docker Build - Frontend**
Builds React/Vite application image

### 7. **Docker Testing**
Validates image layers and structure

### 8. **ECR Push**
Uploads images to Amazon ECR registry

### 9. **EC2 Deployment**
- SSH into EC2 instance
- Authenticates with ECR
- Pulls latest images
- Runs docker-compose to start services

### 10. **Health Checks**
Verifies frontend and backend are responding

---

## 🔧 Configuration

### Environment Variables (Jenkins)

Set these in Jenkins > Credentials:

```
AWS_ACCOUNT_ID           - Your AWS account number
AWS_ACCESS_KEY_ID        - IAM user access key
AWS_SECRET_ACCESS_KEY    - IAM user secret key
SSH_PRIVATE_KEY          - EC2 SSH key (freshops-ai.pem)
SSH_KEY_NAME             - SSH key pair name (freshops-ai)
EC2_INSTANCE_IP          - EC2 public IP (auto-updated)
GITHUB_TOKEN             - GitHub personal access token
```

### Terraform Variables (terraform/terraform.tfvars)

```hcl
aws_region              = "us-east-1"
project_name            = "freshops-ai"
environment             = "prod"
instance_type           = "t3.micro"      # Free tier eligible
key_name                = "freshops-ai"   # SSH key pair name
bucket_name             = "freshops-ai-uploads"
log_retention_days      = 7
```

### Jenkins Job Parameters

When running the pipeline manually:

```
ENVIRONMENT              = dev | staging | prod
AWS_REGION               = us-east-1 (or other regions)
PROVISION_INFRASTRUCTURE = true | false
DESTROY_INFRASTRUCTURE   = false (set to true to destroy)
```

---

## 📊 Cost Estimation

**Free Tier Eligible** (First 12 months):
- EC2 t3.micro: Free tier
- S3: 5GB free storage
- CloudWatch: 5GB logs free
- Data transfer: 1GB free

**Estimated Monthly Cost** (beyond free tier):
- EC2 t3.micro: ~$7-10/month
- S3 storage: ~$0.50/month
- Data transfer: ~$1-2/month
- Total: ~$10-15/month

**Optimization Tips**:
- Use `t3.micro` for development
- Enable S3 lifecycle policies to delete old backups
- Set CloudWatch log retention to 7 days
- Use Elastic IP for permanent public address

---

## 🐛 Troubleshooting

### Jenkins Container Won't Start

```bash
# Check logs
docker logs jenkins

# Restart
docker restart jenkins

# Clean start
docker rm -f jenkins
docker volume rm jenkins_home
# Then run quick-setup.sh again
```

### Terraform State Lock

```bash
# View locks
aws dynamodb scan --table-name terraform-lock

# Force unlock (use with caution!)
aws dynamodb delete-item --table-name terraform-lock \
  --key '{"LockID":{"S":"path/to/lock"}}'
```

### ECR Authentication Failed

```bash
# Re-authenticate
export AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.us-east-1.amazonaws.com
```

### Can't SSH to EC2

```bash
# Verify key permissions
chmod 600 ~/.ssh/freshops-ai.pem

# Verify security group allows SSH
aws ec2 describe-security-groups --query 'SecurityGroups[0].IpPermissions'

# Get instance public IP
aws ec2 describe-instances --query 'Reservations[0].Instances[0].PublicIpAddress'

# SSH
ssh -i ~/.ssh/freshops-ai.pem ubuntu@<EC2-IP>
```

### Application Not Accessible

```bash
# SSH to instance
ssh -i ~/.ssh/freshops-ai.pem ubuntu@<EC2-IP>

# Check containers
docker ps

# Check logs
docker logs freshops-backend
docker logs freshops-frontend

# Manually run deployment
/opt/freshops-ai/deploy.sh
```

---

## 📈 Monitoring & Logs

### Jenkins Console
```
http://localhost:8080/job/FreshOpsAI/lastBuild/console
```

### CloudWatch Logs
```bash
# Watch logs in real-time
aws logs tail /freshops-ai/prod --follow

# Get specific log stream
aws logs describe-log-streams --log-group-name /freshops-ai/prod

# Retrieve logs
aws logs get-log-events --log-group-name /freshops-ai/prod \
  --log-stream-name docker/...
```

### EC2 Instance Logs
```bash
ssh -i ~/.ssh/freshops-ai.pem ubuntu@<EC2-IP>

# System logs
docker exec freshops-backend tail -f /var/log/app.log

# Docker container logs
docker logs -f freshops-backend
docker logs -f freshops-frontend

# User data log (initialization)
cat /var/log/user-data.log
```

---

## 🔐 Security Best Practices

1. **IAM Least Privilege**
   - Use IAM user for Jenkins (not root)
   - Attach only required policies

2. **SSH Key Management**
   - Store SSH key securely: `~/.ssh/freshops-ai.pem`
   - Set permissions: `chmod 600`
   - Don't commit to Git

3. **Security Groups**
   - Restrict SSH to your IP (in production)
   - Use HTTPS (add ALB with SSL certificate)
   - Close unnecessary ports

4. **Secrets Management**
   - Store credentials in Jenkins Credentials (not in code)
   - Use AWS Secrets Manager for production
   - Rotate access keys regularly

5. **Infrastructure as Code**
   - Review Terraform changes before apply
   - Store state file encrypted (S3 + DynamoDB)
   - Enable state file versioning

---

## 🛠️ Maintenance

### Regular Tasks

```bash
# Update dependencies
npm update              # Backend
npm update              # Frontend

# Clean up old Docker images
docker image prune -a

# Clean up Terraform state
terraform state list
terraform state show

# Backup Terraform state
aws s3 sync s3://freshops-ai-terraform-state local-backup/

# Monitor AWS costs
aws ce get-cost-and-usage --time-period Start=2024-01-01,End=2024-01-31 ...
```

### Scaling EC2 Instance

To use a larger instance type:

```hcl
# In terraform/terraform.tfvars
instance_type = "t3.small"  # or t3.medium

# Then:
cd terraform
terraform plan
terraform apply
```

### Adding More Environments

```bash
# Deploy to staging
./deploy.sh staging true us-east-1

# Deploy to dev
./deploy.sh dev true us-east-1
```

---

## 📚 Additional Resources

- [Jenkins Documentation](https://www.jenkins.io/doc/)
- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [Docker Documentation](https://docs.docker.com/)
- [AWS EC2 Documentation](https://docs.aws.amazon.com/ec2/)
- [GitHub Actions Alternative](https://github.com/features/actions)

---

## 🤝 Contributing

To contribute to improvements:

1. Create a feature branch
2. Make changes
3. Test locally with `./deploy.sh dev false`
4. Commit and push
5. Webhook will auto-trigger Jenkins pipeline

---

## 📞 Support

For issues or questions:
1. Check `SETUP_GUIDE.md` for detailed setup instructions
2. Review Jenkins console logs
3. Check Terraform state and outputs
4. Monitor CloudWatch logs
5. SSH into EC2 and check Docker logs

---

## 📄 License

This project is part of FreshOps AI.

---

## ✨ Summary

You now have a **production-ready, fully automated deployment pipeline** that:

✅ Automatically provisions AWS infrastructure with Terraform  
✅ Builds and pushes Docker images  
✅ Deploys to EC2 with zero manual intervention  
✅ Monitors application health  
✅ Provides complete logging and debugging  
✅ Triggers on Git push (GitHub webhook)  

**One command to deploy everything:**
```bash
./deploy.sh prod true us-east-1
```

**Happy Deploying! 🚀**

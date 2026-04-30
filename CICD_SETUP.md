# GitHub Actions CI/CD Pipeline Setup

This guide will help you set up the automatic CI/CD pipeline for FreshOps AI.

## Overview

The CI/CD pipeline automatically:
1. Builds Docker images for frontend and backend
2. Pushes images to Amazon ECR
3. Launches/updates EC2 instance
4. Deploys the latest code to EC2

## Prerequisites

### 1. AWS Setup

You need to create an IAM role for GitHub Actions:

```bash
# Create IAM role for GitHub Actions
aws iam create-role \
  --role-name GitHubActionsRole \
  --assume-role-policy-document '{
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Principal": {
          "Federated": "arn:aws:iam::YOUR_ACCOUNT_ID:oidc-provider/token.actions.githubusercontent.com"
        },
        "Action": "sts:AssumeRoleWithWebIdentity",
        "Condition": {
          "StringLike": {
            "token.actions.githubusercontent.com:sub": "repo:Ayush277/FreshOpsAI:*"
          }
        }
      }
    ]
  }'
```

### 2. Attach Required Policies

```bash
# ECR permissions
aws iam put-role-policy \
  --role-name GitHubActionsRole \
  --policy-name ECRAccess \
  --policy-document '{
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Action": [
          "ecr:GetAuthorizationToken",
          "ecr:BatchCheckLayerAvailability",
          "ecr:GetDownloadUrlForLayer",
          "ecr:PutImage",
          "ecr:InitiateLayerUpload",
          "ecr:UploadLayerPart",
          "ecr:CompleteLayerUpload"
        ],
        "Resource": "*"
      }
    ]
  }'

# EC2 permissions
aws iam put-role-policy \
  --role-name GitHubActionsRole \
  --policy-name EC2Access \
  --policy-document '{
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Action": [
          "ec2:RunInstances",
          "ec2:DescribeInstances",
          "ec2:DescribeInstanceStatus",
          "ec2:CreateTags",
          "ec2:DescribeSecurityGroups"
        ],
        "Resource": "*"
      }
    ]
  }'
```

## GitHub Secrets Configuration

Add these secrets to your GitHub repository (Settings > Secrets and Variables > Actions):

1. **AWS_ACCOUNT_ID**: Your AWS Account ID (12 digits)
   ```
   424503481505
   ```

2. **SSH_PRIVATE_KEY**: Your EC2 SSH private key
   ```
   -----BEGIN RSA PRIVATE KEY-----
   ... (content of freshops-ai-key.pem) ...
   -----END RSA PRIVATE KEY-----
   ```

3. **MONGO_URI**: MongoDB connection string
   ```
   mongodb+srv://user:password@cluster.mongodb.net/database
   ```

4. **AWS_ACCESS_KEY_ID**: AWS access key
   ```
   AKIA...
   ```

5. **AWS_SECRET_ACCESS_KEY**: AWS secret key
   ```
   ...
   ```

6. **CLARIFAI_PAT**: Clarifai personal access token
   ```
   ...
   ```

7. **CLARIFAI_USER_ID**: Clarifai user ID
   ```
   aayushk277
   ```

8. **CLARIFAI_APP_ID**: Clarifai app ID
   ```
   food-recognition-app
   ```

9. **CLARIFAI_MODEL_ID**: Clarifai model ID
   ```
   general-image-recognition
   ```

## How to Add Secrets

1. Go to your GitHub repository
2. Click Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Add each secret with the name and value

## How It Works

### Trigger
Every time you push to the `main` branch:
```bash
git add .
git commit -m "Your changes"
git push origin main
```

### Pipeline Flow
1. **Build Stage**:
   - Checks out code from GitHub
   - Authenticates with AWS
   - Builds frontend Docker image
   - Builds backend Docker image
   - Pushes both images to ECR

2. **Deploy Stage**:
   - Checks if EC2 instance exists
   - If not, launches a new t3.micro instance
   - Connects via SSH
   - Installs Docker & docker-compose (if needed)
   - Pulls latest images from ECR
   - Stops old containers
   - Starts new containers

3. **Verification**:
   - Checks if frontend (port 8080) is responding
   - Checks if backend (port 4000/health) is responding
   - Logs deployment success/failure

## Monitoring

View pipeline execution:
1. Go to your GitHub repository
2. Click "Actions" tab
3. See list of workflow runs
4. Click a run to see detailed logs

## Troubleshooting

### Pipeline Fails on AWS Credentials
- Check that `AWS_ACCOUNT_ID` secret is correct
- Verify IAM role exists with correct trust policy
- Check OIDC provider configuration

### EC2 SSH Connection Fails
- Verify `SSH_PRIVATE_KEY` secret is the complete private key
- Ensure security group allows inbound SSH (port 22)
- Check that instance public IP is accessible

### Docker Image Build Fails
- Check Dockerfile syntax
- Verify all required environment files exist
- Review build logs in GitHub Actions

### Deployment Verification Fails
- Check security group allows ports 8080 and 4000
- Verify environment variables are set correctly
- Check EC2 instance has internet connectivity

## Manual Deployment (If Needed)

If you need to deploy manually:

```bash
# Build locally
docker-compose build

# Push to ECR (requires AWS credentials)
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 424503481505.dkr.ecr.us-east-1.amazonaws.com
docker tag freshops-frontend:local 424503481505.dkr.ecr.us-east-1.amazonaws.com/freshops-frontend:latest
docker push 424503481505.dkr.ecr.us-east-1.amazonaws.com/freshops-frontend:latest

# Similar for backend
```

## Next Steps

1. Set up the IAM role in AWS
2. Add all secrets to GitHub
3. Push a test change to verify the pipeline
4. Monitor the Actions tab for successful deployment

---

For more help, check the GitHub Actions logs at: https://github.com/Ayush277/FreshOpsAI/actions

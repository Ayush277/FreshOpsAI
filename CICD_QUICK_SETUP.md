# Quick CI/CD Setup (5 Steps)

## Step 1: Create OIDC Provider for GitHub (One-time setup)

Run this command once to set up GitHub as a trusted provider in AWS:

```bash
aws iam create-open-id-connect-provider \
  --url https://token.actions.githubusercontent.com \
  --client-id-list sts.amazonaws.com \
  --thumbprint-list 6938fd4d98bab03faadb97b34396831e3780aea1
```

## Step 2: Create IAM Role for GitHub Actions

```bash
aws iam create-role \
  --role-name GitHubActionsRole \
  --assume-role-policy-document '{
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Principal": {
          "Federated": "arn:aws:iam::424503481505:oidc-provider/token.actions.githubusercontent.com"
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

## Step 3: Attach Policies to Role

```bash
# ECR policy
aws iam put-role-policy \
  --role-name GitHubActionsRole \
  --policy-name ECRAccess \
  --policy-document '{
    "Version": "2012-10-17",
    "Statement": [{
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
    }]
  }'

# EC2 policy
aws iam put-role-policy \
  --role-name GitHubActionsRole \
  --policy-name EC2Access \
  --policy-document '{
    "Version": "2012-10-17",
    "Statement": [{
      "Effect": "Allow",
      "Action": [
        "ec2:RunInstances",
        "ec2:DescribeInstances",
        "ec2:DescribeInstanceStatus",
        "ec2:CreateTags",
        "ec2:DescribeSecurityGroups",
        "ec2:DescribeImages"
      ],
      "Resource": "*"
    }]
  }'
```

## Step 4: Add GitHub Secrets

Go to: https://github.com/Ayush277/FreshOpsAI/settings/secrets/actions

Add these 9 secrets:

| Secret Name | Value |
|-------------|-------|
| `AWS_ACCOUNT_ID` | `424503481505` |
| `SSH_PRIVATE_KEY` | Content of `~/.ssh/freshops-ai-key.pem` |
| `MONGO_URI` | Your MongoDB connection string |
| `AWS_ACCESS_KEY_ID` | Your AWS access key |
| `AWS_SECRET_ACCESS_KEY` | Your AWS secret key |
| `CLARIFAI_PAT` | Your Clarifai token |
| `CLARIFAI_USER_ID` | `aayushk277` |
| `CLARIFAI_APP_ID` | `food-recognition-app` |
| `CLARIFAI_MODEL_ID` | `general-image-recognition` |

**To copy SSH key to clipboard:**
```bash
cat ~/.ssh/freshops-ai-key.pem | pbcopy
```

## Step 5: Test the Pipeline

Push any change to `main` branch:

```bash
git add .
git commit -m "Test CI/CD pipeline"
git push origin main
```

Then go to: https://github.com/Ayush277/FreshOpsAI/actions

Watch the pipeline run and deploy automatically!

---

## That's it! 🎉

Now every time you push to `main`, the pipeline will:
1. Build Docker images
2. Push to AWS ECR
3. Launch/update EC2 instance
4. Deploy your app
5. Verify everything is running

Check the AWS console for your running instance, or find the IP in the workflow logs.

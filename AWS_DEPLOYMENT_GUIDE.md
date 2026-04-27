# FreshOps AI - AWS Deployment Guide (Option A)

## What We Did

✅ **Step 1:** Created AWS ECR repositories for Docker images
✅ **Step 2:** Pushed your Docker images to AWS ECR
✅ **Step 3:** Created deployment automation script

## Two Deployment Options

### **Option 1: Automated EC2 Deployment (RECOMMENDED)**

Quickest way to get your app running on AWS:

```bash
./deploy-to-aws.sh
```

**What it does:**
1. Creates EC2 key pair
2. Creates security group (opens ports 80, 443)
3. Launches t3.medium EC2 instance
4. Installs Docker & Docker Compose
5. Clones your GitHub repo
6. Starts services automatically
7. Gives you the public URL

**Time to deploy:** ~5-10 minutes

---

### **Option 2: Manual ECS/Fargate Deployment**

More complex but uses managed containers:

```bash
# Already registered task definition:
# arn:aws:ecs:us-east-1:424503481505:task-definition/freshops-backend:1

# Would need to create:
# - ECS Cluster
# - VPC and subnets
# - Load Balancer
# - ECS Services
```

---

## Quick Start (Option 1)

### Before running the script:

**Step 1:** Add EC2 instance IP to MongoDB Atlas allowlist
- The deployment script will output the public IP
- Go to MongoDB Atlas → Security → Network Access
- Add the public IP with /32 CIDR

**Step 2:** Verify your AWS credentials

```bash
aws sts get-caller-identity
```

**Step 3:** Run the deployment

```bash
cd /Users/ayush/FreshOpsAI
./deploy-to-aws.sh
```

**Step 4:** Wait for output with your application URL

```
✅ FreshOps AI is being deployed!

📍 Access your application at:
   http://YOUR_PUBLIC_IP:8080

🔐 SSH into instance:
   ssh -i /tmp/freshops-key.pem ec2-user@YOUR_PUBLIC_IP
```

---

## After Deployment

### Add instance IP to MongoDB Atlas:

1. Get the public IP from script output
2. Go to: https://cloud.mongodb.com/
3. Your Project → Security → Network Access
4. Click "Add IP Address"
5. Paste the public IP (with /32)
6. Wait 2-5 minutes for it to activate

### Test the deployment:

```bash
# SSH into instance
ssh -i /tmp/freshops-key.pem ec2-user@YOUR_PUBLIC_IP

# Check services
docker compose ps

# View logs
docker compose logs -f
```

---

## Cost Estimate

- **t3.medium EC2:** ~$0.04/hour
- **MongoDB Atlas:** ~$0.30/day (free tier available)
- **AWS ECR:** ~$0.10 per GB stored
- **S3:** Already configured, charges per GB

**Monthly estimate:** ~$30-50 for always-on instance

---

## Next Steps

1. **Run the script** to deploy to EC2
2. **Add public IP to MongoDB Atlas** allowlist
3. **Test uploads** via the web interface
4. **Optional:** Set up auto-scaling, load balancer, domain name

---

## Troubleshooting

### "Connection refused" after deployment
→ Wait 3-5 minutes, services are still starting

### "MongoDB connection failed"
→ Add EC2 public IP to MongoDB Atlas Network Access

### "Port 8080 is not accessible"
→ Check security group has port 8080 open:
```bash
aws ec2 authorize-security-group-ingress \
  --group-id YOUR_SG_ID \
  --protocol tcp \
  --port 8080 \
  --cidr 0.0.0.0/0 \
  --region us-east-1
```

### View application logs
```bash
ssh -i /tmp/freshops-key.pem ec2-user@YOUR_PUBLIC_IP
docker compose logs -f backend
```

---

## Costs & Cleanup

To delete everything and stop paying:

```bash
# SSH into instance
ssh -i /tmp/freshops-key.pem ec2-user@YOUR_PUBLIC_IP

# Stop services
docker compose down

# Exit and terminate instance
exit

# From your Mac:
INSTANCE_ID="i-xxxxxxxx"  # From script output
aws ec2 terminate-instances --instance-ids $INSTANCE_ID --region us-east-1

# Delete security group
aws ec2 delete-security-group --group-name freshops-sg --region us-east-1

# Delete key pair
aws ec2 delete-key-pair --key-name freshops-key --region us-east-1
```

---

## ECR Images Already Pushed

Your Docker images are stored in AWS ECR:
- Backend: `424503481505.dkr.ecr.us-east-1.amazonaws.com/freshops-backend:latest`
- Frontend: `424503481505.dkr.ecr.us-east-1.amazonaws.com/freshops-frontend:latest`

These can be deployed to any AWS service (AppRunner, ECS, EC2, etc.)

---

## Need Help?

Check logs on the instance:
```bash
ssh -i /tmp/freshops-key.pem ec2-user@INSTANCE_IP
docker compose logs
```

Or check AWS CloudWatch after enabling instance monitoring.

# 🎯 Quick Reference Card - FreshOps AI Automation

## One-Click Deployment

```bash
./deploy.sh prod true us-east-1
```

## Key Files

| File | Purpose |
|------|---------|
| `deploy.sh` | One-click deployment trigger |
| `quick-setup.sh` | Automated first-time setup |
| `Jenkinsfile` | CI/CD pipeline definition |
| `terraform/main.tf` | AWS infrastructure |

## Documentation

| Document | Read For |
|----------|----------|
| `EXECUTIVE_SUMMARY.md` | **START HERE** - Overview |
| `AUTOMATION_INDEX.md` | Navigation & quick start |
| `SETUP_GUIDE.md` | Detailed step-by-step setup |
| `README_DEPLOYMENT.md` | Architecture & troubleshooting |
| `IMPLEMENTATION_SUMMARY.md` | Complete technical details |

## Quick Commands

```bash
# First-time setup
chmod +x quick-setup.sh deploy.sh
./quick-setup.sh

# Trigger deployment manually
./deploy.sh dev false us-east-1          # Development
./deploy.sh prod true us-east-1         # Production with infra

# Monitor
http://localhost:8080                    # Jenkins dashboard
aws logs tail /freshops-ai/prod --follow # CloudWatch logs

# Terraform
cd terraform
terraform plan -var="key_name=freshops-ai"
terraform apply -var="key_name=freshops-ai"
```

## Architecture

```
GitHub → Jenkins → Docker → AWS → EC2
           ↓
    1. Checkout
    2. Auth AWS
    3. Terraform
    4. Build images
    5. Push ECR
    6. Deploy
    7. Health check
```

## Pipeline Stages

1. ✓ Initialization & Validation
2. ✓ Git Checkout
3. ✓ AWS Authentication
4. ✓ Terraform Plan
5. ✓ Terraform Apply
6. ✓ Build Backend
7. ✓ Build Frontend
8. ✓ Test Images
9. ✓ Push to ECR
10. ✓ Deploy to EC2
11. ✓ Health Checks
12. ✓ Post-Deployment Summary

## AWS Resources Created

- VPC with subnet
- EC2 instance (t3.micro)
- ECR repositories (2)
- S3 bucket
- Security groups
- IAM roles
- CloudWatch logs

## Time Estimates

- First setup: 30 minutes
- First deployment: 20 minutes
- Subsequent deploys: 11 minutes

## Cost (First Year)

- **EC2 t3.micro**: FREE
- **S3**: FREE (5GB)
- **CloudWatch**: FREE (5GB logs)
- **Total**: **$0/month**

## After Free Tier

- EC2: ~$10/month
- S3: ~$1/month
- Data transfer: ~$2/month
- **Total**: ~$13/month

## Access After Deployment

- **Frontend**: http://<EC2-IP>:8080
- **Backend API**: http://<EC2-IP>:4000

## Prerequisites

- ✅ AWS account
- ✅ AWS CLI configured
- ✅ Docker installed
- ✅ Terraform installed
- ✅ Git installed

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Jenkins won't start | `docker logs jenkins` |
| AWS auth fails | `aws configure` |
| Terraform error | `terraform init -upgrade` |
| Deployment fails | Check Jenkins console logs |
| App not accessible | SSH to EC2: `ssh -i ~/.ssh/freshops-ai.pem ubuntu@<IP>` |

## Support

- Setup issues → `SETUP_GUIDE.md`
- Architecture questions → `README_DEPLOYMENT.md`
- Troubleshooting → Both guides have sections
- General overview → `IMPLEMENTATION_SUMMARY.md`

## Next Steps

1. Read: `EXECUTIVE_SUMMARY.md` (2 min)
2. Setup: `./quick-setup.sh` (15 min)
3. Configure: Follow `SETUP_GUIDE.md` Part 2 (10 min)
4. Deploy: `./deploy.sh prod true us-east-1` (20 min)

---

**Status:** ✅ Production Ready  
**Version:** 1.0  
**Updated:** April 30, 2024

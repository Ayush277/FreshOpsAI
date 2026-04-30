# Terraform Backend Configuration
# This file configures the remote state storage for Terraform

# To initialize with S3 backend, run:
# terraform init \
#   -backend-config="bucket=YOUR_BUCKET_NAME" \
#   -backend-config="key=freshops-ai/terraform.tfstate" \
#   -backend-config="region=us-east-1" \
#   -backend-config="dynamodb_table=terraform-lock"

# For local testing, you can use local backend by commenting out
# the backend configuration in main.tf

# Example S3 bucket naming: freshops-ai-terraform-state-XXXXXX
# Replace XXXXXX with timestamp or unique identifier

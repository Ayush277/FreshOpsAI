# Terraform variable values for FreshOps AI
# Replace the placeholders below with your actual AWS values before running terraform apply.

aws_region    = "us-east-1"
project_name  = "freshops-ai"
environment   = "prod"
instance_type = "t3.micro"

# This must be the exact name of an EC2 key pair that exists in your AWS account.
# You can create one in the AWS Console (EC2 > Key Pairs) or via AWS CLI.
key_name    = "freshops-ai-key"
bucket_name = "freshops-ai-images-ayush-20260427"

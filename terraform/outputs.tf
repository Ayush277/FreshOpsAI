# ==============================================================================
# FreshOps AI - Terraform Outputs
# Used by deployment scripts and Jenkins CI/CD pipeline
# ==============================================================================

output "ec2_instance_ip" {
  description = "The public IP address of the FreshOps AI EC2 instance"
  value       = aws_eip.app_server.public_ip
}

output "ec2_instance_id" {
  description = "EC2 Instance ID"
  value       = aws_instance.app_server.id
}

output "security_group_id" {
  description = "Security Group ID"
  value       = aws_security_group.app_sg.id
}

output "s3_bucket_name" {
  description = "The name of the S3 bucket created for image uploads"
  value       = aws_s3_bucket.image_bucket.id
}

output "s3_bucket_arn" {
  description = "S3 Bucket ARN"
  value       = aws_s3_bucket.image_bucket.arn
}

output "ecr_backend_repository_url" {
  description = "ECR Repository URL for Backend"
  value       = aws_ecr_repository.backend.repository_url
}

output "ecr_frontend_repository_url" {
  description = "ECR Repository URL for Frontend"
  value       = aws_ecr_repository.frontend.repository_url
}

output "cloudwatch_log_group" {
  description = "CloudWatch Log Group Name"
  value       = aws_cloudwatch_log_group.freshops.name
}

output "vpc_id" {
  description = "VPC ID"
  value       = aws_vpc.main.id
}

output "subnet_id" {
  description = "Subnet ID"
  value       = aws_subnet.public.id
}

output "application_url" {
  description = "Application Frontend URL"
  value       = "http://${aws_eip.app_server.public_ip}:8080"
}

output "api_url" {
  description = "Backend API URL"
  value       = "http://${aws_eip.app_server.public_ip}:4000"
}

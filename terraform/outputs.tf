# ==============================================================================
# FreshOps AI - Terraform Outputs
# Used by deployment scripts and Jenkins CI/CD pipeline
# ==============================================================================

output "ec2_public_ip" {
  description = "The public IP address of the FreshOps AI EC2 instance"
  value       = aws_instance.app_server.public_ip
}

output "ec2_public_dns" {
  description = "The public DNS name of the FreshOps AI EC2 instance"
  value       = aws_instance.app_server.public_dns
}

output "s3_bucket_name" {
  description = "The name of the S3 bucket created for image uploads"
  value       = aws_s3_bucket.image_bucket.id
}

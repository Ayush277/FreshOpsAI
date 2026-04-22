variable "aws_region" {
  description = "The AWS region to deploy resources into"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Name of the project used for resource naming"
  type        = string
  default     = "freshops-ai"
}

variable "environment" {
  description = "Environment name (e.g., dev, prod)"
  type        = string
  default     = "prod"
}

variable "instance_type" {
  description = "The EC2 instance type to deploy"
  type        = string
  default     = "t3.micro"
}

variable "key_name" {
  description = "The name of the SSH key pair deployed to AWS"
  type        = string
}

variable "bucket_name" {
  description = "The unique S3 bucket name for image uploads"
  type        = string
}

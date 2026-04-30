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
  description = "Environment name (e.g., dev, staging, prod)"
  type        = string
  default     = "prod"
  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be dev, staging, or prod."
  }
}

variable "instance_type" {
  description = "The EC2 instance type to deploy"
  type        = string
  default     = "t3.micro"
}

variable "root_volume_size" {
  description = "Root volume size in GB"
  type        = number
  default     = 30
}

variable "key_name" {
  description = "The name of the SSH key pair deployed to AWS"
  type        = string
  validation {
    condition     = length(var.key_name) > 0
    error_message = "Key name cannot be empty."
  }
}

variable "bucket_name" {
  description = "The base name for S3 bucket (account ID will be appended)"
  type        = string
  default     = "freshops-ai-uploads"
}

variable "log_retention_days" {
  description = "CloudWatch log retention in days"
  type        = number
  default     = 7
}

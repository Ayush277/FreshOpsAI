# ==============================================================================
# FreshOps AI - AWS Infrastructure
# Resources will be defined here (EC2, Security Groups, S3, etc.)
# ==============================================================================

# Data source for the latest Amazon Linux 2 AMI or Ubuntu AMI
data "aws_ami" "ubuntu" {
  most_recent = true

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }

  owners = ["099720109477"] # Canonical
}

# ==============================================================================
# Security Group
# ==============================================================================
resource "aws_security_group" "app_sg" {
  name        = "${var.project_name}-${var.environment}-sg"
  description = "Allow inbound SSH and HTTP traffic for FreshOps AI MVP"

  ingress {
    description = "SSH Access"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "Frontend Nginx / Docker"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "Backend Express API"
    from_port   = 4000
    to_port     = 4000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    description      = "Allow out-bound internet access"
    from_port        = 0
    to_port          = 0
    protocol         = "-1"
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-sg"
  }
}

# ==============================================================================
# EC2 Instance
# ==============================================================================
resource "aws_instance" "app_server" {
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = var.instance_type
  key_name               = var.key_name
  vpc_security_group_ids = [aws_security_group.app_sg.id]

  # Provision enough disk space to accommodate Docker images and builds
  root_block_device {
    volume_size = 20
    volume_type = "gp3"
  }

  tags = {
    Name = "${var.project_name}-server-${var.environment}"
  }
}

# ==============================================================================
# S3 Bucket Configuration
# ==============================================================================
resource "aws_s3_bucket" "image_bucket" {
  bucket = var.bucket_name

  tags = {
    Name = "FreshOps Image Uploads"
  }
}

# Configure CORS rules on the bucket to allow multipart uploads 
# (useful if bypassing the backend to upload straight from frontend later)
resource "aws_s3_bucket_cors_configuration" "image_bucket_cors" {
  bucket = aws_s3_bucket.image_bucket.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "PUT", "POST"]
    allowed_origins = ["*"]
    max_age_seconds = 3000
  }
}

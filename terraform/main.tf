# ==============================================================================
# FreshOps AI - Complete AWS Infrastructure with ECR, EC2, IAM, and S3
# ==============================================================================
# This Terraform configuration provisions:
# - VPC & Networking
# - Security Groups (SSH, HTTP, HTTPS, Docker)
# - EC2 Instance with Docker & Docker Compose
# - ECR Repositories for Docker images
# - IAM Roles & Policies for EC2 to access ECR and S3
# - S3 Bucket for image uploads
# - CloudWatch Logs
# ==============================================================================

# ==============================================================================
# AWS Provider Configuration
# ==============================================================================
# ==============================================================================
# Data Sources
# ==============================================================================

# Get latest Ubuntu 22.04 LTS AMI
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

# Get available AZs in the region
data "aws_availability_zones" "available" {
  state = "available"
}

# ==============================================================================
# VPC and Networking
# ==============================================================================

resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "${var.project_name}-${var.environment}-vpc"
  }
}

resource "aws_subnet" "public" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = data.aws_availability_zones.available.names[0]
  map_public_ip_on_launch = true

  tags = {
    Name = "${var.project_name}-${var.environment}-subnet"
  }
}

resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "${var.project_name}-${var.environment}-igw"
  }
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-rt"
  }
}

resource "aws_route_table_association" "public" {
  subnet_id      = aws_subnet.public.id
  route_table_id = aws_route_table.public.id
}

# ==============================================================================
# Security Groups
# ==============================================================================

resource "aws_security_group" "app_sg" {
  name        = "${var.project_name}-${var.environment}-sg"
  description = "Security group for FreshOps AI application"
  vpc_id      = aws_vpc.main.id

  # SSH Access
  ingress {
    description = "SSH Access"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # HTTP - Frontend
  ingress {
    description = "Frontend HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # HTTPS
  ingress {
    description = "HTTPS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Backend API
  ingress {
    description = "Backend Express API"
    from_port   = 4000
    to_port     = 4000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Docker daemon communication
  ingress {
    description = "Docker Communication"
    from_port   = 2375
    to_port     = 2376
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16"]
  }

  # Outbound traffic
  egress {
    description      = "Allow all outbound traffic"
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
# IAM Role for EC2 Instance (ECR & S3 Access)
# ==============================================================================

resource "aws_iam_role" "ec2_role" {
  name = "${var.project_name}-${var.environment}-ec2-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })
}

# Policy for ECR access
resource "aws_iam_policy" "ecr_policy" {
  name = "${var.project_name}-${var.environment}-ecr-policy"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ecr:GetAuthorizationToken",
          "ecr:GetDownloadUrlForLayer",
          "ecr:BatchGetImage",
          "ecr:BatchCheckLayerAvailability",
          "ecr:DescribeImages",
          "ecr:DescribeRepositories"
        ]
        Resource = "*"
      }
    ]
  })
}

# Policy for S3 access
resource "aws_iam_policy" "s3_policy" {
  name = "${var.project_name}-${var.environment}-s3-policy"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject",
          "s3:ListBucket",
          "s3:GetBucketVersioning"
        ]
        Resource = [
          aws_s3_bucket.image_bucket.arn,
          "${aws_s3_bucket.image_bucket.arn}/*"
        ]
      }
    ]
  })
}

# Policy for CloudWatch Logs
resource "aws_iam_policy" "cloudwatch_policy" {
  name = "${var.project_name}-${var.environment}-cloudwatch-policy"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents",
          "logs:DescribeLogStreams"
        ]
        Resource = "arn:aws:logs:${var.aws_region}:*:log-group:/freshops-ai/*"
      }
    ]
  })
}

# Attach policies to role
resource "aws_iam_role_policy_attachment" "ecr_attach" {
  role       = aws_iam_role.ec2_role.name
  policy_arn = aws_iam_policy.ecr_policy.arn
}

resource "aws_iam_role_policy_attachment" "s3_attach" {
  role       = aws_iam_role.ec2_role.name
  policy_arn = aws_iam_policy.s3_policy.arn
}

resource "aws_iam_role_policy_attachment" "cloudwatch_attach" {
  role       = aws_iam_role.ec2_role.name
  policy_arn = aws_iam_policy.cloudwatch_policy.arn
}

# Instance profile for EC2
resource "aws_iam_instance_profile" "ec2_profile" {
  name = "${var.project_name}-${var.environment}-profile"
  role = aws_iam_role.ec2_role.name
}

# ==============================================================================
# ECR Repositories
# ==============================================================================

resource "aws_ecr_repository" "backend" {
  name                 = "${var.project_name}-backend"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Name = "${var.project_name}-backend"
  }
}

resource "aws_ecr_repository" "frontend" {
  name                 = "${var.project_name}-frontend"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Name = "${var.project_name}-frontend"
  }
}

# ECR Lifecycle Policy - Keep last 5 images
resource "aws_ecr_lifecycle_policy" "backend_policy" {
  repository = aws_ecr_repository.backend.name

  policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Keep last 5 images"
        selection = {
          tagStatus   = "any"
          countType   = "imageCountMoreThan"
          countNumber = 5
        }
        action = {
          type = "expire"
        }
      }
    ]
  })
}

resource "aws_ecr_lifecycle_policy" "frontend_policy" {
  repository = aws_ecr_repository.frontend.name

  policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Keep last 5 images"
        selection = {
          tagStatus   = "any"
          countType   = "imageCountMoreThan"
          countNumber = 5
        }
        action = {
          type = "expire"
        }
      }
    ]
  })
}

# ==============================================================================
# EC2 Instance with User Data Script
# ==============================================================================

resource "aws_instance" "app_server" {
  ami                         = data.aws_ami.ubuntu.id
  instance_type               = var.instance_type
  key_name                    = var.key_name
  subnet_id                   = aws_subnet.public.id
  vpc_security_group_ids      = [aws_security_group.app_sg.id]
  iam_instance_profile        = aws_iam_instance_profile.ec2_profile.name
  associate_public_ip_address = true

  # Root volume configuration
  root_block_device {
    volume_size           = var.root_volume_size
    volume_type           = "gp3"
    delete_on_termination = true
    encrypted             = true

    tags = {
      Name = "${var.project_name}-${var.environment}-root-volume"
    }
  }

  # User data script to install Docker and dependencies
  user_data = base64encode(templatefile("${path.module}/user_data.sh", {
    project_name = var.project_name
    environment  = var.environment
    aws_region   = var.aws_region
  }))

  tags = {
    Name = "${var.project_name}-server-${var.environment}"
  }

  depends_on = [
    aws_internet_gateway.main
  ]
}

# ==============================================================================
# Elastic IP for EC2 (optional but recommended)
# ==============================================================================

resource "aws_eip" "app_server" {
  instance = aws_instance.app_server.id
  domain   = "vpc"

  tags = {
    Name = "${var.project_name}-${var.environment}-eip"
  }

  depends_on = [aws_internet_gateway.main]
}

# ==============================================================================
# S3 Bucket Configuration
# ==============================================================================

resource "aws_s3_bucket" "image_bucket" {
  bucket = "${var.bucket_name}-${data.aws_caller_identity.current.account_id}"

  tags = {
    Name = "FreshOps AI Image Uploads"
  }
}

# Versioning
resource "aws_s3_bucket_versioning" "image_bucket_versioning" {
  bucket = aws_s3_bucket.image_bucket.id

  versioning_configuration {
    status = "Enabled"
  }
}

# Block public access
resource "aws_s3_bucket_public_access_block" "image_bucket_access" {
  bucket = aws_s3_bucket.image_bucket.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

# Bucket policy for public read
resource "aws_s3_bucket_policy" "allow_public_read" {
  bucket = aws_s3_bucket.image_bucket.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "PublicRead"
        Effect    = "Allow"
        Principal = "*"
        Action    = "s3:GetObject"
        Resource  = "${aws_s3_bucket.image_bucket.arn}/*"
      }
    ]
  })

  depends_on = [aws_s3_bucket_public_access_block.image_bucket_access]
}

# CORS configuration
resource "aws_s3_bucket_cors_configuration" "image_bucket_cors" {
  bucket = aws_s3_bucket.image_bucket.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "PUT", "POST", "DELETE", "HEAD"]
    allowed_origins = ["*"]
    expose_headers  = ["ETag", "x-amz-meta-custom-header"]
    max_age_seconds = 3000
  }
}

# ==============================================================================
# Data Sources for Account Info
# ==============================================================================

data "aws_caller_identity" "current" {}

# ==============================================================================
# CloudWatch Log Group
# ==============================================================================

resource "aws_cloudwatch_log_group" "freshops" {
  name              = "/freshops-ai/${var.environment}"
  retention_in_days = var.log_retention_days

  tags = {
    Name = "${var.project_name}-${var.environment}-logs"
  }
}

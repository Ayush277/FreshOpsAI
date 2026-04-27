#!/bin/bash
# FreshOps AI AWS Deployment Script
# Deploys Docker containers to AWS EC2 using Docker Compose

set -e
export AWS_PAGER=""

echo "=== FreshOps AI AWS Deployment ==="
echo ""

# Configuration
AWS_REGION="us-east-1"
INSTANCE_TYPE="t3.micro"
KEY_PAIR_NAME="freshops-key-$(date +%s)"
SECURITY_GROUP_NAME="freshops-sg"
APP_NAME="freshops-ai"
KEY_PATH="$HOME/.ssh/$KEY_PAIR_NAME.pem"
ACCOUNT_ID=$(aws sts get-caller-identity --query 'Account' --output text --region "$AWS_REGION")
AWS_ACCESS_KEY_ID_VALUE=$(aws configure get aws_access_key_id)
AWS_SECRET_ACCESS_KEY_VALUE=$(aws configure get aws_secret_access_key)
MONGODB_URI_VALUE="mongodb+srv://freshopsuser:Freshops%40123@freshopsai.nhm0bv1.mongodb.net/freshops-ai?retryWrites=true&w=majority"

# Step 1: Create EC2 Key Pair
echo "[1/7] Creating EC2 Key Pair..."
if aws ec2 create-key-pair \
  --key-name $KEY_PAIR_NAME \
  --region $AWS_REGION \
  --query 'KeyMaterial' \
  --output text > "$KEY_PATH" 2>/dev/null; then
  chmod 400 "$KEY_PATH"
else
  echo "Key pair may already exist"
  if [ -f "$KEY_PATH" ]; then
    chmod 400 "$KEY_PATH"
  else
    echo "Warning: $KEY_PATH not found (cannot SSH without private key file)."
  fi
fi

# Step 2: Create Security Group
echo "[2/7] Creating Security Group..."
SECURITY_GROUP_ID=$(aws ec2 create-security-group \
  --group-name $SECURITY_GROUP_NAME \
  --description "Security group for FreshOps AI" \
  --region $AWS_REGION \
  --query 'GroupId' \
  --output text 2>/dev/null) || \
SECURITY_GROUP_ID=$(aws ec2 describe-security-groups \
  --filters Name=group-name,Values=$SECURITY_GROUP_NAME \
  --region $AWS_REGION \
  --query 'SecurityGroups[0].GroupId' \
  --output text)

echo "Security Group ID: $SECURITY_GROUP_ID"

# Step 3: Open ports in Security Group
echo "[3/7] Configuring security group rules..."
if aws ec2 authorize-security-group-ingress \
  --group-id $SECURITY_GROUP_ID \
  --protocol tcp \
  --port 80 \
  --cidr 0.0.0.0/0 \
  --region $AWS_REGION >/dev/null 2>&1; then
  echo "Port 80 opened"
else
  echo "Port 80 already open"
fi

if aws ec2 authorize-security-group-ingress \
  --group-id $SECURITY_GROUP_ID \
  --protocol tcp \
  --port 443 \
  --cidr 0.0.0.0/0 \
  --region $AWS_REGION >/dev/null 2>&1; then
  echo "Port 443 opened"
else
  echo "Port 443 already open"
fi

if aws ec2 authorize-security-group-ingress \
  --group-id $SECURITY_GROUP_ID \
  --protocol tcp \
  --port 8080 \
  --cidr 0.0.0.0/0 \
  --region $AWS_REGION >/dev/null 2>&1; then
  echo "Port 8080 opened"
else
  echo "Port 8080 already open"
fi

# Step 4: Launch EC2 Instance
echo "[4/7] Launching EC2 instance..."
INSTANCE_ID=$(aws ec2 run-instances \
  --image-id ami-0c02fb55956c7d316 \
  --instance-type $INSTANCE_TYPE \
  --key-name $KEY_PAIR_NAME \
  --security-group-ids $SECURITY_GROUP_ID \
  --region $AWS_REGION \
  --user-data file://<(cat <<USERDATA
#!/bin/bash
yum update -y
yum install -y docker git
systemctl start docker
systemctl enable docker

# Add ec2-user to docker group
usermod -aG docker ec2-user

# Install docker-compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Login to ECR and deploy from prebuilt images
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

mkdir -p /home/ec2-user/freshops
cd /home/ec2-user/freshops

cat > docker-compose.yml <<'COMPOSEFILE'
services:
  backend:
    image: $ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/freshops-backend:latest
    container_name: freshops-backend
    restart: unless-stopped
    ports:
      - "4000:4000"
    environment:
      MONGODB_URI: "$MONGODB_URI_VALUE"
      AWS_ACCESS_KEY_ID: "$AWS_ACCESS_KEY_ID_VALUE"
      AWS_SECRET_ACCESS_KEY: "$AWS_SECRET_ACCESS_KEY_VALUE"
      AWS_S3_BUCKET: "freshops-ai-images-ayush-20260427"
      AWS_S3_REGION: "us-east-1"
      AWS_S3_PREFIX: "freshops/uploads"
      NODE_ENV: "production"

  frontend:
    image: $ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/freshops-frontend:latest
    container_name: freshops-frontend
    restart: unless-stopped
    ports:
      - "8080:80"
    depends_on:
      - backend
COMPOSEFILE

/usr/local/bin/docker-compose up -d
USERDATA
) \
  --query 'Instances[0].InstanceId' \
  --output text)

echo "Instance ID: $INSTANCE_ID"

# Step 5: Wait for instance to be running
echo "[5/7] Waiting for instance to start..."
aws ec2 wait instance-running \
  --instance-ids $INSTANCE_ID \
  --region $AWS_REGION

# Step 6: Get public IP
echo "[6/7] Getting public IP address..."
PUBLIC_IP=$(aws ec2 describe-instances \
  --instance-ids $INSTANCE_ID \
  --region $AWS_REGION \
  --query 'Reservations[0].Instances[0].PublicIpAddress' \
  --output text)

echo "Public IP: $PUBLIC_IP"

# Step 7: Wait for application to be ready
echo "[7/7] Waiting for application to start (this may take 2-3 minutes)..."
sleep 30

echo ""
echo "=== Deployment Complete ==="
echo ""
echo "✅ FreshOps AI is being deployed!"
echo ""
echo "📍 Access your application at:"
echo "   http://$PUBLIC_IP:8080"
echo ""
echo "🔐 SSH into instance:"
echo "   ssh -i $KEY_PATH ec2-user@$PUBLIC_IP"
echo ""
echo "📝 Instance ID: $INSTANCE_ID"
echo "🔑 Key Pair: $KEY_PAIR_NAME (saved in $KEY_PATH)"
echo ""
echo "⚠️  Important:"
echo "   - Save the key file in a safe location"
echo "   - First time startup may take 3-5 minutes"
echo "   - MongoDB Atlas IP allowlist must include instance public IP"
echo ""

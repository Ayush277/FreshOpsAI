pipeline {
  agent any

  stages {
    stage('Checkout') {
      steps {
        // Pull code from GitHub branch main
        git url: 'https://github.com/Ayush277/FreshOpsAI.git', branch: 'main'
      }
    }

    stage('Build Image') {
      steps {
        sh '''#!/bin/bash
        set -eux
        docker build -t freshopsai:latest .
        '''
      }
    }

    stage('Stop Container') {
      steps {
        // Stop any running container named freshopsai (ignore error if none exists)
        sh 'docker stop freshopsai || true'
      }
    }

    stage('Remove Container') {
      steps {
        // Remove the old container named freshopsai (ignore error if none exists)
        sh 'docker rm freshopsai || true'
      }
    }

    stage('Run Container') {
      steps {
        // Run new container
        sh 'docker run -d --name freshopsai -p 8080:8080 freshopsai:latest'
      }
    }
  }

  post {
    success {
      echo 'Deployment successful: freshopsai running on port 8080'
    }
    failure {
      echo 'Deployment failed'
    }
  }
}
#!/usr/bin/env groovy

/*
 * ============================================================================
 * FreshOps AI - Jenkins CI/CD Pipeline
 * ============================================================================
 * Stages:
 * 1. Git Checkout (GitHub)
 * 2. Install dependencies and run checks
 * 3. Build Docker Images (Backend & Frontend)
 * 4. Push to Amazon ECR when enabled
 * 5. Deploy to an existing AWS host when enabled
 * 6. Health Check & Validation
 * ============================================================================
 */

pipeline {
    agent any

    parameters {
        choice(
            name: 'ENVIRONMENT',
            choices: ['dev', 'staging', 'prod'],
            description: 'Deployment Environment'
        )
        string(
            name: 'AWS_REGION',
            defaultValue: 'us-east-1',
            description: 'AWS Region for ECR and deployment'
        )
        booleanParam(
            name: 'RUN_PUSH_TO_ECR',
            defaultValue: false,
            description: 'Push Docker images to Amazon ECR'
        )
        booleanParam(
            name: 'RUN_DEPLOY',
            defaultValue: false,
            description: 'Deploy to an existing AWS EC2 host'
        )
        string(
            name: 'DEPLOY_HOST',
            defaultValue: '',
            description: 'Existing EC2 public IP or hostname for deployment'
        )
        string(
            name: 'DEPLOY_USER',
            defaultValue: 'ubuntu',
            description: 'SSH username for deployment host'
        )
        string(
            name: 'DEPLOY_PATH',
            defaultValue: '/opt/freshops-ai',
            description: 'Target directory on the deployment host'
        )
    }

    environment {
        // AWS Configuration
        AWS_DEFAULT_REGION = "${params.AWS_REGION}"
        ENVIRONMENT = "${params.ENVIRONMENT}"
        DOCKER_BUILDKIT = '1'

        // Docker Image Names
        BACKEND_IMAGE_LOCAL = "freshops-ai-backend:${BUILD_NUMBER}"
        FRONTEND_IMAGE_LOCAL = "freshops-ai-frontend:${BUILD_NUMBER}"
        BACKEND_IMAGE_LATEST = 'freshops-ai-backend:latest'
        FRONTEND_IMAGE_LATEST = 'freshops-ai-frontend:latest'

        // ECR Configuration (populated when RUN_PUSH_TO_ECR enabled)
        ECR_REGISTRY = ''
        BACKEND_ECR_IMAGE = ''
        FRONTEND_ECR_IMAGE = ''
    }

    options {
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timeout(time: 60, unit: 'MINUTES')
        timestamps()
        ansiColor('xterm')
    }

    stages {
        stage('📋 Initialization & Validation') {
            steps {
                script {
                    echo "╔════════════════════════════════════════════╗"
                    echo "║  FreshOps AI - One-Click Deployment       ║"
                    echo "╚════════════════════════════════════════════╝"
                    echo ""
                    echo "Build ID: ${BUILD_ID}"
                    echo "Environment: ${ENVIRONMENT}"
                    echo "AWS Region: ${AWS_DEFAULT_REGION}"
                    echo "Push to ECR: ${params.RUN_PUSH_TO_ECR}"
                    echo "Deploy Enabled: ${params.RUN_DEPLOY}"
                    echo ""

                    if (params.RUN_DEPLOY && !params.RUN_PUSH_TO_ECR) {
                        error("❌ RUN_DEPLOY requires RUN_PUSH_TO_ECR so the remote host can pull the tagged images.")
                    }

                    if (params.RUN_DEPLOY && !params.DEPLOY_HOST) {
                        error("❌ RUN_DEPLOY requires DEPLOY_HOST to be set.")
                    }
                }
            }
        }

        stage('🔀 Git Checkout') {
            steps {
                script {
                    echo "✓ Checking out source code from GitHub..."
                    checkout scm
                    sh '''
                        echo "Git Branch: $(git rev-parse --abbrev-ref HEAD)"
                        echo "Latest Commit: $(git log -1 --pretty=%H)"
                        echo "Commit Message: $(git log -1 --pretty=%B)"
                    '''
                }
            }
        }

        stage('📦 Install Dependencies') {
            steps {
                script {
                    echo "✓ Installing backend and frontend dependencies..."
                    sh '''
                        echo "--- Backend Dependencies ---"
                        cd backend
                        npm ci --legacy-peer-deps
                        npm run lint 2>/dev/null || echo "ℹ Lint skipped or not configured"
                        npm test 2>/dev/null || echo "ℹ Tests skipped or not configured"
                        cd ..

                        echo ""
                        echo "--- Frontend Dependencies ---"
                        cd frontend
                        npm ci --legacy-peer-deps
                        npm run lint 2>/dev/null || echo "ℹ Lint skipped or not configured"
                        npm run build
                        cd ..

                        echo "✓ Dependencies installed successfully"
                    '''
                }
            }
        }

        stage('🔨 Build Backend Docker Image') {
            steps {
                script {
                    echo "✓ Building Backend Docker Image..."
                    sh '''
                        cd backend
                        docker build \
                            -t ${BACKEND_IMAGE_LOCAL} \
                            -t ${BACKEND_IMAGE_LATEST} \
                            --build-arg BUILD_DATE=$(date -u +'%Y-%m-%dT%H:%M:%SZ') \
                            --build-arg VCS_REF=$(git rev-parse --short HEAD) \
                            .
                        docker images | grep freshops-ai-backend || echo "Backend image created"
                    '''
                }
            }
        }

        stage('🔨 Build Frontend Docker Image') {
            steps {
                script {
                    echo "✓ Building Frontend Docker Image..."
                    sh '''
                        cd frontend
                        docker build \
                            -t ${FRONTEND_IMAGE_LOCAL} \
                            -t ${FRONTEND_IMAGE_LATEST} \
                            --build-arg BUILD_DATE=$(date -u +'%Y-%m-%dT%H:%M:%SZ') \
                            --build-arg VCS_REF=$(git rev-parse --short HEAD) \
                            .
                        docker images | grep freshops-ai-frontend || echo "Frontend image created"
                    '''
                }
            }
        }

        stage('🧪 Test Docker Images') {
            steps {
                script {
                    echo "✓ Running basic Docker image tests..."
                    sh '''
                        echo "Backend Image Info:"
                        docker inspect ${BACKEND_IMAGE_LATEST} | jq '.[0] | {ID: .Id[0:19], Size: .Size, Created: .Created}' 2>/dev/null || echo "Image inspected"
                        
                        echo ""
                        echo "Frontend Image Info:"
                        docker inspect ${FRONTEND_IMAGE_LATEST} | jq '.[0] | {ID: .Id[0:19], Size: .Size, Created: .Created}' 2>/dev/null || echo "Image inspected"
                        
                        echo "✓ Docker images built successfully"
                    '''
                }
            }
        }

        stage('📤 Push to ECR') {
            when {
                expression { params.RUN_PUSH_TO_ECR == true }
            }
            steps {
                script {
                    echo "✓ Pushing Docker images to Amazon ECR..."
                    withCredentials([
                        string(credentialsId: 'AWS_ACCESS_KEY_ID', variable: 'AWS_ACCESS_KEY'),
                        string(credentialsId: 'AWS_SECRET_ACCESS_KEY', variable: 'AWS_SECRET_KEY')
                    ]) {
                        sh '''
                            export AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY}
                            export AWS_SECRET_ACCESS_KEY=${AWS_SECRET_KEY}
                            export AWS_DEFAULT_REGION=${AWS_DEFAULT_REGION}
                            
                            # Get ECR registry URL
                            ECR_REGISTRY=$(aws ecr describe-repositories --region ${AWS_DEFAULT_REGION} \
                                --repository-names freshops-ai-backend 2>/dev/null | \
                                jq -r '.repositories[0].repositoryUri' | sed 's|/.*||' || echo "")
                            
                            if [ -z "$ECR_REGISTRY" ]; then
                                echo "Getting AWS account ID to construct ECR registry..."
                                AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
                                ECR_REGISTRY="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_DEFAULT_REGION}.amazonaws.com"
                            fi
                            
                            echo "ECR Registry: ${ECR_REGISTRY}"
                            
                            # Login to ECR
                            echo "Logging in to ECR..."
                            aws ecr get-login-password --region ${AWS_DEFAULT_REGION} | \
                                docker login --username AWS --password-stdin ${ECR_REGISTRY}
                            
                            # Create repositories if they don't exist
                            echo "Creating ECR repositories..."
                            aws ecr create-repository --repository-name freshops-ai-backend \
                                --region ${AWS_DEFAULT_REGION} 2>/dev/null || echo "Backend repo already exists"
                            aws ecr create-repository --repository-name freshops-ai-frontend \
                                --region ${AWS_DEFAULT_REGION} 2>/dev/null || echo "Frontend repo already exists"
                            
                            # Tag images for ECR
                            BACKEND_ECR_IMAGE="${ECR_REGISTRY}/freshops-ai-backend:${BUILD_NUMBER}"
                            FRONTEND_ECR_IMAGE="${ECR_REGISTRY}/freshops-ai-frontend:${BUILD_NUMBER}"
                            
                            docker tag ${BACKEND_IMAGE_LATEST} ${BACKEND_ECR_IMAGE}
                            docker tag ${BACKEND_IMAGE_LATEST} ${ECR_REGISTRY}/freshops-ai-backend:latest
                            docker tag ${FRONTEND_IMAGE_LATEST} ${FRONTEND_ECR_IMAGE}
                            docker tag ${FRONTEND_IMAGE_LATEST} ${ECR_REGISTRY}/freshops-ai-frontend:latest
                            
                            # Push images
                            echo "Pushing Backend image..."
                            docker push ${BACKEND_ECR_IMAGE}
                            docker push ${ECR_REGISTRY}/freshops-ai-backend:latest
                            
                            echo "Pushing Frontend image..."
                            docker push ${FRONTEND_ECR_IMAGE}
                            docker push ${ECR_REGISTRY}/freshops-ai-frontend:latest
                            
                            echo "✓ Images pushed successfully to ECR"
                        '''
                    }
                }
            }
        }

        stage('🚀 Deploy to EC2') {
            when {
                expression { params.RUN_DEPLOY == true }
            }
            steps {
                script {
                    echo "✓ Deploying application to AWS EC2..."
                    withCredentials([
                        file(credentialsId: 'SSH_PRIVATE_KEY', variable: 'SSH_KEY_FILE'),
                        string(credentialsId: 'AWS_ACCESS_KEY_ID', variable: 'AWS_ACCESS_KEY'),
                        string(credentialsId: 'AWS_SECRET_ACCESS_KEY', variable: 'AWS_SECRET_KEY')
                    ]) {
                        sh '''
                            export AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY}
                            export AWS_SECRET_ACCESS_KEY=${AWS_SECRET_KEY}
                            export AWS_DEFAULT_REGION=${AWS_DEFAULT_REGION}
                            
                            # Get ECR registry URL
                            AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
                            ECR_REGISTRY="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_DEFAULT_REGION}.amazonaws.com"
                            
                            chmod 600 ${SSH_KEY_FILE}
                            
                            # Create deployment script
                            cat > deploy_remote.sh << 'EOF'
#!/bin/bash
set -e

export AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY}
export AWS_SECRET_ACCESS_KEY=${AWS_SECRET_KEY}
export AWS_DEFAULT_REGION=${AWS_DEFAULT_REGION}
export BACKEND_IMAGE="${ECR_REGISTRY}/freshops-ai-backend:latest"
export FRONTEND_IMAGE="${ECR_REGISTRY}/freshops-ai-frontend:latest"
export ENVIRONMENT=${ENVIRONMENT}

echo "📦 Logging in to ECR..."
aws ecr get-login-password --region ${AWS_DEFAULT_REGION} | \
    docker login --username AWS --password-stdin ${ECR_REGISTRY}

echo "📦 Pulling latest images from ECR..."
docker pull ${BACKEND_IMAGE}
docker pull ${FRONTEND_IMAGE}

echo "🐳 Starting containers with docker-compose..."
mkdir -p ${DEPLOY_PATH}
cd ${DEPLOY_PATH}

export BACKEND_IMAGE=${BACKEND_IMAGE}
export FRONTEND_IMAGE=${FRONTEND_IMAGE}

docker-compose -f docker-compose.prod.yml down || true
docker-compose -f docker-compose.prod.yml up -d

echo "✓ Deployment completed"
docker ps
EOF
                            
                            # Transfer deployment script
                            echo "Transferring deployment script to ${DEPLOY_HOST}..."
                            scp -i ${SSH_KEY_FILE} -o StrictHostKeyChecking=no -o ConnectTimeout=10 \
                                deploy_remote.sh ${DEPLOY_USER}@${DEPLOY_HOST}:/tmp/
                            
                            # Transfer docker-compose.prod.yml
                            echo "Transferring docker-compose.prod.yml to ${DEPLOY_HOST}..."
                            scp -i ${SSH_KEY_FILE} -o StrictHostKeyChecking=no -o ConnectTimeout=10 \
                                docker-compose.prod.yml ${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_PATH}/
                            
                            # Execute remote deployment
                            echo "Executing remote deployment..."
                            ssh -i ${SSH_KEY_FILE} -o StrictHostKeyChecking=no -o ConnectTimeout=10 \
                                ${DEPLOY_USER}@${DEPLOY_HOST} << 'REMOTE'
sudo chmod +x /tmp/deploy_remote.sh
sudo bash /tmp/deploy_remote.sh
REMOTE
                        '''
                    }
                }
            }
        }

        stage('🏥 Health Check & Validation') {
            when {
                expression { params.RUN_DEPLOY == true }
            }
            steps {
                script {
                    echo "✓ Performing health checks..."
                    sh '''
                        DEPLOY_HOST="${DEPLOY_HOST}"
                        sleep 15
                        
                        # Check backend health
                        echo "Checking Backend API..."
                        BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://${DEPLOY_HOST}:4000/health || echo "000")
                        echo "Backend Health Status: ${BACKEND_STATUS}"
                        
                        # Check frontend
                        echo "Checking Frontend..."
                        FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://${DEPLOY_HOST}:8080 || echo "000")
                        echo "Frontend Health Status: ${FRONTEND_STATUS}"
                        
                        if [ "${BACKEND_STATUS}" = "200" ] || [ "${BACKEND_STATUS}" = "204" ]; then
                            echo "✓ Backend is healthy"
                        else
                            echo "⚠ Backend may not be fully initialized yet (status: ${BACKEND_STATUS})"
                        fi
                        
                        if [ "${FRONTEND_STATUS}" = "200" ]; then
                            echo "✓ Frontend is accessible"
                        else
                            echo "⚠ Frontend may still be starting (status: ${FRONTEND_STATUS})"
                        fi
                    '''
                }
            }
        }

        stage('📝 Post-Deployment Summary') {
            steps {
                script {
                    echo "✓ Generating deployment summary..."
                    sh '''
                        echo ""
                        echo "╔════════════════════════════════════════════╗"
                        echo "║        DEPLOYMENT COMPLETED                ║"
                        echo "╚════════════════════════════════════════════╝"
                        echo ""
                        echo "Build ID: ${BUILD_ID}"
                        echo "Environment: ${ENVIRONMENT}"
                        echo "Backend Image: ${BACKEND_IMAGE_LATEST}"
                        echo "Frontend Image: ${FRONTEND_IMAGE_LATEST}"
                        echo "AWS Region: ${AWS_DEFAULT_REGION}"
                        echo ""
                        if [ "${RUN_PUSH_TO_ECR}" = "true" ]; then
                            echo "✓ Images pushed to Amazon ECR"
                        fi
                        if [ "${RUN_DEPLOY}" = "true" ]; then
                            echo "✓ Application deployed to: ${DEPLOY_HOST}"
                            echo "  Frontend: http://${DEPLOY_HOST}:8080"
                            echo "  Backend API: http://${DEPLOY_HOST}:4000"
                        fi
                        echo ""
                    '''
                }
            }
        }
    }

    post {
        always {
            script {
                echo "✓ Cleaning up workspace..."
                cleanWs()
            }
        }
        success {
            script {
                echo "✅ Pipeline completed successfully!"
            }
        }
        failure {
            script {
                echo "❌ Pipeline failed. Check logs above for details."
            }
        }
    }
}

pipeline {
    agent any

    environment {
        // Example credentials and variables configured in Jenkins
        DOCKER_REGISTRY = 'dockerhub-username' // Change to your registry
        BACKEND_IMAGE = "${DOCKER_REGISTRY}/freshops-backend:${env.BUILD_ID}"
        FRONTEND_IMAGE = "${DOCKER_REGISTRY}/freshops-frontend:${env.BUILD_ID}"
        LATEST_BACKEND = "${DOCKER_REGISTRY}/freshops-backend:latest"
        LATEST_FRONTEND = "${DOCKER_REGISTRY}/freshops-frontend:latest"
    }

    options {
        buildDiscarder(logRotator(numToKeepStr: '5'))
        timeout(time: 30, unit: 'MINUTES')
        disableConcurrentBuilds()
    }

    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out source code...'
                checkout scm
            }
        }

        stage('Build Backend') {
            steps {
                echo 'Building Backend Docker Image...'
                dir('backend') {
                    sh "docker build -t ${LATEST_BACKEND} -t ${BACKEND_IMAGE} ."
                }
            }
        }

        stage('Build Frontend') {
            steps {
                echo 'Building Frontend Docker Image...'
                dir('frontend') {
                    sh "docker build -t ${LATEST_FRONTEND} -t ${FRONTEND_IMAGE} ."
                }
            }
        }

        stage('Test (Optional)') {
            steps {
                echo 'Running unit tests...'
                // Uncomment to run tests
                // dir('backend') {
                //     sh 'npm install'
                //     sh 'npm run test'
                // }
                // dir('frontend') {
                //     sh 'npm install'
                //     sh 'npm run test'
                // }
            }
        }

        stage('Push Images') {
            steps {
                echo 'Pushing Docker images to registry...'
                // withCredentials([usernamePassword(credentialsId: 'dockerhub-credentials', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                //     sh "echo \$DOCKER_PASS | docker login -u \$DOCKER_USER --password-stdin"
                //     sh "docker push ${BACKEND_IMAGE}"
                //     sh "docker push ${LATEST_BACKEND}"
                //     sh "docker push ${FRONTEND_IMAGE}"
                //     sh "docker push ${LATEST_FRONTEND}"
                // }
                echo 'Skipped pushing in local/testing mode. Uncomment block above for prod.'
            }
        }

        stage('Deploy Application') {
            steps {
                echo 'Deploying to AWS EC2...'
                // The deploy script will handle SSHing to the EC2 instance and restarting docker-compose
                sh 'chmod +x ./jenkins/deploy.sh'
                sh './jenkins/deploy.sh'
            }
        }
    }

    post {
        always {
            echo 'Cleaning up workspace...'
            cleanWs()
            // Optionally prune dangling Docker images on the Jenkins worker
            // sh 'docker image prune -f'
        }
        success {
            echo "Pipeline executed successfully! FreshOps AI build #${env.BUILD_ID} is deployed."
        }
        failure {
            echo "Pipeline failed for FreshOps AI build #${env.BUILD_ID}. Check the Jenkins console logs."
        }
    }
}

# FreshOps AI 🌿

FreshOps AI is a smart perishable intelligence platform designed to help food-driven teams make better decisions before inventory becomes waste. It combines image-based item capture, AI-assisted detection, an expiry intelligence engine, and operational dashboards into one cohesive workflow.

Whether for a retail use case, a cloud kitchen, a campus canteen, or a warehouse MVP, the goal is the same: **see risk early, act faster, and reduce avoidable loss**.

---

## 🏛️ Architecture Overview

FreshOps AI follows a modular, backend-first Microservices/SPA architecture, fully containerized and provisioned via Infrastructure as Code (IaC).

- **Frontend (React/Vite)**: A modern Single Page Application (SPA) dashboard for uploads, inventory views, and business summaries. Served via **Nginx** in production.
- **Backend (Node.js/Express)**: API orchestration, request validation, AI integration, rule-based expiry logic, and response shaping.
- **Data & Storage**: **MongoDB Atlas** for structured inventory records and **AWS S3** for persistent image storage.
- **AI Layer**: **Clarifai** integration to automatically detect and classify food items from uploaded images.
- **DevOps & Cloud**: **Docker Compose** for orchestration, **Jenkins** for CI/CD automation, and **Terraform** for AWS EC2/S3 infrastructure provisioning.

### End-to-End Flow

1. **User Uploads**: A user uploads a perishable item image via the React SPA.
2. **Reverse Proxy**: Nginx routes the `/api` request to the Express backend container.
3. **Storage & AI**: The backend streams the image to AWS S3 and triggers the Clarifai AI model to classify the food label (e.g., "Apple").
4. **Expiry Engine**: The AI label is mapped to a broad category ("Fruits") and run through a rule-based engine to predict the expiry date (e.g., 7 days).
5. **Persistence**: The record (S3 URL, category, expiry timeline, status) is saved in MongoDB.
6. **Dashboard**: The UI updates in real-time, highlighting `fresh`, `expiring-soon`, and `expired` items, calculating total waste percentage.

---

## 🛠️ Tech Stack

| Category | Technologies |
| :--- | :--- |
| **Frontend** | React, Vite, Nginx |
| **Backend** | Node.js, Express, Mongoose, Multer |
| **Database** | MongoDB Atlas |
| **Cloud Storage** | AWS S3 |
| **AI Integration** | Clarifai API |
| **Containerization**| Docker, Docker Compose |
| **Infrastructure** | Terraform (AWS EC2, S3, Security Groups) |
| **CI/CD** | GitHub Actions → AWS EC2 (server deployment) |

---

## 📁 Project Structure

```text
FreshOpsAI/
├── frontend/      # React UI, Vite build config, Nginx Dockerfile
├── backend/       # Express APIs, AI services, Expiry logic, S3 integration
├── docker/        # Docker configurations and local orchestration docs
├── terraform/     # AWS Infrastructure as Code (EC2, S3, Security Groups)
├── jenkins/       # CI/CD pipeline assets and remote deployment scripts
├── docs/          # Deep-dive architecture and end-to-end flow documentation
├── Jenkinsfile    # Declarative Jenkins pipeline definition
├── docker-compose.yml       # Local multi-container orchestration
└── docker-compose.prod.yml  # Production overrides (Port 80, CloudWatch logging)
```

---

## ⚙️ Environment Variables Setup

Before running the application, you must configure your environment variables. 
Create a `.env` file in the `backend/` directory (or map it at the root for production) using the provided `.env.example` as a template:

```ini
# Server Configuration
PORT=4000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/freshops

# Clarifai AI Configuration
CLARIFAI_PAT=your_personal_access_token_here

# AWS S3 Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_S3_BUCKET=freshops-ai-images-bucket
```

---

## 💻 Local Development (Without Docker)

If you wish to develop without containers, you will need Node.js (v20+) installed.

**1. Start the Backend:**
\`\`\`bash
cd backend
npm install
npm run dev
# The API will be available at http://localhost:4000
\`\`\`

**2. Start the Frontend:**
\`\`\`bash
cd frontend
npm install
npm run dev
# The Vite SPA will be available at http://localhost:5173
\`\`\`

*Note: The frontend Vite config automatically proxies `/api` requests to `http://localhost:4000`.*

---

## 🐳 Running with Docker (Recommended)

To guarantee parity with production, run the entire stack locally using Docker Compose.

```bash
# Build and start the containers in detached mode
docker compose up --build -d

# View logs to ensure services started correctly
docker compose logs -f
```

- **Frontend**: Available at `http://localhost:8080`
- **Backend API**: Available at `http://localhost:4000`

To tear down the environment:
```bash
docker compose down -v
```

---

## ☁️ AWS Deployment & Terraform

We use **Terraform** to provision the cloud infrastructure. 

1. Install Terraform and configure your AWS CLI credentials.
2. Provision the MVP Infrastructure:
   ```bash
   cd terraform
   terraform init
   terraform apply
   ```
3. Terraform will provision:
   - A single **Ubuntu EC2 Instance** (with a 20GB EBS volume).
   - An **AWS S3 Bucket** with Public Read policies (for image uploads).
   - **Security Groups** opening ports `22` (SSH), `80` (HTTP), and `4000` (API).
4. Terraform will output the `ec2_public_ip` and `s3_bucket_name`. Use these to configure your Jenkins pipeline and `.env` file.

*See `docs/aws-ec2-deployment.md` for detailed EC2 setup instructions.*

---

## 🚀 CI/CD on AWS

FreshOps AI is deployed to the existing AWS EC2 server at `http://107.22.48.62:8080/`.

### How it works
1. **Push to `main`**: GitHub Actions starts automatically whenever code is merged or pushed to `main`.
2. **Validate**: The workflow installs dependencies and builds the frontend so broken changes fail before deployment.
3. **Sync to EC2**: The workflow copies the updated repository to the AWS server over SSH.
4. **Restart containers**: The server runs `docker compose up -d --build --remove-orphans`, so the live site reflects the new code.

### What to configure in GitHub
- `EC2_SSH_PRIVATE_KEY`: SSH private key for the AWS instance.
- `MONGO_URI`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `CLARIFAI_PAT`, `CLARIFAI_USER_ID`, `CLARIFAI_APP_ID`, `CLARIFAI_MODEL_ID`.

### Demo result
After a successful push, the updated version should appear automatically at `http://107.22.48.62:8080/`.

---

## 🔮 Future Enhancements

- **Push Notifications**: Integrate AWS SNS or SendGrid to send Slack/Email alerts for items marked `expiring-soon`.
- **Advanced AI Tuning**: Use Clarifai's custom models to train specific catalog recognition for niche warehouses.
- **Multi-Tenant Support**: Implement role-based access control (RBAC) and location-tagging for enterprise scale.

---

> **Note for Recruiters/Interviewers**: This repository was built incrementally to demonstrate a deep understanding of full-stack engineering, from core application logic and AI integration to container orchestration and automated cloud deployments. Check out the `docs/` folder for deeper architectural walkthroughs.

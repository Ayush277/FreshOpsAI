# FreshOps AI - End-to-End Architecture & Flow

This document verifies the end-to-end integration mapping across the entire FreshOps AI project lifecycle, spanning the frontend user layer to the target cloud infrastructure.

## 1. Request Flow (Frontend to Backend)

1. **User Interaction**: The user accesses the React UI (served by an Nginx container on port 80). They fill out the upload form on `/upload` and select an image.
2. **API Proxy**: The frontend makes an API call to `/api/upload`. Nginx uses an internal `proxy_pass` to route this request seamlessly (bypassing CORS entirely) to the Express backend container running on port `4000` via the internal Docker bridge network (`http://backend:4000/upload`).

## 2. Backend Orchestration & Data Processing

Once the Node.js/Express backend (`/upload`) receives the request:
1. **S3 Upload**: The backend reads the incoming multipart image buffer. It establishes a connection via the AWS SDK using injected `.env` credentials and pushes the image into the S3 `image_bucket`. It receives a publicly accessible S3 URL.
2. **AI Detection (Clarifai)**: The backend securely bridges to the external Clarifai SDK. It streams the image buffer mapping the pixels against the generalized food model (`app.models.predict`) to return the highest confidence label (e.g., "apple").
3. **Expiry Engine**: The detected label flows into the rule-based expiry engine module (`calculateExpiryPlan()`). The engine maps the detected label into broad generalized categories (e.g., Apple -> "fruits"). It applies the rule logic to tag the item with an expiry date and dynamically generates `daysRemaining`. 
4. **MongoDB Persistence**: Mongoose establishes a connection to MongoDB Atlas. A new `InventoryItem` record is created, permanently storing the detected label, unified category, expiry mapping, S3 URL, and current physical condition (fresh/expiring/expired). 

## 3. Operations & Observability

- **Analytics Dashboard**: The dashboard polls `/api/dashboard/summary`. The API translates that into a MongoDB aggregated projection across the `status` tags, returning live calculations for total fresh UI items and computed waste percentage models.
- **Structured Logging**: Using standard `NODE_ENV=production` setups, all backend transactions output safely formatted JSON logs without humanized color-codes. This ensures they are CloudWatch-friendly for downstream AWS log capture.

## 4. DevOps & Cloud Configuration

1. **Container Alignment**: 
   - **Frontend** utilizes multi-stage Docker build, freezing Vite assets, before injecting them into a lightweight 20MB `nginx:alpine` server. Nginx acts as both the SPA fallback (`try_files`) and proxy router.
   - **Backend** utilizes `node:22-alpine` cleanly structured with non-root security principles (`chown node:node`).
2. **Terraform S3 / EC2**: Terraform successfully spins up an `aws_instance` (22.04 LTS Ubuntu) dynamically sizing disk-space (20GB gp3) to sustain Docker loads, configuring Security Groups natively on ports 80, 4000, and 22. It generates `outputs` exporting the EC2 public networking domains dynamically and specifically configures public-read access policies on the S3 resource so the URL bindings display seamlessly in React.
3. **Jenkins CI/CD Automation**: A fully committed `Jenkinsfile` orchestrates code-checkouts, image builds natively tracking `${env.BUILD_ID}`, and pushes to your target Docker Registry. It automatically terminates the build pipeline if unit-tests fail. 
4. **Deploy Script**: Jenkins executes `jenkins/deploy.sh` remotely via Secure SSH block mapping against the EC2 instance, substituting the `FRONTEND_IMAGE` and `BACKEND_IMAGE` tags respectively. Deploy script runs `docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --force-recreate` successfully bringing the application to a Highly Available target state securely overriding development `.env` references.

## Integration Inconsistencies Fixed

During final alignment, the following constraints were resolved natively against original requirements:
- Reconfigured Nginx to serve incoming backend API traffic over `/api` paths removing hard-coupled API variables from React `fetch` layers bridging cleanly between Dev (Vite proxy) and Prod.
- Modified Docker-Compose contexts ensuring `docker-compose.prod.yml` correctly mounts `env_file: - .env` natively overriding local paths on EC2 target servers, enabling smooth environment segregation.
- Removed AWS S3 Block Public Access implicitly ensuring S3 URL image links injected into DocumentDB natively render in user browsers effortlessly alongside accurate CORS parameters.
- Restructured `deploy.sh` to fully expand remote pipeline environmental variables natively before firing standard OpenSSH tunnels keeping the CD orchestration perfectly stable.

> **Result**: MVP reaches full deployment maturity efficiently mapping modern DevOps workflows natively into Cloud architectures ensuring zero manual interventions apart from provisioning initial secrets!

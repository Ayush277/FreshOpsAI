# FreshOps AI: Interview Preparation Guide

This document provides structured explanations of FreshOps AI at varying lengths, along with potential interview questions and strong, architecturally aligned answers.

---

## ⏱️ 30-Second Explanation (The Elevator Pitch)

"FreshOps AI is a full-stack, cloud-deployed inventory management platform designed to reduce food waste. Users upload photos of perishable items, and the system uses the Clarifai AI API to automatically detect the food type. It then runs through a custom expiry engine to predict shelf life, storing the data in MongoDB and the images in AWS S3. The entire application is containerized with Docker and deployed to an AWS EC2 instance provisioned via Terraform, with automated CI/CD handled by Jenkins."

---

## ⏱️ 1-Minute Explanation (The Project Overview)

"FreshOps AI solves the problem of manual expiry tracking in kitchens and warehouses. It's built on a modern MERN-like stack where the frontend is React (via Vite) and the backend is Node.js with Express. 

When a user uploads an image, the React single-page app routes the request through an Nginx reverse proxy to the backend. The backend streams the image to an AWS S3 bucket and simultaneously pings the Clarifai AI vision model to classify the item—like detecting an 'Apple'. Our custom expiry engine maps 'Apple' to the 'Fruit' category, applies a static 7-day shelf-life rule, and saves the S3 URL and metadata into MongoDB Atlas.

Finally, the frontend provides a real-time dashboard showing which items are fresh, which are expiring soon, and which are expired, helping operators act before food goes to waste. The entire stack is orchestrated locally and in production using Docker Compose."

---

## ⏱️ 3-Minute Explanation (The Deep Architectural Dive)

"FreshOps AI is an end-to-end, production-ready perishable intelligence platform. I engineered it not just to work locally, but to demonstrate scalable cloud and DevOps practices. 

**Application Layer:**
The frontend is a React application built with Vite and served by Nginx. I configured Nginx as a reverse proxy matching the `/api/` path, which eliminates CORS issues and prevents us from hardcoding dynamic cloud IPs into the React build. The backend is a standard Express application that orchestrates three main external services: MongoDB Atlas for transactional data, AWS S3 for object storage, and the Clarifai API for computer vision.

**Data & Logic Flow:**
When an image is uploaded, it's processed via Multer. The backend uploads the raw buffer to S3, retrieves the public URL, and queries Clarifai for object detection. I built a deterministic expiry engine that takes the AI's best guess, generalizes it (e.g., 'Spinach' -> 'Vegetables'), and computes a dynamic expiration date based on business rules. This payload is stored in MongoDB, and the React dashboard immediately reflects the updated inventory health and waste percentages.

**DevOps & Infrastructure:**
I didn't want to deploy this manually. I wrote Terraform scripts to provision the AWS infrastructure: an S3 bucket with explicit public-read policies for the UI, an EC2 instance with a 20GB EBS volume for Docker cache overhead, and Security Groups mapping ports 80, 22, and 4000. 

For CI/CD, I authored a declarative Jenkins pipeline (`Jenkinsfile`). On every pipeline trigger, Jenkins checks out the code, builds the Docker images for the frontend and backend, and executes a custom `deploy.sh` script. This script securely SSHes into the EC2 instance, injects the dynamic build tags and `.env` secrets, and uses `docker compose up -d` to seamlessly rotate the containers with zero local dependencies. The entire system is modular, highly resilient, and treats infrastructure as code."

---

## 🎯 Likely Interview Questions & Strong Answers

### 1. Why did you use an Nginx reverse proxy instead of having React call the Node backend directly?
**Answer:** Security and deployment flexibility. If React calls the backend directly, the browser enforces CORS (Cross-Origin Resource Sharing), requiring the backend to explicitly allow the frontend's origin. Additionally, when deploying to AWS, I would have had to inject the EC2's dynamic Public IP into the React build process. By using Nginx to serve the static frontend and proxy `/api/` traffic to the backend over Docker's internal network, both services share the same origin (Port 80). This eliminates CORS entirely and makes the container environment-agnostic.

### 2. Why store images in AWS S3 instead of MongoDB?
**Answer:** MongoDB has a strictly enforced 16MB document size limit (BSON limit) and is highly inefficient for storing and serving raw binary blobs. Storing base64 encoded images in the database inflates the database size, slows down queries, and makes backups heavy. AWS S3 is purpose-built for scalable object storage. By storing the image in S3 and only keeping the lightweight public S3 URL in MongoDB, the database remains fast, and S3 handles the heavy lifting of serving the media to the frontend.

### 3. Walk me through your Infrastructure as Code (IaC) setup. Why Terraform?
**Answer:** I used Terraform to mathematically declare the AWS environment to ensure deployment is repeatable and documented. The Terraform configuration provisions a `t3.micro` EC2 instance using the latest Ubuntu AMI, configures a 20GB gp3 volume to handle Docker image bloat, creates the S3 bucket with disabled block-public-access, and sets up a Security Group exposing ports 22, 80, and 4000. Using Terraform avoids 'click-ops' in the AWS console, prevents configuration drift, and allowed me to easily export the `ec2_public_ip` directly into my Jenkins deployment scripts.

### 4. How does your CI/CD pipeline handle deployments?
**Answer:** The pipeline is orchestrated via a `Jenkinsfile` with distinct stages: Checkout, Build, and Deploy. After building the Docker images, Jenkins executes a custom bash script (`deploy.sh`). This script uses SSH to transfer the `docker-compose.yml` to the EC2 instance. It then exports the newly built image tags as environment variables and runs a remote `docker compose up -d` command. This pulls the latest structure and forcefully recreates the containers using the `.env` file residing natively on the server, ensuring secrets never leak into the repository.

### 5. What happens if the AI (Clarifai) returns an incorrect label or fails?
**Answer:** I designed the Expiry Engine with fault tolerance. The application maps specific AI labels (like 'Granny Smith') to broader category buckets ('Fruits') using a predefined dictionary. If Clarifai returns an unrecognized label, or if the API request times out, the backend gracefully catches the error and assigns a 'Unknown/Default' category with a conservative baseline expiry (e.g., 3 days). This ensures the application layer doesn't crash and the physical inventory isn't accidentally assumed to be fresh indefinitely.

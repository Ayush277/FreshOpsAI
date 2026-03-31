# FreshOps AI

## Project Summary

FreshOps AI is a smart perishable intelligence platform that helps businesses reduce food waste by detecting food items from images, estimating expiry dates, storing inventory data, and generating operational alerts and insights.

The platform is designed as a cloud-native MVP inspired by systems used in companies such as Amazon Fresh, Swiggy, and Walmart. It combines a React frontend, a Node.js backend, image recognition through Clarifai, MongoDB Atlas for storage, Docker for containerization, Terraform for infrastructure provisioning, Jenkins for CI/CD, and AWS for deployment.

## Core Problem

Food businesses lose money because perishable inventory is hard to track in real time. Items expire quickly, inventory checks are often manual, and teams lack a simple system that converts raw inventory data into decisions.

FreshOps AI addresses this by turning food images into structured inventory records and then using simple expiry intelligence to drive alerts, dashboards, and action suggestions.

## End-to-End Flow

The complete system flow is:

1. A user uploads a food image.
2. The AI layer detects the food item.
3. The expiry engine assigns an estimated expiry date.
4. The backend stores the item, expiry, and timestamp in MongoDB Atlas.
5. The dashboard shows inventory insights and expiring items.
6. The system generates alerts for items nearing expiry.
7. Jenkins automates build and deployment on code changes.
8. Terraform provisions and manages AWS infrastructure.
9. The application runs on AWS using containerized services.

## High-Level Architecture

FreshOps AI has five main layers:

### 1. Frontend

Built with React.

Responsibilities:

- Upload food images
- Display detected items
- Show expiry dates and alerts
- Render the admin dashboard

### 2. Backend

Built with Node.js and Express.

Responsibilities:

- Accept image uploads
- Call the AI detection service
- Apply expiry logic
- Expose REST APIs
- Read and write inventory data
- Generate alert data for the UI

### 3. AI Layer

Built using Clarifai APIs rather than a custom-trained model.

Responsibilities:

- Analyze uploaded food images
- Return the detected food category or item label

This keeps the MVP practical and delivery-focused.

### 4. Expiry Engine

A rule-based prediction layer used in the MVP.

Example logic:

- Milk -> 3 days
- Bread -> 5 days
- Fruits -> 7 days

This is intentionally simple but demonstrates the intelligence layer clearly.

### 5. Cloud and DevOps Layer

Built with Docker, AWS, Jenkins, and Terraform.

Responsibilities:

- Containerize frontend and backend
- Provision infrastructure
- Deploy to AWS
- Automate builds and releases
- Centralize logs and storage

## Suggested Project Structure

```text
freshops-ai/
├── frontend/        # React app
├── backend/         # Node.js / Express API
├── docker/          # Dockerfiles and compose config
├── terraform/       # AWS infrastructure as code
├── jenkins/         # Jenkins pipeline config
└── README.md
```

## Component Breakdown

## Frontend

The frontend is the user-facing layer.

Main features:

- Upload a fridge or inventory image
- Show detected food items
- Display estimated expiry
- Show alerts for items expiring soon
- Present a business dashboard with waste-focused metrics

## Backend

The backend is the central application layer.

Proposed APIs:

- `POST /upload` -> upload image and process detection
- `GET /items` -> fetch stored inventory items
- `GET /alerts` -> fetch expiry alerts
- `GET /health` -> health check endpoint

Suggested backend responsibilities:

- Validate uploads
- Store metadata
- Call Clarifai
- Apply expiry rules
- Save results in MongoDB
- Return dashboard-ready responses

## Database

MongoDB Atlas stores the core item records.

Suggested schema fields:

- `itemName`
- `category`
- `imageUrl`
- `detectedAt`
- `expiryDate`
- `daysRemaining`
- `status`
- `createdAt`
- `updatedAt`

## AWS Services

Planned AWS usage:

- `EC2` for app hosting
- `S3` for image storage
- `CloudWatch` for logs and monitoring

Optional future additions:

- `ECR` for Docker image storage
- `ALB` for production-grade routing
- `Route 53` for domain management

## Docker

Docker is used to containerize:

- Frontend
- Backend

Benefits:

- Consistent local and cloud environments
- Easier deployment
- Cleaner CI/CD pipeline integration

## Jenkins

Jenkins handles CI/CD automation.

Expected pipeline flow:

1. Developer pushes code to GitHub.
2. Jenkins pulls the latest code.
3. Jenkins builds Docker images.
4. Jenkins optionally runs tests.
5. Jenkins deploys the application.
6. FreshOps AI goes live on AWS.

## Terraform

Terraform provisions infrastructure as code.

Expected resources:

- EC2 instance
- Security groups
- S3 bucket

Key benefit:

Infrastructure becomes repeatable, version-controlled, and automated.

## One-Click Deployment Story

One of the strongest parts of this project is the deployment narrative:

Push code -> Jenkins pipeline starts -> Terraform provisions or updates AWS infrastructure -> Docker images build and deploy -> application becomes available.

This gives the project real DevOps depth beyond a typical CRUD app.

## Features to Demonstrate

### User Features

- Upload fridge or inventory image
- Detect food items
- View predicted expiry
- Receive alerts

### Business Features

- Dashboard of items expiring soon
- Basic waste percentage view
- Action suggestions such as use now or donate

### Optional Feature

- Recipe recommendations using Spoonacular API

## Real vs Simulated Scope

This is the correct MVP framing:

- Image detection: real
- Expiry prediction: rule-based
- Custom AI model training: skipped
- Donation system: demo or placeholder
- Business analytics: basic but real

This is acceptable because the value of the project is not only in advanced ML. It is in end-to-end system design, automation, and execution.

## Why This Project Is Strong

FreshOps AI is a strong portfolio project because it demonstrates:

- A real-world business problem
- Full-stack development
- API integration
- Cloud deployment
- CI/CD automation
- Infrastructure as code
- Product thinking

It shows the ability to build not just a feature, but a complete deployable system.

## Interview Explanation

Use this answer in interviews:

> FreshOps AI is a cloud-native platform designed to optimize perishable inventory. It uses image recognition APIs to detect food items, applies expiry prediction logic, stores structured inventory data, and provides actionable insights through dashboards and alerts. I automated deployment using Jenkins and Terraform on AWS, which enabled one-click infrastructure provisioning and deployment.

## Resume Value

This project can support resume bullets such as:

- Built a cloud-native perishable inventory intelligence platform using React, Node.js, MongoDB Atlas, and AWS.
- Integrated image recognition APIs to detect food items and implemented rule-based expiry prediction logic for inventory alerts.
- Automated infrastructure provisioning with Terraform and deployment pipelines with Jenkins and Docker.
- Designed a full-stack dashboard system for food waste visibility, expiring item alerts, and operational decision support.

## Execution Strategy

Build the project in this order:

1. Backend API
2. Frontend UI
3. Clarifai integration
4. Expiry engine
5. Docker setup
6. AWS deployment
7. Jenkins pipeline
8. Terraform automation

This order reduces complexity and keeps the project shippable at every stage.

## Final Outcome

By the end of the project, the deliverable should include:

- A working web application
- Image-based food item detection
- Rule-based expiry prediction
- Dashboard and alerts
- Dockerized services
- AWS deployment
- Jenkins CI/CD pipeline
- Terraform-managed infrastructure

FreshOps AI is not just a demo application. It is a full-stack, cloud-enabled, automation-first project with a strong interview story and clear business relevance.

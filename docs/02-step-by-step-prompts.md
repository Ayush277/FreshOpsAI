# FreshOps AI Build Prompts

## How To Use This Document

Use these prompts one by one with an AI coding assistant. Do not paste everything at once. Run each prompt, verify the result, then move to the next prompt.

The prompts are intentionally small so the project can be built in controlled phases from start to finish.

## Phase 0: Project Setup

### Prompt 1: Initialize the repository structure

```text
Create the initial project structure for FreshOps AI with these folders:
frontend, backend, docker, terraform, jenkins, and docs.
Add a root README.md with a short project summary and stack overview.
Keep the structure clean and production-oriented.
```

### Prompt 2: Define the architecture in the README

```text
Update the README.md to explain FreshOps AI as a smart perishable intelligence platform.
Include:
- problem statement
- end-to-end flow
- architecture overview
- tech stack
- project structure
- planned features
- deployment story
Write it professionally so it is suitable for GitHub and interviews.
```

## Phase 1: Backend First

### Prompt 3: Set up the backend application

```text
Inside the backend folder, initialize a Node.js + Express application for FreshOps AI.
Add a clean folder structure with routes, controllers, services, models, config, and middleware.
Set up a basic server with environment variables, JSON parsing, CORS, and a health check endpoint.
```

### Prompt 4: Add the initial backend routes

```text
Implement these REST API endpoints in the backend:
- POST /upload
- GET /items
- GET /alerts
- GET /health
Use clean controller and service separation.
For now, stub the logic with realistic mock responses so the API is testable before integrations.
```

### Prompt 5: Add MongoDB Atlas integration

```text
Integrate MongoDB Atlas into the backend using Mongoose.
Create an inventory item model with fields for itemName, category, imageUrl, detectedAt, expiryDate, daysRemaining, and status.
Connect the database using environment variables and make sure the app fails clearly if variables are missing.
```

### Prompt 6: Save uploaded item records

```text
Update the POST /upload flow so it accepts item metadata and stores a new inventory record in MongoDB.
If image AI detection is not integrated yet, allow a temporary manual itemName input for testing.
Return a proper JSON response with the saved document.
```

### Prompt 7: Build expiry alert logic

```text
Implement GET /alerts so it returns items that are expired or expiring soon.
Define simple status buckets such as fresh, expiring-soon, and expired.
Make the response frontend-friendly and include daysRemaining.
```

### Prompt 8: Add validation and error handling

```text
Improve the backend with request validation, centralized error handling, and consistent API response formats.
Make sure upload requests fail safely when required fields are missing or invalid.
```

## Phase 2: AI Integration

### Prompt 9: Add image upload handling

```text
Integrate image upload support into the backend using Multer.
Store uploaded files locally for now or in a temporary uploads folder.
Update POST /upload so it can accept an image file and return metadata about the uploaded file.
```

### Prompt 10: Integrate Clarifai food detection

```text
Integrate Clarifai into the backend upload flow.
When a user uploads a food image, call Clarifai and extract the most relevant detected food label.
Wrap Clarifai logic in a dedicated service module and use environment variables for credentials.
Handle failed AI responses gracefully.
```

### Prompt 11: Connect AI detection to DB storage

```text
Update the POST /upload endpoint so the system flow becomes:
receive image -> upload/process image -> detect food item using Clarifai -> assign expiry using internal rules -> save the item in MongoDB -> return the saved record.
Keep the code modular and easy to extend later.
```

## Phase 3: Expiry Engine

### Prompt 12: Build the rule-based expiry engine

```text
Create a reusable expiry engine module in the backend.
Use simple rules such as:
- milk = 3 days
- bread = 5 days
- fruits = 7 days
- vegetables = 6 days
- yogurt = 7 days
Add a sensible default for unknown items.
Return expiryDate, daysRemaining, and status.
```

### Prompt 13: Improve category mapping

```text
Enhance the expiry engine so detected labels from Clarifai can map to broader categories.
For example, apple and banana should map to fruits, and spinach should map to vegetables.
Design this mapping so it is easy to update later.
```

### Prompt 14: Add business analytics endpoint

```text
Add a new backend endpoint GET /dashboard/summary that returns:
- total items
- fresh items
- expiring soon items
- expired items
- waste percentage
Use MongoDB data and keep the response ready for a dashboard UI.
```

## Phase 4: Frontend

### Prompt 15: Set up the React frontend

```text
Inside the frontend folder, create a React application for FreshOps AI.
Set up a clean project structure with pages, components, services, hooks, and styles.
Create a modern layout with a dashboard page and an upload page.
Do not use generic placeholder styling.
```

### Prompt 16: Build the upload UI

```text
Create the main upload page for FreshOps AI.
The page should let users select an image, upload it to the backend, and display:
- detected item
- predicted expiry date
- status
- days remaining
Add loading, success, and error states.
```

### Prompt 17: Build the inventory list view

```text
Add a page or section that fetches GET /items and displays inventory cards or a table.
Show item name, category, expiry date, status, and created time.
Use a clean admin-style design suitable for a business dashboard.
```

### Prompt 18: Build the alerts dashboard

```text
Create an alerts view that consumes GET /alerts and highlights items that are expiring soon or expired.
Use strong visual distinction between statuses and keep the UX clear on both desktop and mobile.
```

### Prompt 19: Build the business summary dashboard

```text
Create a dashboard summary component that consumes GET /dashboard/summary.
Display total items, fresh items, expiring soon items, expired items, and waste percentage.
Use an executive-style dashboard layout rather than a student project layout.
```

## Phase 5: Image Storage and Production Readiness

### Prompt 20: Integrate AWS S3 for image storage

```text
Replace temporary local image storage with AWS S3.
Upload images from the backend to S3 and store the resulting S3 URL in MongoDB.
Keep S3 integration in a dedicated service file and use environment variables for AWS credentials.
```

### Prompt 21: Add backend logging and config cleanup

```text
Refactor backend configuration so all external services are managed through environment-based config modules.
Add structured logging and improve startup diagnostics for MongoDB, Clarifai, and AWS connections.
```

## Phase 6: Docker

### Prompt 22: Dockerize the backend

```text
Create a production-ready Dockerfile for the backend service.
Use a lightweight Node image, proper working directory setup, dependency install, and startup command.
Also add a .dockerignore file.
```

### Prompt 23: Dockerize the frontend

```text
Create a production-ready Dockerfile for the frontend.
Use a build stage if needed and make the final image efficient.
Also add a .dockerignore file for the frontend.
```

### Prompt 24: Add Docker Compose for local orchestration

```text
Create a docker-compose setup to run the frontend and backend together locally.
Use clear service names, environment variable handling, and exposed ports.
Document how to run the stack locally.
```

## Phase 7: AWS Deployment

### Prompt 25: Prepare the app for EC2 deployment

```text
Update the project so the Dockerized FreshOps AI app can run on an AWS EC2 instance.
Document required environment variables, exposed ports, and deployment assumptions.
Keep the setup straightforward for a single-instance MVP deployment.
```

### Prompt 26: Add CloudWatch-friendly logging notes

```text
Prepare the backend and deployment documentation so logs are easy to inspect through CloudWatch or standard container logs.
Keep the logging strategy simple and production-appropriate for an MVP.
```

## Phase 8: Jenkins CI/CD

### Prompt 27: Create the Jenkins pipeline

```text
Create a Jenkins pipeline for FreshOps AI.
The pipeline should:
- clone the repository
- build frontend and backend images
- optionally run tests
- deploy the application
Write the pipeline in a Jenkinsfile and keep it readable and production-minded.
```

### Prompt 28: Add deployment script support

```text
Create any deployment helper scripts needed by Jenkins to deploy the Dockerized application to AWS EC2.
Keep the scripts non-interactive and safe for CI/CD use.
```

## Phase 9: Terraform Infrastructure

### Prompt 29: Create Terraform base files

```text
Inside the terraform folder, create the initial Terraform setup for AWS.
Add provider config, variables, outputs, and a clean module-friendly structure even if everything is in one folder for now.
```

### Prompt 30: Provision AWS infrastructure

```text
Write Terraform code to provision the core AWS infrastructure for FreshOps AI:
- one EC2 instance
- one S3 bucket
- security groups for app access
Use variables for region, instance type, key settings, and bucket naming.
Keep the infrastructure minimal but realistic for an MVP.
```

### Prompt 31: Connect Terraform outputs to deployment needs

```text
Add Terraform outputs for the EC2 public IP, instance details, and S3 bucket name.
Make the outputs easy to use in deployment documentation and Jenkins automation.
```

## Phase 10: Final Integration

### Prompt 32: Perform an end-to-end integration pass

```text
Review the entire FreshOps AI project and make all parts work together end to end.
Verify:
- frontend calls the correct backend endpoints
- backend stores data correctly
- Clarifai detection flows into expiry logic
- MongoDB records are correct
- S3 URLs are stored
- Docker setup works
- Jenkins pipeline is aligned with the repo structure
- Terraform matches deployment assumptions
Fix inconsistencies and document the final flow.
```

### Prompt 33: Add final documentation

```text
Create or improve project documentation so the repository includes:
- setup instructions
- local development steps
- environment variables
- Docker usage
- AWS deployment steps
- Jenkins pipeline overview
- Terraform usage
- architecture explanation
Write the documentation clearly for recruiters, interviewers, and developers.
```

### Prompt 34: Prepare interview-ready explanations

```text
Create a document with:
- a 30-second project explanation
- a 1-minute explanation
- a 3-minute deep explanation
- likely interview questions with strong answers
Make the content specific to FreshOps AI and aligned with the implemented architecture.
```

## Recommended Execution Order

Follow this exact order:

1. Project structure
2. Backend APIs
3. MongoDB integration
4. Upload flow
5. Clarifai integration
6. Expiry engine
7. Dashboard summary API
8. Frontend pages
9. S3 integration
10. Docker
11. AWS deployment
12. Jenkins
13. Terraform
14. End-to-end cleanup
15. Final documentation

## Final Master Prompt

Use this only after the individual phases are mostly complete:

```text
Act as a senior full-stack and DevOps engineer. Review my FreshOps AI project end to end and bring it to a polished MVP state. The system should support food image upload, Clarifai-based item detection, rule-based expiry prediction, MongoDB storage, alert generation, dashboard analytics, Docker-based packaging, AWS deployment readiness, Jenkins CI/CD, and Terraform-based infrastructure. Fix architectural inconsistencies, improve code quality, tighten documentation, and make the project interview-ready.
```

## Execution Advice

- Do not jump to Jenkins or Terraform before the backend and frontend work locally.
- Keep the expiry engine simple for the MVP.
- Treat Clarifai as the AI layer, not custom model training.
- Use Docker only after the app works outside containers.
- Use Terraform for infrastructure, not application logic.
- Keep every phase demonstrable before moving to the next one.

This document is designed to help you build FreshOps AI in a controlled, interview-ready way from zero to deployment.

# GitHub Actions EC2 Deployment Setup

This guide documents the cloud-only deployment flow for FreshOps AI.

## What the pipeline does

When code is pushed to `main`, GitHub Actions:

1. Installs frontend and backend dependencies.
2. Builds the frontend to catch broken changes early.
3. Syncs the repository to the existing AWS EC2 server.
4. Writes runtime environment files on the EC2 host.
5. Runs `docker compose up -d --build --remove-orphans` on the server.
6. Verifies the app is reachable at `http://107.22.48.62:8080/`.

## Required GitHub secrets

Add these in **Settings → Secrets and variables → Actions**:

- `EC2_SSH_PRIVATE_KEY`
- `MONGO_URI`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `CLARIFAI_PAT`
- `CLARIFAI_USER_ID`
- `CLARIFAI_APP_ID`
- `CLARIFAI_MODEL_ID`

## EC2 assumptions

The workflow assumes:

- Host: `107.22.48.62`
- SSH user: `ec2-user`
- Deploy directory: `/home/ec2-user/freshops-ai`
- Docker is already installed on the EC2 instance

If your EC2 user is different, update `.github/workflows/deploy.yml`.

## How deployment works

### 1. Validate on GitHub Actions
The workflow runs `npm ci` for both app folders and builds the frontend.

### 2. Sync to AWS
The repository contents are copied to the EC2 instance over SSH.

### 3. Create env files on the server
The workflow writes the runtime configuration to both:

- `/home/ec2-user/freshops-ai/.env`
- `/home/ec2-user/freshops-ai/backend/.env`

### 4. Restart the stack
The server runs:

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build --remove-orphans
```

## How to show CI/CD in a demo

1. Make a small code change.
2. Push it to `main`.
3. Open the GitHub Actions run and show the deploy job.
4. Refresh `http://107.22.48.62:8080/` and show the update live.

## Troubleshooting

- **SSH fails**: confirm the private key secret matches the EC2 key pair.
- **Docker fails**: confirm Docker and Docker Compose are installed on the EC2 host.
- **App does not update**: confirm the deploy job completed successfully and check container logs on the server.

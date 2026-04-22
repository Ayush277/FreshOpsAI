# Local Docker Orchestration

This folder contains additional setups and documents for dockerizing the stack, while the main orchestration uses the `docker-compose.yml` file located in the root of the repository.

## Running FreshOps AI Locally with Docker Compose

1. **Verify Credentials**:
   Ensure your backend environment variables are correctly populated in `backend/.env`. Specifically, verify your `MONGODB_URI`, Clarifai variables, and AWS variables so the backend gracefully passes its startup diagnostics.

2. **Build and Run**:
   From the root of the repository, execute:
   ```bash
   docker compose up --build -d
   ```
   *The `-d` flag runs the containers in detached (background) mode.*

3. **Verify the Services**:
   - **Frontend**: Navigate to [http://localhost:8080](http://localhost:8080)
   - **Backend API**: Navigate to [http://localhost:4000/health](http://localhost:4000/health)
   
   To check backend logs continuously in real-time, run:
   ```bash
   docker compose logs -f backend
   ```

4. **Shutting Down**:
   To safely stop and remove the containers, use:
   ```bash
   docker compose down
   ```

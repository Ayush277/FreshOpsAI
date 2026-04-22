# ==========================================
# Stage 1: Build the React application
# ==========================================
FROM node:22-alpine AS builder

WORKDIR /usr/src/app

# Copy package manifests to leverage Docker layer caching
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application code
COPY . .

# Build the application for production (Vite outputs to 'dist')
RUN npm run build

# ==========================================
# Stage 2: Serve the application with Nginx
# ==========================================
FROM nginx:alpine

# Remove default Nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy built assets from the builder stage
COPY --from=builder /usr/src/app/dist /usr/share/nginx/html

# Handle React Router fallback (SPA subpaths)
RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]

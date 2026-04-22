# Use a lightweight official Node.js image
FROM node:22-alpine

# Set working directory inside the container
WORKDIR /usr/src/app

# Copy package manifests first to leverage Docker layer caching
COPY package*.json ./

# Install production dependencies only using a clean install
RUN npm ci --omit=dev

# Copy the rest of the application source code
COPY . .

# Run as a non-root user for better security
USER node

# Expose the standard backend port
EXPOSE 4000

# Start the application
CMD ["npm", "start"]

# ==============================================================================
# Stage 1: Build the React application
# ==============================================================================
# Use an official Node.js runtime as a parent image
FROM node:18-alpine AS builder

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json from the 'frontend' subdirectory
# This leverages Docker's layer caching.
COPY frontend/package.json frontend/package-lock.json ./

# Install dependencies from package.json
RUN npm install

# --- FIX: Install the missing dependencies ---
# Install react-router-dom and axios because they are missing from package.json
RUN npm install react-router-dom axios

# Copy the rest of the frontend application source code
COPY frontend/ ./

# Build the application for production
RUN npm run build

# ==============================================================================
# Stage 2: Serve the application using Nginx
# ==============================================================================
# Use a lightweight Nginx image to serve the static files
FROM nginx:stable-alpine

# Copy the build output from the builder stage to Nginx's web root directory
COPY --from=builder /app/build /usr/share/nginx/html

# Copy the custom Nginx configuration file
# This is crucial for single-page applications (SPAs) like React to handle routing correctly.
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 to the outside world
EXPOSE 80

# The default Nginx command will start the server when the container launches
CMD ["nginx", "-g", "daemon off;"]

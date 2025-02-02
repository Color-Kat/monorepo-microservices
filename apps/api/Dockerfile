FROM node:22.13.1-alpine

# Working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY ../../package*.json ./

# Install dependencies
RUN npm install

COPY ../../dist/apps/api .

# Start the application
CMD ["node", "main.js"]

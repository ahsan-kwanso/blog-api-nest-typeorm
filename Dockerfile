# Base image
FROM node:20

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port on which the app will run (ensure this matches the port you bind when running the container)
EXPOSE 3000

# Command to run the app in development mode
CMD [ "npm", "run", "dev" ]

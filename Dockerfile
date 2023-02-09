#This Dockerfile is for deployment on Back4App

FROM node:lts-bullseye-slim

RUN npm install

# Set the working directory in the container
WORKDIR /app

# Copy the application files into the working directory
COPY . /app

CMD ["npm", "start"]
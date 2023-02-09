#This Dockerfile is for deployment on Back4App

FROM node:lts-bullseye-slim

# Set the working directory in the container
WORKDIR /app

# Copy the application files into the working directory
COPY ./ /app

RUN npm install

CMD ["npm", "start"]

ENV PORT 3000

EXPOSE 3000
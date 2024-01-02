# Base image
FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package.json yarn.lock ./

# Copy prisma schemas and files
COPY prisma ./prisma/

# Install app dependencies
RUN npm install

# Generate Prisma client
RUN npx prisma generate


# Bundle app source
COPY . .

# Creates a "dist" folder with the production build
RUN npm run build

# Expose port 3000 for the application
EXPOSE 3000

# Start the server using the production build
CMD [ "node", "dist/src/main.js" ]






FROM node:20

WORKDIR /usr/src/app

COPY package*.json ./
RUN ls -R
RUN npm install

# Ensure all files, including `ace.js`, are copied
COPY . . 

# Start the server
CMD ["npm", "run", "dev"]
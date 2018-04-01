FROM node:argon
WORKDIR /app
COPY package.json /app
RUN npm install
COPY . /app

CMD ["./start_script.sh"]
#CMD node app.js
#EXPOSE 3002

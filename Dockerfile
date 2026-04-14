FROM node:22-alpine

# folder de trabajo dentro del contenedor
WORKDIR /app

# para instalar dependecias de forma REPRODUCIBLE
COPY package*.json ./
RUN npm ci --omit=dev

COPY src ./src

ENV NODE_ENV=production
ENV PORT=3000

# documenta el puerto interno
EXPOSE 3000

# comando que arraca la app
CMD ["npm", "start"]

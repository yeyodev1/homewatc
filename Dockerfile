FROM node:18
# Establecer el directorio de trabajo
WORKDIR /usr/src/app
# Descargar pnpm
RUN npm install -g pnpm
# Copiar el archivo de dependencias
COPY package.json ./
# Instalar dependencias con pnpm
RUN pnpm install
# Copiar el resto del código fuente
COPY . .
# Construir la aplicación
RUN pnpm run build
# Exponer el puerto que utilizará la aplicación
EXPOSE 8000
# Comando para iniciar la aplicación
CMD [ "node", "dist/index.js" ]

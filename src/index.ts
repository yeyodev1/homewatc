import { Application } from 'express'
import express from 'express'
import * as dotenv from 'dotenv'
import cors from 'cors'

import dbConnect from './config/mongo'
import initPinecone from './config/pinecone' // Importar la función de conexión de Pinecone
import routerApi from './routes'

async function main() {
  dotenv.config() // Cargar las variables de entorno

  await dbConnect() // Conectar a MongoDB
  await initPinecone() // Conectar a Pinecone

  const whiteList: string[] = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://localhost:3010'
    // TODO: add app sandbox domain
  ]

  const app: Application = express()

  app.use(cors({ origin: whiteList }))

  app.use(express.json())

  const port: number | string = process.env.PORT || 3000 // Valor de puerto por defecto

  routerApi(app)

  app.get('/', (_req, res) => {
    res.send('homewatch backapp is aliveeee! (╯°□°）╯')
  })

  app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`)
  })
}

main()

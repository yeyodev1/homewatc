import { Pinecone } from '@pinecone-database/pinecone'

// Función asíncrona para inicializar el cliente de Pinecone
async function initPinecone(): Promise<Pinecone> {
  try {
    // Verificar que la API key de Pinecone esté presente en las variables de entorno
    if (!process.env.PINECONE_API_KEY) {
      throw new Error('Faltan las variables de entorno de Pinecone o la API key')
    }

    // Crear una nueva instancia de Pinecone con la API key
    const pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!
    })

    // Retornar la instancia de Pinecone
    console.log('*** SUCCESSFULLY CONNECTED TO PINECONE ***')
    return pinecone
  } catch (error) {
    // Registrar el error y lanzar una excepción
    console.error('Error al inicializar el cliente de Pinecone', error)
    throw new Error('Error al inicializar el cliente de Pinecone')
  }
}

// Exportar la función de conexión
export default initPinecone

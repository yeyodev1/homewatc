import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

async function dbConnect(): Promise<void> {
  try {
    let DB_URI = process.env.MONGODB_URI

    if (!DB_URI) {
      throw new Error('No mongo DB_URI')
    }

    await mongoose.connect(DB_URI)
    console.log('*** SUCCESSFULLY CONNECTED ***')
  } catch (error) {
    console.log('*** CONECTION FAILED ***', error)
  }
}

export default dbConnect

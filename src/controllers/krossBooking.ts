import 'dotenv/config'
import type { Request, Response } from 'express'
import KrossBookingService from '../services/krossbooking.class'
import GoogleSheetService from '../services/spreadsheets.class'

export async function getReservations(_req: Request, res: Response): Promise<void> {
  try {
    if (
      !process.env.API_KEY ||
      !process.env.HOTEL_ID ||
      !process.env.USERNAME ||
      !process.env.PASSWORD
    ) {
      res.status(400).send('Faltan credenciales de KrossBooking')
      return
    }
    const krossbookingService = new KrossBookingService(
      process.env.API_KEY,
      process.env.HOTEL_ID,
      process.env.USERNAME,
      process.env.PASSWORD
    )

    const reservations = await krossbookingService.getReservations()
    // Aquí se puede continuar con la lógica para obtener los datos de KrossBooking
    // Por ejemplo: const data = await krossbookingService.getReservations(...);
    res.status(200).send({ reservations })
  } catch (error: unknown) {
    console.error('Error handling KrossBooking data:', error)
    res.status(500).send('Internal Server Error')
  }
}

export async function getProperties(_req: Request, res: Response): Promise<void> {
  try {
    if (
      !process.env.API_KEY ||
      !process.env.HOTEL_ID ||
      !process.env.USERNAME ||
      !process.env.PASSWORD
    ) {
      res.status(400).send('Faltan credenciales de KrossBooking')
      return
    }
    const krossbookingService = new KrossBookingService(
      process.env.API_KEY,
      process.env.HOTEL_ID,
      process.env.USERNAME,
      process.env.PASSWORD
    )

    // const properties = await krossbookingService.getProperties('')
    // Aquí se puede continuar con la lógica para obtener los datos de KrossBooking
    // Por ejemplo: const data = await krossbookingService.getReservations(...);

    const googleSheetService = new GoogleSheetService()

    const properties = await googleSheetService.getProperties()

    const availability = await googleSheetService.getPropertyAvailabilityById(43)
    console.log('availability: ', availability)

    res.status(200).send({ properties })
  } catch (error: unknown) {
    console.error('Error handling KrossBooking data:', error)
    res.status(500).send('Internal Server Error')
  }
}

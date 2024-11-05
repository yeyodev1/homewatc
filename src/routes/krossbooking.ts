import express from 'express'
import {
  // getGeneralInformation
  getProperties,
  getReservations
} from '../controllers/krossBooking'

const router = express.Router()

router.get('/booking-reservations', getReservations)

router.get('/booking-properties', getProperties)

// router.get('/homewatch-general-info', getGeneralInformation)

export default router

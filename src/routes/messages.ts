import express from 'express'
import { giveInformationAboutPlaces } from '../controllers/messages'

const router = express.Router()

router.post('/give-user-info-place', giveInformationAboutPlaces)

// router.get('/homewatch-general-info', getGeneralInformation)

export default router

import express from 'express'
import {
  getHubspotContacts,
  getHubspotInbox,
  saveIdealistaEmails,
  getInboxById,
  handleInboxWebhook
} from '../controllers/conversationsHubspot'

const router = express.Router()

router.get('/get-inboxes', getHubspotInbox)

router.get('/get-contacts', getHubspotContacts)

router.get('/get-inbox/:inboxId', getInboxById)

router.get('/get-inbox-idealista-email', saveIdealistaEmails)

router.post('/webhook/inbox', handleInboxWebhook)

export default router

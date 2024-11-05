import express, { Application } from 'express'

import Inbox from './inbox'
import krossbooking from './krossbooking'
import messages from './messages'

function routerApi(app: Application) {
  const router = express.Router()
  app.use('/api', router)
  // routes here
  router.use(Inbox)
  router.use(krossbooking)
  router.use(messages)
}

export default routerApi

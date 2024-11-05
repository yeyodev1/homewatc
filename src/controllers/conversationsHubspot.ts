import type { Request, Response } from 'express'
import { HubSpotService } from '../services/hubspot.class'
import AIClass from '../services/openai.class'
import { PROMPT_IDEALISTA } from '../prompts/getEmailIdealista'
import models from '../models'
import { IEmail } from '../interfaces/email.interface'

const hubspotService = new HubSpotService()

export async function getHubspotInbox(_req: Request, res: Response): Promise<void> {
  try {
    const inboxes = await hubspotService.getInboxes()

    res.status(200).send({ inboxes })
  } catch (error: unknown) {
    console.error('error: ', error)
    res.status(500).send({ error })
  }
}

export async function getHubspotContacts(_req: Request, res: Response): Promise<void> {
  try {
    const contacts = await hubspotService.getContacts()

    res.status(200).send({ contacts })
  } catch (error) {
    console.error('error: ', error)
  }
}

export async function getInboxById(req: Request, res: Response): Promise<void> {
  try {
    const { inboxId } = req.params

    const inbox = await hubspotService.getInboxById(inboxId)

    res.status(200).send({ inbox })
  } catch (error) {
    console.error('error: ', error)
  }
}

export async function saveIdealistaEmails(_req: Request, res: Response): Promise<void> {
  try {
    const today = new Date()
    const startDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      0,
      0,
      0
    ).toISOString()
    const endDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      23,
      59,
      59
    ).toISOString()
    const inboxId = '641489971'

    const allThreads = await hubspotService.getThreadsByInboxId(inboxId, startDate, endDate)

    const formattedData = JSON.stringify(
      allThreads.map((email: IEmail) => ({
        threadId: email.threadId,
        senderEmail: email.senderEmail,
        subject: email.subject,
        content: email.content,
        timestamp: email.timestamp
      })),
      null,
      2
    )

    const ai = new AIClass(process.env.OPENAI_API_KEY!)
    const response = await ai.createChat([
      {
        role: 'system',
        content: PROMPT_IDEALISTA.replace('{{input_data}}', formattedData)
      }
    ])

    if (!response) {
      res.status(404).send({ message: 'ia cannot generate' })
      return
    }

    const structuredData = JSON.parse(response)

    for (const entry of structuredData) {
      const existingLead = await models.lead.findOne({
        phone: entry.celular,
        propertyId: entry.idProperty
      })

      if (!existingLead) {
        const lead = new models.lead({
          name: entry.nombre,
          phone: entry.celular,
          propertyOfInterest: entry['propiedad de interes'],
          propertyId: entry.idProperty,
          message: entry.mensaje,
          email: entry.email,
          source: 'idealista'
        })
        await lead.save()
      }
    }

    res.status(200).send({
      message: 'Emails recovered and saved to database'
    })
  } catch (error) {
    console.error('Error al obtener y registrar hilos de Idealista:', error)
    res.status(500).send({
      success: false,
      message: 'Error al obtener hilos de Idealista y registrar en Google Sheets.',
      error
    })
  }
}

export async function handleInboxWebhook(req: Request, res: Response): Promise<void> {
  try {
    // const { objectType, type, properties } = req.body

    console.log('Webhook received:', req.body)

    // if (objectType === 'COMMUNICATION' && type === 'CREATED') {
    //   if (properties?.source === 'Idealista') {
    //     console.log('Información del último thread desde Idealista:', properties)
    //   }
    // }

    res.status(200).send('Webhook received')
  } catch (error) {
    console.error('Error handling webhook:', error)
    res.status(500).send('Internal Server Error')
  }
}

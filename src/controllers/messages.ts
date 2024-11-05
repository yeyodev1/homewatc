import type { Request, Response } from 'express'
import models from '../models'
import BuilderbotService from '../services/builderbot.class'
import ResendEmail from '../services/resend.class'
import { PropertyScraperService } from '../services/scrappping.class'
import { formatResult } from '../utils/formatPlaceInformation'
import AIClass from '../services/openai.class'
import { PROMPT_PROPERTIES } from '../prompts/getPropertyInformation'
import { PROMPT_FECHA } from '../prompts/getDateInformation'

export async function sendMessagesIdealista(_req: Request, res: Response): Promise<void> {
  try {
    const builderbotService = new BuilderbotService(process.env.BUILDERBOT_KEY!)
    const resendService = new ResendEmail()
    const leads = await models.lead.find({ contacted: false })

    if (leads.length === 0) {
      res.status(200).send({
        success: true,
        message: 'There are no uncontacted leads.'
      })
      return
    }

    for (const lead of leads) {
      await builderbotService.sendLeadMessage(lead)
      await resendService.sendLeadEmail(lead.email, lead, 'Alquiler | Renta')
      lead.contacted = true
      await lead.save()
    }

    res.status(200).send({
      success: true,
      message: 'Messages sent to uncontacted leads.'
    })
  } catch (error: unknown) {
    console.error('Error sending automatic messages:', error)
    res.status(500).send({
      success: false,
      message: 'Error sending automatic messages.',
      error
    })
  }
}

export async function giveInformationAboutPlaces(req: Request, res: Response): Promise<void> {
  try {
    const { userQuestion } = req.body

    const ai = new AIClass(process.env.OPENAI_API_KEY!)

    const datePromptResponse = await ai.createChat([
      {
        role: 'system',
        content: PROMPT_FECHA.replace('{{user_input}}', userQuestion)
      }
    ])

    const { iaStartDate, iaEndDate } = JSON.parse(datePromptResponse!)

    const scraperService = new PropertyScraperService()

    const startDate = new Date(iaStartDate)
    const endDate = new Date(iaEndDate)

    // const startDate2 = new Date('2024-11-07')
    // const endDate2 = new Date('2024-11-22')

    const result = await scraperService.getProperties(startDate, endDate)

    const properties_availables = formatResult(result)

    const aiResponse = await ai.createChat([
      {
        role: 'system',
        content: PROMPT_PROPERTIES.replace(
          '{{properties_availables}}',
          properties_availables
        ).replace('{{userQuery}}', userQuestion)
      }
    ])

    const botResponse = {
      messages: [
        {
          type: 'to_user',
          content: aiResponse
        }
      ]
    }

    res.status(200).send(botResponse)
  } catch (error: unknown) {
    console.error('Error giving information data:', error)
    res.status(500).send({
      success: false,
      message: 'Error giving information data.',
      error
    })
  }
}

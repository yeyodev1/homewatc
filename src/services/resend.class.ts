import 'dotenv/config'

import { Resend } from 'resend'
import CustomError from '../errros/customError'
import { generateLeadEmail } from '../templates/generateLeadEmail'

class ResendEmail {
  private resend: Resend

  constructor() {
    const RESEND_KEY = process.env.RESEND_KEY
    if (!RESEND_KEY) {
      throw new Error('Resend API key is missing')
    }
    this.resend = new Resend(RESEND_KEY)
  }

  public async sendLeadEmail(email: string, lead: any, subject: string): Promise<void> {
    try {
      const content = generateLeadEmail(lead)

      const { data, error } = await this.resend.emails.send({
        to: email,
        from: 'dreyes@bakano.ec',
        html: content,
        subject: subject
      })

      if (error) {
        console.error('error: ', error)
        throw new CustomError('Problem sending email from resend', 400, error)
      }
    } catch (error) {
      console.error('Resend email', error)
      throw new Error(`Problem sending magic link: ${error}`)
    }
  }
}

export default ResendEmail

import 'dotenv/config'
import axios from 'axios'

export default class BuilderbotService {
  private baseUrl: string
  private headers: object

  constructor(apiKey: string) {
    this.baseUrl = 'https://www.builderbot.cloud'
    this.headers = {
      'Content-Type': 'application/json',
      'x-api-builderbot': apiKey || process.env.BUILDERBOT_KEY
    }
  }

  async sendMessage(messageContent: string, phoneNumber: string, projectId: string): Promise<void> {
    const url = `${this.baseUrl}/api/v2/${projectId}/messages`
    const data = {
      messages: {
        content: messageContent
      },
      number: String(phoneNumber)
    }

    try {
      const response = await axios.post(url, data, { headers: this.headers })
      return response.data
    } catch (error) {
      console.error('Error al enviar el mensaje:', error)
      throw error
    }
  }

  async sendLeadMessage(lead: {
    name: string
    propertyOfInterest: string
    phone: string
  }): Promise<void> {
    const messageContent = `Hola ${lead.name}, pertenezco al equipo de homewatch y vi tu interes en idealista. Vi tu interés en ${lead.propertyOfInterest}
    ¿Quieres hablar al respecto?`
    const messageContent2 = 'Cuéntame qué necesitas'

    await this.sendMessage(messageContent, lead.phone, 'hR5OnEd8KxQrAgw5iPYtc')
    await this.sendMessage(messageContent2, lead.phone, 'hR5OnEd8KxQrAgw5iPYtc')
  }
}

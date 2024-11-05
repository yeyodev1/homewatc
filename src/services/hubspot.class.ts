import axios from 'axios'

export class HubSpotService {
  private hubspotClient: any
  private refreshToken: string
  private clientId: string
  private clientSecret: string
  private redirectUri: string = ''
  private accessToken: string

  constructor() {
    this.hubspotClient = axios.create({
      baseURL: 'https://api.hubapi.com',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    this.refreshToken = 'eu1-255e-5941-4b53-8931-bf6ab3cdbf03'
    this.clientId = '8e462679-f0e7-4f01-ba2f-be677f7e8303'
    this.clientSecret = '8daa7d1c-6fb8-4c86-903e-976258bbb2c5'
    this.accessToken = ''
  }

  async refreshAccessToken(): Promise<void> {
    try {
      const response = await axios.post(
        'https://api.hubapi.com/oauth/v1/token',
        new URLSearchParams({
          grant_type: 'refresh_token',
          client_id: this.clientId,
          client_secret: this.clientSecret,
          refresh_token: this.refreshToken
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      )

      const { access_token, refresh_token, expires_in } = response.data

      this.accessToken = access_token
      this.refreshToken = refresh_token

      console.log('Token updated successfully, it expires in ', expires_in)

      setTimeout(() => this.refreshAccessToken(), (expires_in - 60) * 1000)
    } catch (error) {
      console.error('Error updating access token', error)
    }
  }

  private async ensureAccessToken(): Promise<void> {
    if (!this.accessToken) {
      await this.refreshAccessToken()
    }
  }

  private async getThreadsByPage(
    inboxId: string,
    startDate: string,
    endDate: string,
    after?: string
  ): Promise<any> {
    const url = `/conversations/v3/conversations/threads?inboxId=${inboxId}&limit=100&sort=latestMessageTimestamp&latestMessageTimestampAfter=${startDate}&latestMessageTimestampBefore=${endDate}${
      after ? `&after=${after}` : ''
    }`

    const response = await this.hubspotClient.get(url, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`
      }
    })

    return response.data
  }

  private toUTCFromSpain(dateStr: string): string {
    const date = new Date(dateStr)
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString()
  }

  async getThreadsByInboxId(
    inboxId: string,
    startDateSpain: string,
    endDateSpain: string
  ): Promise<any[]> {
    try {
      await this.ensureAccessToken()

      // Convertimos las fechas de España a UTC
      const startDate = this.toUTCFromSpain(startDateSpain)
      const endDate = this.toUTCFromSpain(endDateSpain)

      let idealistaMessages: any[] = []
      let after: string | undefined
      let attempts = 0
      const maxAttempts = 10

      do {
        try {
          const data = await this.getThreadsByPage(inboxId, startDate, endDate, after)

          // Obtener todas las promesas de mensajes de los hilos
          const messagePromises = data.results.map((thread: any) =>
            this.getThreadMessages(thread.id).then((messages: any[]) => {
              // Filtrar solo los mensajes de Idealista
              const filteredMessages = messages.filter((message: any) => {
                const content = message.text || message.html || ''
                const senderEmail = message.from?.email || ''
                return (
                  content.toLowerCase().includes('idealista') ||
                  senderEmail.toLowerCase().includes('idealista')
                )
              })

              // Mapear los mensajes filtrados al formato deseado
              return filteredMessages.map((message: any) => ({
                threadId: thread.id,
                senderEmail: message.from?.email || '',
                subject: message.subject || 'Sin asunto',
                content: message.text || message.html || '',
                timestamp: message.createdAt
              }))
            })
          )

          // Esperar a que todas las promesas se resuelvan
          const messagesArrays = await Promise.all(messagePromises)

          // Aplanar el array de arrays y agregar los mensajes a idealistaMessages
          idealistaMessages = idealistaMessages.concat(...messagesArrays)

          after = data.paging?.next?.after || undefined
        } catch (error) {
          console.error('Error trayendo hilo:', error)
        }

        attempts++
        if (attempts >= maxAttempts) {
          console.log('Límite de intentos alcanzado, deteniendo la búsqueda de hilos.')
          break
        }
      } while (after)

      return idealistaMessages
    } catch (error) {
      console.error('Error al recuperar los mensajes de Idealista:', error)
      return []
    }
  }

  async getContacts(): Promise<any> {
    try {
      if (!this.accessToken) {
        await this.refreshAccessToken()
      }

      const response = await this.hubspotClient.get('/crm/v3/objects/contacts', {
        headers: {
          Authorization: `Bearer ${this.accessToken}`
        }
      })

      console.log('Contacts retrieved successfully', response.data)
      return response.data
    } catch (error) {
      console.error('Error retrieving contacts ', error)
    }
  }

  async getInboxes(): Promise<any> {
    try {
      await this.ensureAccessToken()

      const response = await this.hubspotClient.get('/conversations/v3/conversations/inboxes', {
        headers: {
          Authorization: `Bearer ${this.accessToken}`
        }
      })

      return response.data
    } catch (error) {
      console.error('Error retrieving inboxes ', error)
    }
  }

  async getInboxById(inboxId: string): Promise<any> {
    try {
      await this.ensureAccessToken()

      const response = await this.hubspotClient.get(
        `/conversations/v3/conversations/inboxes/${inboxId}`,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`
          }
        }
      )

      console.log('inbox de id: ', response.data)
      return response.data
    } catch (error: unknown) {
      console.error('error: ', error)
    }
  }

  async getThreadMessages(threadId: string): Promise<any> {
    try {
      await this.ensureAccessToken()

      const response = await this.hubspotClient.get(
        `/conversations/v3/conversations/threads/${threadId}/messages`,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`
          }
        }
      )

      return response.data.results
    } catch (error) {
      console.error('Error al obtener los mensajes:', error)
    }
  }

  async getIdealistaMessages(inboxId: string, startDate: string, endDate: string): Promise<any[]> {
    await this.ensureAccessToken()

    // Convertir las fechas de España a UTC
    const startDateUTC = this.toUTCFromSpain(startDate)
    const endDateUTC = this.toUTCFromSpain(endDate)

    let idealistaMessages: any[] = []
    let after: string | undefined
    const limit = 100 // Número máximo de hilos por página
    const maxAttempts = 10
    let attempts = 0

    do {
      try {
        // Obtener hilos de la bandeja de entrada con paginación
        const response = await this.hubspotClient.get(`/conversations/v3/conversations/threads`, {
          params: {
            inboxId,
            limit,
            after,
            sort: 'latestMessageTimestamp',
            latestMessageTimestampAfter: startDateUTC,
            latestMessageTimestampBefore: endDateUTC
          },
          headers: {
            Authorization: `Bearer ${this.accessToken}`
          }
        })

        const { results, paging } = response.data

        // Filtrar y procesar los mensajes de Idealista
        for (const thread of results) {
          const messagesResponse = await this.hubspotClient.get(
            `/conversations/v3/conversations/threads/${thread.id}/messages`,
            {
              headers: {
                Authorization: `Bearer ${this.accessToken}`
              }
            }
          )

          const messages = messagesResponse.data.results

          const filteredMessages = messages.filter((message: any) => {
            const content = message.text || message.html || ''
            const senderEmail = message.from?.email || ''
            return (
              content.toLowerCase().includes('idealista') ||
              senderEmail.toLowerCase().includes('idealista')
            )
          })

          idealistaMessages.push(
            ...filteredMessages.map((message: any) => ({
              threadId: thread.id,
              senderEmail: message.from?.email || '',
              subject: message.subject || 'Sin asunto',
              content: message.text || message.html || '',
              timestamp: message.createdAt
            }))
          )
        }

        after = paging?.next?.after
      } catch (error) {
        console.error('Error al obtener mensajes de Idealista:', error)
        break
      }

      attempts++
      if (attempts >= maxAttempts) {
        console.log('Límite de intentos alcanzado, deteniendo la búsqueda de hilos.')
        break
      }
    } while (after)

    return idealistaMessages
  }
}

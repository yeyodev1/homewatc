import axios, { AxiosInstance } from 'axios'
import dayjs from 'dayjs'
import { Reservation } from '../interfaces/reservations.interfaces'

export default class KrossBookingService {
  private apiKey: string
  private hotelId: string
  private username: string
  private password: string
  private token: string | null = null
  private tokenExpireAt: Date | null = null
  private axiosInstance: AxiosInstance

  constructor(apiKey: string, hotelId: string, username: string, password: string) {
    this.apiKey = apiKey
    this.hotelId = hotelId
    this.username = username
    this.password = password

    this.axiosInstance = axios.create({
      baseURL: 'https://api.krossbooking.com/v5',
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }

  public async authenticate(): Promise<void> {
    try {
      const response = await this.axiosInstance.post('/auth/get-token', {
        api_key: this.apiKey,
        hotel_id: this.hotelId,
        username: this.username,
        password: this.password
      })

      if (response.data && response.data.auth_token) {
        this.token = response.data.auth_token
        const expirationDate = dayjs(response.data.auth_token_expire)
        this.tokenExpireAt = expirationDate.toDate()
      } else {
        throw new Error('Failed to authenticate, auth_token not found in response.')
      }
    } catch (error) {
      console.error('Error authenticating with KrossBooking:', error)
      console.error('Error details:', error) // Añadir esto para ver el error completo
      throw error
    }
  }

  private async ensureAuthenticated(): Promise<void> {
    const now = new Date()

    if (!this.token || (this.tokenExpireAt && now >= this.tokenExpireAt)) {
      console.log('Token expired or not found, authenticating...')
      await this.authenticate()
    }
  }

  private async getRequest(endpoint: string, params: any = {}): Promise<any> {
    await this.ensureAuthenticated()

    try {
      const response = await this.axiosInstance.get(endpoint, {
        params,
        headers: {
          Authorization: `Bearer ${this.token}`
        }
      })
      return response.data
    } catch (error) {
      console.error(`Error fetching data from ${endpoint}:`, error)
      throw error
    }
  }

  public async getReservations(): Promise<any> {
    try {
      const response = await this.getRequest('/reservations/get-list')

      const today = new Date()
      today.setHours(0, 0, 0, 0)

      if (!response || !response.data || !Array.isArray(response.data)) {
        throw new Error('La respuesta de la API no tiene el formato esperado.')
      }

      const filteredReservations = response.data.filter((reservation: Reservation) => {
        if (!reservation.departure) {
          return false
        }

        const departureDate = new Date(reservation.departure)
        if (isNaN(departureDate.getTime())) {
          return false
        }

        departureDate.setHours(0, 0, 0, 0)
        return departureDate >= today
      })

      response.data = filteredReservations
      return response
    } catch (error: any) {
      console.error('Error en getReservations:', error.message)
      throw new Error(`Error en getReservations: ${error.message}`)
    }
  }

  public async getReservationsWithRooms(): Promise<any> {
    try {
      const response = await this.getRequest('/reservations/get-list', {
        with_guests: true,
        with_rooms: true
      })

      if (!response || !response.data || !Array.isArray(response.data)) {
        throw new Error('La respuesta de la API no tiene el formato esperado.')
      }

      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const filteredReservations = response.data.filter((reservation: Reservation) => {
        if (!reservation.departure) {
          return false
        }

        const departureDate = new Date(reservation.departure)
        if (isNaN(departureDate.getTime())) {
          return false
        }

        departureDate.setHours(0, 0, 0, 0)
        return departureDate >= today
      })

      return { ...response, data: filteredReservations }
    } catch (error: any) {
      console.error('Error en getReservationsWithRooms: ', error)
      throw new Error(`Error en getReservationsWithRooms: ${error}`)
    }
  }

  public async getProperties(params: any = {}): Promise<any> {
    try {
      return this.getRequest('/properties/get-list', params)
    } catch (error: unknown) {
      console.error('error getting properties: ', error)
      throw Error(`Error getting properties: ${error}`)
    }
  }
}

// (async () => {
//   try {
//     const krossService = new KrossBookingService(
//       process.env.API_KEY!,
//       process.env.HOTEL_ID!,
//       process.env.USERNAME!,
//       process.env.PASSWORD!
//     )

//   } catch (error) {
//     console.error('Error fetching properties: ', error)
//   }
// })()

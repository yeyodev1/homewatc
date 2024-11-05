import { JWT } from 'google-auth-library'
import { GoogleSpreadsheet, GoogleSpreadsheetRow } from 'google-spreadsheet'

// interfaces/propertyAvailability.interface.ts

export interface PropertyAvailability {
  date: string
  price: number | null
}

export default class GoogleSheetService {
  private doc: GoogleSpreadsheet

  constructor() {
    const serviceAccountAuth = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    })

    this.doc = new GoogleSpreadsheet(process.env.SPREADSHEET_ID!, serviceAccountAuth)
  }

  async loadDoc() {
    await this.doc.loadInfo()
  }

  async getProperties(): Promise<any[]> {
    await this.loadDoc()

    const sheet = this.doc.sheetsByIndex[0]

    const rows = await sheet.getRows()

    const properties: any[] = rows.map((row) => {
      const prices: { [key: string]: number } = {}
      const monthColumns = ['Oct-24', 'Nov-24', 'dic-24', 'ene-25', 'Feb-25', 'Mar-25', 'abr-25']

      monthColumns.forEach((month: string) => {
        const priceStr: string | undefined = row.get(month)
        const price: number = priceStr ? parseFloat(priceStr.replace(',', '').trim()) : 0
        prices[month] = price
      })

      return {
        id: parseInt(row.get('ID')),
        propiedad: row.get('Propiedad'),
        disponibilidad: row.get('Disponibilidad 2024/2025'),
        confirmPropietar: row.get('confirm propietar'),
        elec: row.get('Elec'),
        limp: row.get('Limp'),
        prices: prices
      }
    })

    return properties
  }

  async getPropertyAvailabilityById(propertyId: number): Promise<PropertyAvailability[]> {
    await this.loadDoc()

    const sheet = this.doc.sheetsByIndex[0] // Asumiendo que las propiedades están en la primera hoja

    const rows = await sheet.getRows()

    for (const row of rows) {
      if (parseInt(row.get('ID')) === propertyId) {
        const monthColumns = ['Oct-24', 'Nov-24', 'dic-24', 'ene-25', 'Feb-25', 'Mar-25', 'abr-25']

        const availability: PropertyAvailability[] = []

        monthColumns.forEach((month) => {
          const priceStr = row.get(month)
          const price = priceStr ? parseFloat(priceStr.replace(',', '').trim()) : null

          availability.push({ date: month, price })
        })

        return availability
      }
    }

    throw new Error(`Propiedad con ID ${propertyId} no encontrada`)
  }

  async addContactEntry(
    name: string,
    phone: string,
    propertyInterest: string,
    message: string,
    idProperty: string
  ): Promise<void> {
    await this.loadDoc()
    const sheet = this.doc.sheetsByIndex[1] // Accede a la segunda hoja

    await sheet.addRow({
      nombre: name,
      celular: phone,
      'propiedad de interes': propertyInterest,
      mensaje: message,
      'id de propiedad': idProperty
    })
  }
}

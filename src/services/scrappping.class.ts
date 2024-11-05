import axios from 'axios'
import { JSDOM } from 'jsdom'
import * as fs from 'fs'
import { format } from 'date-fns'

interface PropertyDetails {
  title?: string
  url?: string
  area?: string
  nightly_price?: string
  monthly_price?: string
  rental_period?: string
  features?: string[]
  main_image?: string
  reference_id?: string
}

interface ScrapeResult {
  timestamp: string
  url: string
  total_properties: number
  properties: PropertyDetails[]
  status: 'success' | 'error'
  error_message?: string
}

export class PropertyScraperService {
  private headers: Record<string, string>

  constructor() {
    this.headers = {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
  }

  public async getProperties(startDate: Date, endDate: Date): Promise<ScrapeResult> {
    const properties: PropertyDetails[] = []
    let currentPage = 1
    let hasMorePages = true
    let url = this.buildUrlWithDates(startDate, endDate, currentPage)

    while (hasMorePages) {
      try {
        const response = await axios.get(url, { headers: this.headers })
        const pageProperties = await this.scrapeProperties(response.data)
        properties.push(...pageProperties)

        const dom = new JSDOM(response.data)
        const document = dom.window.document

        // Verificar si existe otra página
        const paginationItems = document.querySelectorAll('ul.pagination li.page-item')
        const lastPageNumber = Array.from(paginationItems)
          .map((item) => parseInt(item.textContent?.trim() || '0'))
          .filter((num) => !isNaN(num))
          .reduce((max, num) => Math.max(max, num), 0)

        currentPage += 1
        hasMorePages = currentPage <= lastPageNumber
        url = this.buildUrlWithDates(startDate, endDate, currentPage)
      } catch (error: any) {
        return {
          timestamp: format(new Date(), "yyyy-MM-dd'T'HH:mm:ssxxx"),
          url: url,
          status: 'error',
          error_message: error.message,
          total_properties: properties.length,
          properties: properties
        }
      }
    }

    return {
      timestamp: format(new Date(), "yyyy-MM-dd'T'HH:mm:ssxxx"),
      url: url,
      total_properties: properties.length,
      properties: properties,
      status: 'success'
    }
  }

  public async savePropertiesToJson(
    startDate: Date,
    endDate: Date,
    outputFile: string = 'properties.json'
  ): Promise<void> {
    const result = await this.getProperties(startDate, endDate)
    fs.writeFileSync(outputFile, JSON.stringify(result, null, 2), 'utf-8')

    console.log(`Data saved to ${outputFile}`)
    console.log(`Total properties found: ${result.total_properties}`)
    console.log(`Status: ${result.status}`)
  }

  private async scrapeProperties(htmlContent: string): Promise<PropertyDetails[]> {
    const dom = new JSDOM(htmlContent)
    const document = dom.window.document
    const propertyArticles = document.querySelectorAll('article.card')

    const properties: PropertyDetails[] = []
    for (const article of propertyArticles) {
      const propertyDetails = await this.parsePropertyDetails(article)
      properties.push(propertyDetails)
    }

    return properties
  }

  private async parsePropertyDetails(article: Element): Promise<PropertyDetails> {
    const propertyDetails: PropertyDetails = {}

    const titleElement = article.querySelector('h4.card-title a')
    if (titleElement) {
      propertyDetails.title = titleElement.textContent?.trim()
      propertyDetails.url = (titleElement as HTMLAnchorElement).href || ''
    }

    const areaElement = article.querySelector('.card-area')
    if (areaElement) {
      propertyDetails.area = areaElement.textContent?.trim()
    }

    const priceElement = article.querySelector('.card-price')
    if (priceElement) {
      const nightlyPrice = priceElement.querySelector('strong:first-child')
      if (nightlyPrice) {
        propertyDetails.nightly_price = nightlyPrice.textContent?.trim()
      }

      const monthlyPrice = priceElement.querySelector('strong:last-child')
      if (monthlyPrice) {
        const priceSpan = monthlyPrice.querySelector('span[data-original-price]')
        const periodSpan = monthlyPrice.querySelector('span[data-period]')
        if (priceSpan) {
          propertyDetails.monthly_price = priceSpan.textContent?.trim()
        }
        if (periodSpan) {
          propertyDetails.rental_period = periodSpan.textContent?.trim()
        }
      }
    }

    const features: string[] = []
    const featuresList = article.querySelectorAll('ul.card-features li')
    featuresList.forEach((feature) => {
      if (feature) {
        features.push(feature.textContent?.trim() || '')
      }
    })
    propertyDetails.features = features

    const carousel = article.querySelector('.prop-images-carousel')
    if (carousel) {
      propertyDetails.main_image = (carousel as HTMLElement).dataset.mainimage || ''
      propertyDetails.reference_id = (carousel as HTMLElement).dataset.sourceid || ''
    }

    return propertyDetails
  }

  private buildUrlWithDates(startDate: Date, endDate: Date, page: number): string {
    const formattedStartDate = format(startDate, 'dd-MM-yyyy')
    const formattedEndDate = format(endDate, 'dd-MM-yyyy')
    return `https://www.homewatch.es/inmsearch?l=en&o=dateCreated+DESC&f=rent-short&curr=EUR&c%5B%5D=&t%5B%5D=&dr=${formattedStartDate}+-+${formattedEndDate}&gu=&r=&ipage=${page}`
  }
}

// Ejemplo de uso:
// ;(async () => {
//   const scraperService = new PropertyScraperService()

//   const startDate = new Date('2024-11-07')
//   const endDate = new Date('2024-11-22')

//   // Obtener propiedades y mostrar el resultado en consola
//   const result = await scraperService.getProperties(startDate, endDate)
//   console.log(JSON.stringify(result, null, 2))

//   // Guardar propiedades en un archivo JSON
//   await scraperService.savePropertiesToJson(startDate, endDate, 'marbella_properties.json')
// })()

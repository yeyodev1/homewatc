export function formatResult(result: any) {
  let formattedString = `Timestamp: ${result.timestamp}\nURL: ${result.url}\nTotal Properties: ${result.total_properties}\n\nProperties:\n`

  result.properties.forEach((property: any, index: any) => {
    formattedString += `\nProperty ${index + 1}:\n`
    formattedString += `- Title: ${property.title}\n`
    formattedString += `- URL: ${property.url}\n`
    formattedString += `- Area: ${property.area}\n`
    formattedString += `- Nightly Price: ${property.nightly_price}\n`
    formattedString += property.monthly_price ? `- Monthly Price: ${property.monthly_price}\n` : ''
    formattedString += `- Rental Period: ${property.rental_period || 'N/A'}\n`
    formattedString += `- Main Image: ${property.main_image}\n`
    formattedString += `- Reference ID: ${property.reference_id}\n`
    formattedString += `- Features: ${property.features.join(', ')}\n`
  })

  return formattedString
}

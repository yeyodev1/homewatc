export const PROMPT_FECHA = `
Dado el texto de un cliente, interpreta la fecha de inicio y la fecha de finalización mencionadas en el mensaje. Si el cliente no especifica una fecha, usa la fecha de hoy como inicio y establece un rango de 15 días para la fecha de finalización por defecto.

Formato de respuesta:
{
  "iaStartDate": "Fecha de inicio interpretada (YYYY-MM-DD)",
  "iaEndDate": "Fecha de finalización interpretada (YYYY-MM-DD)",
}

Ejemplo:
Entrada del cliente: "Quisiera saber sobre propiedades disponibles a partir del 10 de noviembre hasta fin de mes."
Respuesta:
{
  "iaStartDate": "2024-11-10",
  "iaEndDate": "2024-11-30",
}

Consideraciones:
1. Si el cliente menciona solo una fecha, usa esa fecha como fecha de inicio y asume un rango de 15 días para la fecha de finalización.
2. Si el cliente no menciona ninguna fecha, usa la fecha de el dia siguiente a la fecha actual: ${new Date()} como fecha de inicio y establece la fecha de finalización a 15 días después.
3. Siempre utiliza el formato de fecha YYYY-MM-DD en el JSON de salida.
4. La respuesta debe ser en español, clara y detallada, explicando el rango interpretado.
5. No uses markdown ni ningún formato adicional en la respuesta JSON.

Fecha actual: ${new Date()}

Texto del cliente:
{{user_input}}
`

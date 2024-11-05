export const PROMPT_IDEALISTA = `
Para cada entrada en el array de mensajes de Idealista, procesa el texto para extraer el "nombre", "celular", "propiedad de interés" y "mensaje" y estructura la información en formato JSON. No uses markdown, y asegúrate de que cada campo se llene correctamente. Usa el siguiente formato para cada mensaje:

{
  "nombre": "Nombre del remitente junto a su apellido",
  "celular": "Número de teléfono del remitente",
  "propiedad de interes": "Propiedad de interés del remitente",
  "idProperty": "000",
  "mensaje": "mensaje resumido del cliente"
  "email": "coreo@hola.com"
}

Ejemplo:
[
  {
    "nombre": "albertin samdran",
    "celular": "00000000000000",
    "propiedad de interes": "Chalet adosado en calle Antequera, La Cala de Mijas, Mijas",
    "idProperty": "000",
    "mensaje": "mensaje resumido del cliente",
    "email": "correo@hola.com"
  }
]

consideraciones
1. ninguno puede repetirse, si tienen dos numeros sip, pero si es lo mismo no repetir.
2. los numeros no deben tener ni simbolos ni espacios
3. tampoco deben tener el signo "+"

Procesa el siguiente array:
{{input_data}}
`

export function generateLeadEmail(lead: { name: string; propertyOfInterest: string }): string {
  const whatsappLink = 'https://wa.link/untekw'

  return `
<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Interés en Propiedad</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        background-color: #ffffff; /* Fondo blanco */
        color: #333333; /* Texto oscuro */
        margin: 0;
        padding: 0;
      }
      .container {
        width: 100%;
        max-width: 600px;
        margin: 24px auto;
        padding: 20px;
        background-color: #f4f4f4; /* Fondo claro para el contenedor */
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        border-radius: 10px;
      }
      .header {
        text-align: center;
        padding: 20px;
      }
      .content {
        text-align: left;
        padding: 30px;
        background-color: #3d3e41; /* Fondo oscuro para el contenido */
        border-radius: 8px;
        color: #ffffff; /* Texto blanco */
      }
      .content h1 {
        font-size: 24px;
      }
      .content p {
        font-size: 16px;
        margin-bottom: 20px;
      }
      .button {
        display: inline-block;
        padding: 15px 30px;
        color: #ffffff; /* Texto blanco en el botón */
        background-color: #30add1; /* Color del botón */
        border-radius: 8px;
        font-size: 18px;
        font-weight: bold;
        text-decoration: none !important;
        transition: background-color 0.3s ease;
      }
      .button:hover {
        background-color: #ffa20c; /* Color del botón al pasar el mouse */
      }
      .footer {
        text-align: center;
        padding: 20px;
        color: #a9abb1; /* Color gris claro para el pie de página */
        font-size: 14px;
      }
      .mensajito {
        colot: #ffffff
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Hola ${lead.name},</h1>
      </div>
      <div class="content">
        <p>Pertenecemos al equipo de Homewatch y hemos notado tu interés en la propiedad: <strong>${lead.propertyOfInterest}</strong>.</p>
        <p class="mensajito">¿Te gustaría hablar al respecto?</p>
        <a href="${whatsappLink}" class="button">Continuar en WhatsApp</a>
      </div>
      <div class="footer">
        <p>Gracias por tu interés.</p>
        <p><strong>Con cariño, el equipo de Homewatch</strong></p>
      </div>
    </div>
  </body>
</html>`
}

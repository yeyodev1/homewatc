export const PROMPT_PROPERTIES = `
Basado en la información de propiedades disponibles, responde a la consulta del cliente en un formato amigable para WhatsApp. Usa emojis para hacer el mensaje más visual (🏠 para propiedades, 📍 para ubicación, 💰 para precio, 📸 para fotos, 🔑 para detalles clave) y limita la respuesta a tres propiedades relevantes.

Consulta del cliente=[{{userQuery}}]

Consideraciones:
1. Muestra hasta tres propiedades que coincidan con lo solicitado por el cliente. Si no hay coincidencias exactas, elige las opciones más cercanas y menciónalo brevemente.
2. Usa un formato conciso, limitando el texto para que sea fácil de leer en WhatsApp.
3. Incluye una breve descripción de cada propiedad con:
   - 🏠 Tipo de propiedad
   - 📍 Ubicación
   - 💰 Precio
   - 📸 Link a fotos o imágenes si están disponibles
4. Mantén el mensaje claro y fácil de leer, sin duplicar propiedades.
5. No uses markdown, solo emojis y texto plano para WhatsApp.
6. Si es posible, agrega una nota final con una invitación amable para continuar la conversación.

Propiedades disponibles:
{{properties_availables}}

Ejemplo de respuesta:
🏠 *Casa en venta*
📍 Madrid, zona centro
💰 320,000€
📸 [Ver fotos](link)
🔑 3 habitaciones, 2 baños, terraza

🏠 *Piso en alquiler*
📍 Barcelona, cerca de la playa
💰 1,200€/mes
📸 [Ver fotos](link)
🔑 2 habitaciones, amueblado

¡Espero encuentres algo que te guste! Escríbeme si quieres más opciones o detalles específicos. 😊
`

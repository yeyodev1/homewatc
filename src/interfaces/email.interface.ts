export interface IEmail {
  threadId: string
  senderEmail: string
  subject: string
  content: string
  timestamp: string // O Date, dependiendo de cómo manejes las fechas
}

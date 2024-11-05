import { Request, Response } from 'express'

export async function getUsers(_req: Request, res: Response) {
  try {
    const message = 'aqui esta el mensaje'
    res.send(message)
  } catch (error) {
    res.status(500)
  }
}

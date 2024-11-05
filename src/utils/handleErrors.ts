import { Response } from 'express'

export function handleHttpError(
  res: Response,
  message = 'Oops, something happened',
  code = 403
): void {
  res.status(code)
  res.send({ message: message })
}

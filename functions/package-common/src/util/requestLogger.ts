import type { Request, Response, NextFunction } from 'express'

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  console.info(`RECV ${req.method} ${req.url}`)
  next()
}

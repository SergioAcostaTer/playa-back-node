import cors from 'cors'
import { StatusCodes } from 'http-status-codes'

//Allow all
export const corsMiddleware = cors({
  origin: ['http://localhost:4200', 'https://playea.eu'],
  optionsSuccessStatus: StatusCodes.OK,
  credentials: true
})

import cors from 'cors'
import { StatusCodes } from 'http-status-codes'

//Allow all 
export const corsMiddleware = cors({
  origin: '*',
  optionsSuccessStatus: StatusCodes.OK
})

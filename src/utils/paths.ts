import { dirname, join } from 'node:path'
import winston from 'winston'

export const joinRelativeToMainPath = (path = '') => {
  const { filename } = require.main || {}

  if (!filename) return path

  winston.info(`Joining path ${join(dirname(filename), path)}`)
  return join(dirname(filename), path)
}

export const appUrl = (path = '') => `${process.env.APP_URL}/${path}`

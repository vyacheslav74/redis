import express from 'express'
import router from './routes'

const createApp = async () => {
  const app = express()

  
  app.use(express.json())

  app.use('/', router)

  return app
}

export default createApp

import dotenv from 'dotenv'
import createApp from './core/app'
import http from 'http'
import redisRealtime from '@space-kit/redis-realtime-node'

dotenv.config()

const startApp = async () => {
  try {
    const app = await createApp()

    const port = process.env.PORT || 5000
    app.set('port', port)

    const server = http.createServer(app)

    redisRealtime(server, 'redis://localhost:6379', 'todos')

    server.listen(app.get('port'), () => {
      console.log(`Server Runnig at http://localhost:${port}`)
    })
  } catch (error) {
    console.error(`Error occured ${error}`)
  }
}

startApp()

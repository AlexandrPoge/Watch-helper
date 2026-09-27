import 'dotenv/config'
import { app } from './app'
import { env } from './config/env'

app.listen(env.port, () => {
  console.log(`Watch Helper API is running at http://localhost:${env.port}`)
})

import { config } from 'dotenv'
import { z } from 'zod'

if (process.env.NODE_ENV === 'test') {
  config({ path: '.env.test', override: true })
} else {
  config()
}

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('production'),
  DATABASE_URL: z.string(),
  PORT: z.string(),
})

const _env = envSchema.safeParse(process.env)

if (_env.success === false) {
  console.error('erro variaveis de ambiente', _env.error.format())

  throw new Error('variaveis de ambiente invalidas')
}

export const env = _env.data

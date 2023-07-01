import type { CorsConfig } from '@ioc:Adonis/Core/Cors'
import Env from "@ioc:Adonis/Core/Env"

const corsConfig: CorsConfig = {
  enabled: true,
  origin: Env.get("CORS_ALLOW"),
  methods: ['GET', 'HEAD', 'POST', 'PUT', 'DELETE'],
  headers: true,
  exposeHeaders: [
    'cache-control',
    'content-language',
    'content-type',
    'expires',
    'last-modified',
    'pragma',
  ],
  credentials: true,
  maxAge: 90,
}

export default corsConfig

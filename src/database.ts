import { knex as setupKnex, Knex } from 'knex'
import { env } from './env'

export const knexConfig: Knex.Config = {
  client: 'sqlite',
  connection: {
    filename: env.DATABASE_URL,
  },
  useNullAsDefault: true,
  migrations: {
    extension: 'ts',
    directory: './database/migrations',
  },
}

export const knex = setupKnex(knexConfig)

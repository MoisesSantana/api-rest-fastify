import { beforeAll, afterAll, it, expect, beforeEach } from 'vitest'
import { execSync } from 'node:child_process'
import request from 'supertest'
import { app } from '../../src/app'
import { describe } from 'node:test'

describe('Transactions routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    execSync('yarn run knex migrate:rollback --all')
    execSync('yarn run knex migrate:latest')
  })

  it('should be able to create a new transaction', async () => {
    await request(app.server)
      .post('/transactions')
      .send({
        title: 'Freela landing page',
        amount: 1000,
        type: 'income',
      })
      .expect(201)
  })

  it('should be able to list all the transactions', async () => {
    const createTransactionResponse = await request(app.server)
      .post('/transactions')
      .send({
        title: 'Freela landing page',
        amount: 1000,
        type: 'income',
      })

    const cookies = createTransactionResponse.get('Set-Cookie')

    const listTransactionsReponse = await request(app.server)
      .get('/transactions')
      .set('Cookie', cookies)
      .expect(200)

    expect(listTransactionsReponse.body.transactions).toEqual([
      expect.objectContaining({
        title: 'Freela landing page',
        amount: 1000,
      }),
    ])
  })

  it('should be able to get a specific transactions', async () => {
    const createTransactionResponse = await request(app.server)
      .post('/transactions')
      .send({
        title: 'Freela landing page',
        amount: 1000,
        type: 'income',
      })

    const cookies = createTransactionResponse.get('Set-Cookie')

    const listTransactionsReponse = await request(app.server)
      .get('/transactions')
      .set('Cookie', cookies)
      .expect(200)

    const transactionId = listTransactionsReponse.body.transactions[0].id
    console.log(transactionId)

    const getTransactionResponse = await request(app.server)
      .get(`/transactions/${transactionId}`)
      .set('Cookie', cookies)
      .expect(200)

    expect(getTransactionResponse.body.transaction).toEqual(
      expect.objectContaining({
        title: 'Freela landing page',
        amount: 1000,
      }),
    )
  })

  it('should be able to get the summary', async () => {
    const createTransactionResponse = await request(app.server)
      .post('/transactions')
      .send({
        title: 'Freela landing page',
        amount: 1000,
        type: 'income',
      })

    const cookies = createTransactionResponse.get('Set-Cookie')

    await request(app.server)
      .post('/transactions')
      .set('Cookie', cookies)
      .send({
        title: 'Costelinha do final de semana',
        amount: 100,
        type: 'outcome',
      })

    const summaryResponse = await request(app.server)
      .get('/transactions/summary')
      .set('Cookie', cookies)
      .expect(200)

    expect(summaryResponse.body.summary).toEqual({
      amount: 900,
    })
  })
})

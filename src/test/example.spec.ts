import { beforeAll, afterAll, describe, it, expect, beforeEach } from 'vitest'
import { execSync } from 'node:child_process'
import request from 'supertest'
import { app } from '../app'

describe('transactions routes', () => {
  // Função para excutar antes de todos os testes
  beforeAll(async () => {
    // aguardar a aplicação estar online
    await app.ready()
  })

  // Função para fechar a aplicação após todos os testes serem executados.
  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')
  })

  // testando a requisição de transações
  it('deve ser capaz de criar uma nova transação', async () => {
    await request(app.server)
      .post('/transactions')
      .send({
        title: 'Nova transação',
        amount: 5000,
        type: 'credit',
      })
      .expect(201)
  })
  it('deve ser capaz de listar todas as transações', async () => {
    const createTransactionResponse = await request(app.server)
      .post('/transactions')
      .send({
        title: 'Nova transação',
        amount: 5000,
        type: 'credit',
      })

    const cookies = createTransactionResponse.get('Set-Cookie')

    const listTransactionResponse = await request(app.server)
      .get('/transactions')
      .set('Cookie', cookies)
      .expect(200)

    expect(listTransactionResponse.body.transactions).toEqual([
      expect.objectContaining({
        title: 'Nova transação',
        amount: 5000,
      }),
    ])
  })
  it('deve ser capaz de listar uma transação especifica', async () => {
    const createTransactionResponse = await request(app.server)
      .post('/transactions')
      .send({
        title: 'Nova transação',
        amount: 5000,
        type: 'credit',
      })

    const cookies = createTransactionResponse.get('Set-Cookie')

    const listTransactionResponse = await request(app.server)
      .get('/transactions')
      .set('Cookie', cookies)
      .expect(200)

    const transactionId = listTransactionResponse.body.transactions[0].id

    const getTransactionResponse = await request(app.server)
      .get(`/transactions/${transactionId}`)
      .set('Cookie', cookies)
      .expect(200)
    expect(getTransactionResponse.body.transaction).toEqual(
      expect.objectContaining({
        title: 'Nova transação',
        amount: 5000,
      })
    )
  })
  // it('deve ser capaz de listar o saldo', async () => {
  //   const createTransactionResponse = await request(app.server)
  //     .post('/transactions')
  //     .send({
  //       title: 'Transação de crédito',
  //       amount: 5000,
  //       type: 'credit',
  //     })

  //   const cookies = createTransactionResponse.get('Set-Cookie')

  //   await request(app.server)
  //     .post('/transactions')
  //     .set('Cookie', cookies)
  //     .send({
  //       title: 'Transação de débito',
  //       amount: 2000,
  //       type: 'debit',
  //     })

  //   const summaryResponse = await request(app.server)
  //     .get('/transactions/summary')
  //     .set('Cookie', cookies)
  //     .expect(200)

  //   expect(summaryResponse.body.summary).toEqual({
  //     amount: 3000,
  //   })
  // })
})

import { PrettyStateMachine } from '../src'

let testInstance: PrettyStateMachine
let ts: number

const testInstanceName = 'localstorage-test'
const testInstanceStorageKey = `pretty-state-machine:${testInstanceName}`

beforeAll(() => {
  ts = Date.now()

  localStorage.setItem(testInstanceStorageKey, JSON.stringify({ ts }))

  testInstance = new PrettyStateMachine(testInstanceName)
})

describe('testing pretty-state-machine class with localstorage', () => {
  it('check that the timestamp got loaded', () => {
    const result = testInstance.get<number>('ts', 0)

    expect(result).toBe(ts)
  })

  it('update ts state and verify that it gets saved', async () => {
    ts = Date.now()

    const result: { ts: number } = await new Promise((resolve) => {
      testInstance.sub(() => {
        resolve(JSON.parse(localStorage.getItem(testInstanceStorageKey)))
      })

      testInstance.pub('ts', ts)
    })

    expect(result.ts).toBe(ts)
  })
})

// afterAll(() => {
//   newInstance.shutdown()
// })

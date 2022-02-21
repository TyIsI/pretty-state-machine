const { PrettyStateMachine, stateMachine } = require('../src/index.ts')

let newInstance
let ts

describe('testing pretty-state-machine class with localstorage', () => {
  it('creates a new instance with pre-existing data', () => {
    ts = Date.now()

    localStorage.setItem('pretty-state-machine:localstorage-test', JSON.stringify({ ts }))

    newInstance = new PrettyStateMachine('localstorage-test')
  })

  it('check that the timestamp got loaded', () => {
    const result = newInstance.get('ts', 0)

    expect(result).toBe(ts)
  })

  it('update ts state and verify that it gets saved', async () => {
    ts = Date.now()

    newInstance.pub('ts', ts)

    await new Promise((resolve) => setTimeout(resolve, 2000))

    const ls = JSON.parse(localStorage.getItem('pretty-state-machine:localstorage-test'))

    expect(ls.ts).toBe(ts)
  })
})

afterAll(() => {
  stateMachine.shutdown()
  newInstance.shutdown()
})

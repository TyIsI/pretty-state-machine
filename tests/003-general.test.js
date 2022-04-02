const { stateMachine } = require('../src/index.ts')

const stateHandler = (data) => { console.log('state', data) }
const testHandler = (data) => { console.log('test', data) }

describe('testing pretty-state-machine class', () => {
  it('fetch a topic entry with a default value', () => {
    const result = stateMachine.fetch('test', 'default')

    expect(result).toEqual({ test: 'default' })
  })

  it('fetch a topic entry without a default value', () => {
    const result = stateMachine.fetch('test')

    expect(result).toEqual({ test: {} })
  })

  it('get a topic entry with a default value', () => {
    const result = stateMachine.get('test', 'default')

    expect(result).toEqual('default')
  })

  it('get a topic entry without a default value', () => {
    const result = stateMachine.get('test')

    expect(result).toEqual(null)
  })

  it('sub to the default topic', () => {
    const result = stateMachine.sub(stateHandler)

    expect(result).toEqual(stateMachine.consumers)
  })

  it('sub to a named topic', () => {
    const result = stateMachine.sub('test', testHandler)

    expect(result).toEqual(stateMachine.consumers)
  })

  it('fail trying to sub without a handler', () => {
    const result = stateMachine.sub('test')

    expect(result).toEqual(null)
  })

  it('unsub from the default topic', () => {
    const result = stateMachine.unsub(stateHandler)

    expect(result).toEqual(stateMachine.consumers)
  })

  it('unsub from the a specified invalid topic', () => {
    const result = stateMachine.unsub(null, stateHandler)

    expect(result).toEqual(stateMachine.consumers)
  })

  it('detach from a named topic', () => {
    const result = stateMachine.detach('test', testHandler)

    expect(result).toEqual(stateMachine.consumers)
  })

  it('attach to a named topic', () => {
    const result = stateMachine.attach('test', testHandler)

    expect(result).toEqual(stateMachine.consumers)
  })

  it('unattach to a named topic', () => {
    const result = stateMachine.unattach('test', testHandler)

    expect(result).toEqual(stateMachine.consumers)
  })

  it('fetch a topic entry with an existing value', () => {
    stateMachine.set('test', 'test')

    const result = stateMachine.fetch('test', 'default')

    expect(result).toEqual({ test: 'test' })
  })

  it('get a topic entry with an existing value', () => {
    stateMachine.set('test', 'test')

    const result = stateMachine.get('test', 'default')

    expect(result).toEqual('test')
  })

  it('sub with an invalid topic', () => {
    const result = stateMachine.sub(null, stateHandler)

    expect(result).toEqual(stateMachine.consumers)
  })

  it('unsub with an invalid topic', () => {
    const result = stateMachine.unsub(null, stateHandler)

    expect(result).toEqual(stateMachine.consumers)
  })

  it('test new array update', () => {
    stateMachine.pub({ testArray2: [1, 2, 3] })
  })

  it('test existing array update', () => {
    stateMachine.pub({ testArray2: [1, 2, 3, 4] })
  })

  it('delete array', () => {
    const setResult = stateMachine.set('testArray2', [false, true])

    expect(setResult).toEqual({ testArray2: [false, true] })

    stateMachine.delete('testArray2')

    const result = stateMachine.get('testArray2', 'deleted')

    expect(result).toEqual('deleted')
  })
})

afterAll(() => {
  stateMachine.shutdown()
})

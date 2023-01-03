import { stateMachine } from '../src'

const stateHandler = (data: unknown) => { console.log('state', data) }
const testHandler = (data: unknown) => { console.log('test', data) }

describe('testing pretty-state-machine class', () => {
  it('fetch a topic entry with a default value', () => {
    const result = stateMachine.fetch('test', 'default')

    expect(result).toEqual({ test: 'default' })
  })

  it('fetch a topic entry without a default value', () => {
    const result = stateMachine.fetch('test')

    expect(result).toEqual({ test: {} })
  })

  it('fetch a topic entry with a default value that doesn\'t exist in store', () => {
    const result = stateMachine.fetch('test1', { test1: 'test1' })

    expect(result).toEqual({ test1: 'test1' })
  })

  it('fetch a topic entry with a default value that doesn\'t exist in store with a mismatching default value', () => {
    const result = stateMachine.fetch('test2', { test: 'test' })

    expect(result).toEqual({ test2: {} })
  })

  it('get a topic entry with a default value', () => {
    const result = stateMachine.get('test', 'default')

    expect(result).toEqual('default')
  })

  it('get a topic entry without a default value', () => {
    const result = stateMachine.get<string>('test')

    expect(result).toEqual(null)
  })

  it('get a topic entry with a default value but stored value is null', () => {
    const getResult = stateMachine.get('test', ['default'])

    expect(getResult).toEqual(['default'])
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

  it('fail trying to sub without a handler and catch the error', () => {
    expect(() => {
      stateMachine.throwErrors = true

      stateMachine.sub('test')
    }).toThrow(/Failed to subscribe to topic.*: .*/)

    stateMachine.throwErrors = false
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

    const result = stateMachine.fetch('test', 'test')

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

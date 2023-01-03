import { stateMachine } from '../src'

describe('testing pretty-state-machine pub methods', () => {
  it('pub a string', () => {
    const testData = 'test'

    stateMachine.sub('testString', ({ testString }) => {
      expect(testString).toEqual(testData)
    })

    stateMachine.pub('testString', testData)
  })

  it('pub a number', () => {
    const testData = 1

    stateMachine.sub('testNumber', ({ testNumber }) => {
      expect(testNumber).toEqual(testData)
    })

    stateMachine.pub('testNumber', testData)
  })

  it('pub a boolean', () => {
    const testData = true
    stateMachine.sub('testBoolean', ({ testBoolean }) => {
      expect(testBoolean).toEqual(testData)
    })

    stateMachine.pub('testBoolean', testData)
  })

  it('pub an object', () => {
    const testData = { test: 'test' }

    stateMachine.sub('testObj', ({ testObj }) => {
      expect(testObj).toEqual(testData)
    })

    stateMachine.pub('testObj', testData)
  })

  it('pub an array', () => {
    const testData = [1, 2, 3]

    stateMachine.sub('testObj', ({ testObj }) => {
      expect(testObj).toEqual(testData)
    })

    stateMachine.pub('testArray', testData)
  })

  it('pub a new state', () => {
    const testData = { test: 'test' }

    stateMachine.sub((testObj) => {
      expect(testObj).toEqual(testData)
    })

    stateMachine.pub({ test: 'test' })
  })
})

afterAll(() => {
  stateMachine.shutdown()
})

const { stateMachine } = require('../src/index.ts')

describe('testing pretty-state-machine set methods', () => {
  it('set a string', () => {
    const testData = 'test'

    const testString = stateMachine.set('testString', testData)

    expect(testString).toEqual({ testString: testData })
  })

  it('set a number', () => {
    const testData = 1

    const testNumber = stateMachine.set('testNumber', testData)

    expect(testNumber).toEqual({ testNumber: testData })
  })

  it('set a boolean', () => {
    const testData = true

    const testBoolean = stateMachine.set('testBoolean', testData)

    expect(testBoolean).toEqual({ testBoolean: testData })
  })

  it('set an object', () => {
    const testData = { test: 'test' }

    const testObj = stateMachine.set('testObj', testData)

    expect(testObj).toEqual(testData)
  })

  it('set an array', () => {
    const testData = [1, 2, 3]

    const testArray = stateMachine.set('testArray', testData)

    expect(testArray).toEqual({ testArray: testData })
  })

  it('set a new state', () => {
    const testData = { testState: 'testState' }

    const testObj = stateMachine.set(testData)

    expect(testObj).toEqual(testData)
  })
})

afterAll(() => {
  stateMachine.shutdown()
})

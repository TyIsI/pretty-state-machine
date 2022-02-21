const { PrettyStateMachine, stateMachine } = require('../src/index.ts')

let newInstance

describe('testing pretty-state-machine class', () => {
  it('creates a new instance', () => {
    newInstance = new PrettyStateMachine()
  })

  it('destroy the new instance', () => {
    newInstance.shutdown()
    newInstance = null
    stateMachine.shutdown()
  })

  it('test faulty localStore', () => {
    localStorage.setItem('pretty-state-machine:test-faulty-localStore', 'SOMERANDOMCGARBAGE')
    newInstance = new PrettyStateMachine('test-faulty-localStore')
  })

  it('destroy the new instance', () => {
    newInstance.shutdown()
    newInstance = null
    stateMachine.shutdown()
  })

  it('test missing localStore', () => {
    delete global.localStorage
    newInstance = new PrettyStateMachine('test-faulty-localStore')
  })

  it('destroy the new instance', () => {
    newInstance.shutdown()
    newInstance = null
    stateMachine.shutdown()
  })
})
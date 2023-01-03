import { PrettyStateMachine } from '../src'

let newInstance: PrettyStateMachine

describe('testing pretty-state-machine class', () => {
  it('creates a new instance', () => {
    newInstance = new PrettyStateMachine()
  })

  it('destroy the new instance', () => {
    newInstance.shutdown()
    newInstance = null
  })

  it('test faulty localStore', () => {
    localStorage.setItem('pretty-state-machine:test-faulty-localStore', 'SOMERANDOMCGARBAGE')
    newInstance = new PrettyStateMachine('test-faulty-localStore')
  })

  it('destroy the new instance', () => {
    newInstance.shutdown()
    newInstance = null
  })

  it('test missing localStore', () => {
    delete global.localStorage
    newInstance = new PrettyStateMachine('test-faulty-localStore')
  })

  it('destroy the new instance', () => {
    newInstance.shutdown()
    newInstance = null
  })
})

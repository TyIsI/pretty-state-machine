import { EventEmitter2 } from 'eventemitter2'
import Debug from 'debug'
const debug = Debug('pretty-state-machine')

class PrettyStateMachine {
  name: string
  debug: any
  consumers: any
  defaultTopic: string
  store: { [k: string]: {} }

  constructor (name?: string) {
    this.name = name || 'default'
    this.debug = debug.extend(this.name)
    this.debug('starting')
    this.consumers = new EventEmitter2({ wildcard: false, maxListeners: 100 })
    this.defaultTopic = 'state'
    this.store = { [this.defaultTopic]: {} }

    if (typeof localStorage !== 'undefined' && localStorage.getItem('pretty-state-machine') !== null) {
      debug('pretty-state-machine', 'trying to load data from localStorage')

      try {
        const store = JSON.parse(localStorage.getItem('pretty-state-machine'))
        this.store = { ...store, ...{ [this.defaultTopic]: store } }
        this.debug('pretty-state-machine', 'loaded data from localStorage')
      } catch (err) {
        this.debug('pretty-state-machine', 'failed to load data from localStorage:', err)
      }
    }
  }

  fetch (topic: string, defaultVal: any) {
    return (this.store[topic] !== undefined) ? { [topic]: this.store[topic] } : (this.store[this.defaultTopic][topic] !== undefined) ? { [topic]: this.store[this.defaultTopic][topic] } : (typeof defaultVal !== 'object') ? { [topic]: defaultVal } : defaultVal || {}
  }

  get (topic: string, defaultVal: any) {
    return (this.store[topic] !== undefined) ? this.store[topic] : (this.store[this.defaultTopic][topic] !== undefined) ? this.store[this.defaultTopic][topic] : defaultVal || null
  }

  pub (topic: string, args: any) {
    if (typeof topic !== 'string') {
      args = topic
      topic = this.defaultTopic
    }

    let updateObj = {}

    if (Array.isArray(args)) {
      if (this.store[topic] === undefined) this.store[topic] = []

      if (JSON.stringify(this.store[topic]) !== JSON.stringify(args)) {
        updateObj = { [topic]: args }
      }
    } else if (typeof args === 'object') {
      if (this.store[topic] === undefined) this.store[topic] = {}

      for (const updateKey in args) {
        if ((this.store[topic][updateKey] === undefined || JSON.stringify(this.store[topic][updateKey]) !== JSON.stringify(args[updateKey])) && updateKey !== this.defaultTopic) {
          updateObj[updateKey] = args[updateKey]
        }
      }
    } else {
      if (this.store[topic] !== args) {
        updateObj = { [topic]: args }
        this.store[topic] = args
      }
    }

    if (Object.keys(updateObj).length > 0) {
      this.store[this.defaultTopic] = { ...this.store[this.defaultTopic], ...updateObj }

      if (topic !== this.defaultTopic) { this.store = { ...this.store, ...updateObj } }

      for (const emitKey in updateObj) {
        this.store[emitKey] = updateObj[emitKey]
        this.consumers.emit(emitKey, { [emitKey]: this.store[emitKey] })
      }

      this.consumers.emit(this.defaultTopic, this.store[this.defaultTopic])
    }
  }

  sub (topic: string | any, handler?: any): EventEmitter2 {
    if (typeof topic === 'function') {
      handler = topic
      topic = this.defaultTopic
    }

    topic = (topic) || this.defaultTopic

    return this.consumers.on(topic, handler)
  }

  unsub (topic: string | any, handler?: any) {
    if (typeof topic === 'function') {
      handler = topic
      topic = this.defaultTopic
    }

    topic = (topic) || this.defaultTopic
    return this.consumers.off(topic, handler)
  }

  attach (topic: string | any, handler?: any) {
    return this.sub(topic, handler)
  }

  unattach (topic: string | any, handler?: any) {
    return this.unsub(topic, handler)
  }

  detach (topic: string | any, handler?: any) {
    return this.unsub(topic, handler)
  }
}

const stateMachine = new PrettyStateMachine()

if (typeof localStorage !== 'undefined') {
  stateMachine.debug('pretty-state-machine', 'saving to localStorage')
  stateMachine.sub((store: any) => {
    stateMachine.debug('pretty-state-machine', 'saved to localStorage')
    localStorage.setItem('pretty-state-machine', JSON.stringify(store))
  })
}

stateMachine.pub('init', 'ok')

export default stateMachine
export { stateMachine, stateMachine as prettyStateMachine, PrettyStateMachine }

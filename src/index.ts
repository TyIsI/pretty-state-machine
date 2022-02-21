import { EventEmitter2 } from 'eventemitter2'
import Debug from 'debug'
const debug = Debug('pretty-state-machine')

class PrettyStateMachine {
  name: string
  debug: any
  consumers: any
  defaultTopic: string
  store: { [k: string]: {} }
  localStorageKey: string

  /**
   * Constructor
   *
   * @param {string} name
   */
  constructor (name?: string) {
    this.name = name || 'default'
    this.debug = debug.extend(this.name)
    this.debug('starting')
    this.consumers = new EventEmitter2({ wildcard: false, maxListeners: 100 })
    this.defaultTopic = 'state'
    this.store = { [this.defaultTopic]: {} }

    this.localStorageKey = 'pretty-state-machine' + ((this.name !== 'default') ? ':' + this.name : '')

    if (typeof localStorage !== 'undefined') {
      if (localStorage.getItem(this.localStorageKey) !== null) {
        this.debug('trying to load data from localStorage')

        try {
          const store = JSON.parse(localStorage.getItem(this.localStorageKey))
          this.store = { ...store, ...{ [this.defaultTopic]: store } }
          this.debug('loaded data from localStorage')
        } catch (err) {
          this.debug('failed to load data from localStorage:', err)
        }
      }

      this.debug('setting up persistence to localStorage for', this.localStorageKey)
      this.sub((state) => {
        this.debug('saving to localStorage:', this.localStorageKey, state)
        localStorage.setItem(this.localStorageKey, JSON.stringify(state))
      })
    }

    this.pub('init', 'ok')
  }

  /**
   * Fetch a state as an object
   *
   * @param {string} topic
   * @param {any} defaultVal
   *
   * @returns {object}
   */
  fetch (topic: string, defaultVal: any) {
    defaultVal = (defaultVal) || {}

    /* istanbul ignore next */
    return (this.store[topic] !== undefined)
      ? { [topic]: this.store[topic] }
      : (typeof defaultVal !== 'object')
          ? { [topic]: defaultVal }
          : defaultVal[topic] !== undefined
            ? defaultVal
            : { [topic]: {} }
  }

  /**
   * Get a state as a value
   *
   * @param topic
   * @param defaultVal
   * @returns
   */
  get (topic: string, defaultVal: any) {
    /* istanbul ignore next */
    return (this.store[topic] !== undefined)
      ? this.store[topic]
      : (this.store[this.defaultTopic][topic] !== undefined)
          ? this.store[this.defaultTopic][topic]
          : defaultVal !== undefined
            ? defaultVal
            : null
  }

  /**
   * Set a state
   *
   * @param {string} topic
   * @param {any} value
   */
  pub (topic: string, args: any) {
    if (typeof topic !== 'string') {
      args = topic
      topic = this.defaultTopic
    }

    let updateObj = {}

    if (Array.isArray(args)) {
      /* istanbul ignore next */
      if (this.store[topic] === undefined) {
        this.store[topic] = []
      }

      /* istanbul ignore next */
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

  /**
   * Subscribe to a state
   *
   * @param topic
   * @param handler
   * @returns {EventEmitter2}
   */
  sub (topic: string | any, handler?: any): EventEmitter2 {
    if (typeof topic === 'function') {
      handler = topic
      topic = this.defaultTopic
    }

    topic = (topic) || this.defaultTopic

    try {
      return this.consumers.on(topic, handler)
    } catch (err) {
      this.debug('failed to subscribe:', err)
      return null
    }
  }

  /**
   * Unsubscribe from a state
   *
   * @param topic
   * @param handler
   * @returns
   */
  unsub (topic: string | any, handler?: any) {
    if (typeof topic === 'function') {
      handler = topic
      topic = this.defaultTopic
    }

    topic = (topic) || this.defaultTopic
    return this.consumers.off(topic, handler)
  }

  /**
   * Alias for sub
   *
   * @param topic
   * @param handler
   * @returns
   */
  attach (topic: string | any, handler?: any) {
    return this.sub(topic, handler)
  }

  /**
   * Alias for unsub
   *
   * @param topic
   * @param handler
   * @returns
   */
  unattach (topic: string | any, handler?: any) {
    return this.unsub(topic, handler)
  }

  /**
   * Alias for unsub
   *
   * @param topic
   * @param handler
   * @returns
   */
  detach (topic: string | any, handler?: any) {
    return this.unsub(topic, handler)
  }

  /**
   * Shutdown the state machine
   */
  shutdown () {
    this.consumers.removeAllListeners()
  }
}

/**
 * Create a new, default state machine
 */
const stateMachine = new PrettyStateMachine()

export default stateMachine
export { stateMachine, stateMachine as prettyStateMachine, PrettyStateMachine }

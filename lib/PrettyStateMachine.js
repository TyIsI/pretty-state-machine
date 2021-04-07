const { EventEmitter2 } = require('eventemitter2')

function PrettyStateMachine () {
  this.consumers = new EventEmitter2({ wildcard: false, maxListeners: 100 })
  this.defaultTopic = 'state'
  this.store = (typeof localStorage !== 'undefined' && localStorage.getItem('prettystatemachine') !== null) ? JSON.parse(localStorage.getItem('prettystatemachine')) : { [this.defaultTopic]: {} }
}

PrettyStateMachine.prototype.fetch = function (topic, defaultVal) {
  return (this.store[topic] !== undefined) ? { [topic]: this.store[topic] } : (this.store[this.defaultTopic][topic] !== undefined) ? { [topic]: this.store[this.defaultTopic][topic] } : (typeof defaultVal !== 'object') ? { [topic]: defaultVal } : defaultVal || {}
}

PrettyStateMachine.prototype.get = function (topic, defaultVal) {
  return (this.store[topic] !== undefined) ? this.store[topic] : (this.store[this.defaultTopic][topic] !== undefined) ? this.store[this.defaultTopic][topic] : defaultVal || null
}

PrettyStateMachine.prototype.pub = function (topic, args) {
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

PrettyStateMachine.prototype.sub = function (topic, handler) {
  if (typeof topic === 'function') {
    handler = topic
    topic = this.defaultTopic
  }

  topic = (topic) || this.defaultTopic

  return this.consumers.on(topic, handler)
}

PrettyStateMachine.prototype.unsub = function (topic, handler) {
  if (typeof topic === 'function') {
    handler = topic
    topic = this.defaultTopic
  }

  topic = (topic) || this.defaultTopic
  return this.consumers.off(topic, handler)
}

PrettyStateMachine.prototype.attach = function (topic, handler) {
  return this.sub(topic, handler)
}

PrettyStateMachine.prototype.unattach = function (topic, handler) {
  return this.unsub(topic, handler)
}

const stateMachine = new PrettyStateMachine()

if (typeof localStorage !== 'undefined') {
  stateMachine.sub((store) => {
    localStorage.setItem('pretty-state-machine', JSON.stringify(store))
  })
}

stateMachine.pub('init', 'ok')

module.exports = { ...stateMachine, ...{ stateMachine, prettyStateMachine: stateMachine, PrettyStateMachine } }

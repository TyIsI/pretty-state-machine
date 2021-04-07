const { EventEmitter2 } = require('eventemitter2')

function PrettyStateMachine () {
  this.consumers = new EventEmitter2({ wildcard: false, maxListeners: 100 })
  this.defaultTopic = 'state'
  this.store = (typeof localStorage !== 'undefined' && localStorage.getItem('prettystatemachine') !== null) ? JSON.parse(localStorage.getItem('prettystatemachine')) : { [this.defaultTopic]: {} }
}

PrettyStateMachine.prototype.fetch = function (topic, defaultVal) {
  return (this.store.state[topic] !== undefined) ? { [topic]: this.store.state[topic] } : { [topic]: defaultVal || null }
}

PrettyStateMachine.prototype.get = function (topic, defaultVal) {
  return (this.store.state[topic] !== undefined) ? this.store.state[topic] : defaultVal || null
}

PrettyStateMachine.prototype.pub = function (topic, args) {
  if (typeof topic !== 'string') {
    args = topic
    topic = this.defaultTopic
  }

  if (this.store[topic] === undefined) this.store[topic] = {}

  let updateObj = null

  let emit = false

  if (Array.isArray(args)) {
    updateObj = []

    for (const updateKey in args) {
      if (this.store[topic][updateKey] === undefined || JSON.stringify(this.store[topic][updateKey]) !== JSON.stringify(args[updateKey])) { updateObj[updateKey] = args[updateKey] }
    }

    if (updateObj.length > 0) {
      this.store[topic] = [...this.store[topic], ...updateObj]
      emit = true
    }
  } else if (typeof args === 'object') {
    updateObj = {}

    for (const updateKey in args) {
      if (this.store[topic][updateKey] === undefined || JSON.stringify(this.store[topic][updateKey]) !== JSON.stringify(args[updateKey])) { updateObj[updateKey] = args[updateKey] }
    }

    if (typeof updateObj === 'object' && Object.keys(updateObj).length > 0) {
      this.store[topic] = { ...this.store[topic], ...updateObj }
      if (topic !== this.defaultTopic) { this.store[this.defaultTopic] = { ...this.store[this.defaultTopic], ...{ [topic]: this.store[topic] } } }
      emit = true
    }
  } else {
    if (this.store[topic] !== args) {
      updateObj = args
      this.store[topic] = updateObj
      emit = true
    }
  }

  if (emit) {
    this.consumers.emit(topic, updateObj)
    if (topic === this.defaultTopic) {
      Object.entries(updateObj).forEach(([stateKey, stateVal]) => this.consumers.emit(stateKey, { [stateKey]: stateVal }))
    }
    this.consumers.emit(this.defaultTopic, this.store)
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

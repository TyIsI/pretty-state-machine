import { copy } from 'copy-anything'
import Debug, { type Debugger } from 'debug'
import EventEmitter from 'eventemitter3'
import {
    type psmHandler,
    type psmObject,
    type psmStoreObject,
    type psmType
} from './types'

const debug = Debug('pretty-state-machine')

class PrettyStateMachine {
    name: string
    debug: Debugger
    consumers: EventEmitter
    defaultTopic: psmType
    store: psmStoreObject
    localStorageKey: string
    throwErrors = false

    /**
     * Constructor
     *
     * @param {string} name
     */
    constructor(name?: string) {
        this.name = name || 'default'
        this.debug = debug.extend(this.name)
        this.debug('starting')
        this.consumers = new EventEmitter()
        this.defaultTopic = 'state'
        this.store = { [this.defaultTopic]: this.store }

        this.localStorageKey = 'pretty-state-machine'
        if (this.name !== 'default') this.localStorageKey += `:${this.name}`

        this.debug('localStorageKey:', this.localStorageKey)

        if (typeof localStorage !== 'undefined') {
            if (localStorage.getItem(this.localStorageKey) !== null) {
                this.debug('trying to load data from localStorage')

                try {
                    const store = JSON.parse(
                        localStorage.getItem(this.localStorageKey)
                    )
                    this.store = { ...store, ...{ [this.defaultTopic]: store } }
                    this.debug('loaded data from localStorage')
                } catch (err) {
                    this.debug('failed to load data from localStorage:', err)
                }
            }

            this.debug(
                'setting up persistence to localStorage for',
                this.localStorageKey
            )
            this.sub((state: unknown) => {
                this.debug(
                    'saving to localStorage:',
                    this.localStorageKey,
                    state
                )
                localStorage.setItem(
                    this.localStorageKey,
                    JSON.stringify(state)
                )
            })
        }

        this.pub('init', 'ok')
    }

    /**
     * Delete a state
     *
     * @param {psmType} topic
     *
     * @returns {void}
     */
    delete(topic: psmType) {
        /* TODO: fix test */
        /* istanbul ignore next */
        if (this.store[this.defaultTopic][topic] != null) {
            delete this.store[this.defaultTopic][topic]
        }

        /* TODO: fix test */
        /* istanbul ignore next */
        if (this.store[topic] != null) {
            delete this.store[topic]
        }

        this.consumers.emit(topic, null)
    }

    /**
     * Fetch a state as an object
     *
     * @param {psmType} topic
     * @param {V} defaultVal
     *
     * @returns {object}
     */
    fetch(topic: psmType, defaultVal?: psmObject | psmType): psmObject {
        defaultVal = defaultVal || {}

        if (this.store[topic] != null) {
            // If the topic exists in the store
            return copy({ [topic]: this.store[topic] })
        } else {
            // If it doesn't
            if (typeof defaultVal !== 'object') {
                // If defaultVal is not an object
                return copy({ [topic]: copy(defaultVal) })
            } else {
                // If it is an object, assume that the topic is the key
                if (defaultVal[topic as string] != null) {
                    // If the object has the topic, return the entire object
                    return copy(defaultVal)
                } else {
                    // Else return an object with the topic as the key
                    return { [topic]: {} }
                }
            }
        }
    }

    /**
     * Get a state as a value
     *
     * @param {psmType} topic
     * @param defaultVal
     *
     * @returns {V}
     */
    get<V>(topic: psmType, defaultVal?: V): V {
        /* TODO: fix test */
        /* istanbul ignore next */
        if (this.store[topic] != null) {
            return copy(this.store[topic]) as V
        } else {
            if (this.store[this.defaultTopic][topic] != null) {
                return copy(this.store[this.defaultTopic][topic]) as V
            } else {
                if (defaultVal != null) {
                    return copy(defaultVal) as V
                } else {
                    return null as V
                }
            }
        }
    }

    /**
     * Public a state
     *
     * @param {string} topic
     * @param {unknown} value
     */
    pub<V>(topic: psmType | V, value?: V) {
        if (typeof topic !== 'string') {
            value = topic as V
            topic = this.defaultTopic
        }

        const updateObj = this.set(topic, value)

        if (Object.keys(updateObj).length > 0) {
            for (const emitKey in updateObj) {
                this.consumers.emit(emitKey, { [emitKey]: this.store[emitKey] })
            }

            this.consumers.emit(
                this.defaultTopic,
                this.store[this.defaultTopic]
            )
        }

        return updateObj
    }

    /**
     * Set a state
     *
     * @param {psmType} topic
     * @param value
     */
    set<V>(topic: psmType | V, value?: V) {
        if (typeof topic !== 'string') {
            value = topic as V
            topic = this.defaultTopic
        }

        let updateObj: psmObject = {}

        if (Array.isArray(value)) {
            if (topic != null && this.store[topic] == null) {
                this.store[topic] = []
            }

            /* TODO: fix test */
            /* istanbul ignore next */
            if (JSON.stringify(this.store[topic]) !== JSON.stringify(value)) {
                updateObj = { [topic]: value }
            }
        } else if (typeof value === 'object' && value != null) {
            if (this.store[topic] == null) this.store[topic] = {}

            for (const updateKey in value) {
                if (
                    ((this.store[topic] as psmObject)[updateKey] == null ||
                        JSON.stringify(
                            (this.store[topic] as psmObject)[updateKey]
                        ) !== JSON.stringify(value[updateKey])) &&
                    updateKey !== this.defaultTopic
                ) {
                    updateObj[updateKey] = copy(value[updateKey])
                }
            }
        } else {
            if (this.store[topic] !== value) {
                updateObj = { [topic]: value }
            }
        }

        if (Object.keys(updateObj).length > 0) {
            this.store[this.defaultTopic] = {
                ...(this.store[this.defaultTopic] as psmObject),
                ...updateObj
            }

            if (topic !== this.defaultTopic) {
                this.store = { ...this.store, ...updateObj }
            }

            for (const emitKey in updateObj) {
                this.store[emitKey] = updateObj[emitKey]
            }
        }

        return updateObj
    }

    /**
     * Subscribe to a state
     *
     * @param {psmType} topic
     * @param handler
     * @returns {EventEmitter}
     */
    sub<F extends psmHandler<psmType>>(
        topic: psmType | F,
        handler?: F
    ): EventEmitter {
        if (typeof topic === 'function') {
            handler = topic as unknown as F
            topic = this.defaultTopic
        }

        topic = topic || this.defaultTopic

        try {
            return this.consumers.on(topic, handler)
        } catch (err) {
            this.debug('failed to subscribe:', err)
            if (this.throwErrors)
                throw new Error(
                    `Failed to subscribe to topic ${topic as string}: ${
                        (err as Error).message
                    }`
                )
            else return null
        }
    }

    /**
     * Unsubscribe from a state
     *
     * @param {psmType} topic
     * @param handler
     * @returns
     */
    unsub<F extends psmHandler<psmType>>(
        topic: psmType | F,
        handler?: F
    ): EventEmitter {
        if (typeof topic === 'function') {
            handler = topic
            topic = this.defaultTopic
        }

        topic = topic || this.defaultTopic
        return this.consumers.off(topic, handler)
    }

    /**
     * Alias for sub
     *
     * @param {psmType} topic
     * @param handler
     * @returns
     */
    attach<F extends psmHandler<psmType>>(
        topic: psmType | F,
        handler?: F
    ): EventEmitter {
        return this.sub(topic, handler)
    }

    /**
     * Alias for unsub
     *
     * @param {psmType} topic
     * @param handler
     * @returns
     */
    unattach<F extends psmHandler<psmType>>(
        topic: psmType | F,
        handler?: F
    ): EventEmitter {
        return this.unsub(topic, handler)
    }

    /**
     * Alias for unsub
     *
     * @param {psmType} topic
     * @param handler
     * @returns
     */
    detach<F extends psmHandler<psmType>>(
        topic: psmType | F,
        handler?: F
    ): EventEmitter {
        return this.unsub(topic, handler)
    }

    /**
     * Shutdown the state machine
     */
    shutdown() {
        this.consumers.removeAllListeners()
        this.pub({ init: 'shutdown' })
    }
}

/**
 * Create a new, default state machine
 */
const stateMachine = new PrettyStateMachine()

export default stateMachine
export { stateMachine, stateMachine as prettyStateMachine, PrettyStateMachine }

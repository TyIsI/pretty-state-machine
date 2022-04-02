import { EventEmitter2 } from 'eventemitter2';

declare class PrettyStateMachine {
    name: string;
    debug: any;
    consumers: any;
    defaultTopic: string;
    store: {
        [k: string]: {};
    };
    localStorageKey: string;
    /**
     * Constructor
     *
     * @param {string} name
     */
    constructor(name?: string);
    /**
     * Delete a state
     *
     * @param topic
     * @returns
     */
    delete(topic: string): void;
    /**
     * Fetch a state as an object
     *
     * @param {string} topic
     * @param {any} defaultVal
     *
     * @returns {object}
     */
    fetch(topic: string, defaultVal: any): any;
    /**
     * Get a state as a value
     *
     * @param topic
     * @param defaultVal
     * @returns
     */
    get(topic: string, defaultVal: any): any;
    /**
     * Public a state
     *
     * @param {string} topic
     * @param {any} value
     */
    pub(topic: string | any, value?: any): {};
    /**
     * Set a state
     *
     * @param topic
     * @param value
     */
    set(topic: string, value?: any): {};
    /**
     * Subscribe to a state
     *
     * @param topic
     * @param handler
     * @returns {EventEmitter2}
     */
    sub(topic: string | any, handler?: any): EventEmitter2;
    /**
     * Unsubscribe from a state
     *
     * @param topic
     * @param handler
     * @returns
     */
    unsub(topic: string | any, handler?: any): any;
    /**
     * Alias for sub
     *
     * @param topic
     * @param handler
     * @returns
     */
    attach(topic: string | any, handler?: any): EventEmitter2;
    /**
     * Alias for unsub
     *
     * @param topic
     * @param handler
     * @returns
     */
    unattach(topic: string | any, handler?: any): any;
    /**
     * Alias for unsub
     *
     * @param topic
     * @param handler
     * @returns
     */
    detach(topic: string | any, handler?: any): any;
    /**
     * Shutdown the state machine
     */
    shutdown(): void;
}
/**
 * Create a new, default state machine
 */
declare const stateMachine: PrettyStateMachine;

export { PrettyStateMachine, stateMachine as default, stateMachine as prettyStateMachine, stateMachine };

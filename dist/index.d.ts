import { Debugger } from 'debug';
import EventEmitter, { EventNames, EventListener } from 'eventemitter3';

declare type psmType = EventNames<string | symbol>;
declare type psmHandler<T extends psmType> = EventListener<string | symbol, T>;
declare type psmObject = Record<psmType, unknown>;
interface psmStoreObject {
    [key: psmType]: unknown | psmObject;
}

declare class PrettyStateMachine {
    name: string;
    debug: Debugger;
    consumers: EventEmitter;
    defaultTopic: psmType;
    store: psmStoreObject;
    localStorageKey: string;
    throwErrors: boolean;
    /**
     * Constructor
     *
     * @param {string} name
     */
    constructor(name?: string);
    /**
     * Delete a state
     *
     * @param {psmType} topic
     *
     * @returns {void}
     */
    delete(topic: psmType): void;
    /**
     * Fetch a state as an object
     *
     * @param {psmType} topic
     * @param {V} defaultVal
     *
     * @returns {object}
     */
    fetch(topic: psmType, defaultVal?: psmObject | psmType): psmObject;
    /**
     * Get a state as a value
     *
     * @param {psmType} topic
     * @param defaultVal
     *
     * @returns {V}
     */
    get<V>(topic: psmType, defaultVal?: V): V;
    /**
     * Public a state
     *
     * @param {string} topic
     * @param {unknown} value
     */
    pub<V>(topic: psmType | V, value?: V): psmObject;
    /**
     * Set a state
     *
     * @param {psmType} topic
     * @param value
     */
    set<V>(topic: psmType | V, value?: V): psmObject;
    /**
     * Subscribe to a state
     *
     * @param {psmType} topic
     * @param handler
     * @returns {EventEmitter}
     */
    sub<F extends psmHandler<psmType>>(topic: psmType | F, handler?: F): EventEmitter;
    /**
     * Unsubscribe from a state
     *
     * @param {psmType} topic
     * @param handler
     * @returns
     */
    unsub<F extends psmHandler<psmType>>(topic: psmType | F, handler?: F): EventEmitter;
    /**
     * Alias for sub
     *
     * @param {psmType} topic
     * @param handler
     * @returns
     */
    attach<F extends psmHandler<psmType>>(topic: psmType | F, handler?: F): EventEmitter;
    /**
     * Alias for unsub
     *
     * @param {psmType} topic
     * @param handler
     * @returns
     */
    unattach<F extends psmHandler<psmType>>(topic: psmType | F, handler?: F): EventEmitter;
    /**
     * Alias for unsub
     *
     * @param {psmType} topic
     * @param handler
     * @returns
     */
    detach<F extends psmHandler<psmType>>(topic: psmType | F, handler?: F): EventEmitter;
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

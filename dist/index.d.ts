import { EventEmitter2 } from 'eventemitter2';

declare class PrettyStateMachine {
    name: string;
    debug: any;
    consumers: any;
    defaultTopic: string;
    store: {
        [k: string]: {};
    };
    constructor(name?: string);
    fetch(topic: string, defaultVal: any): any;
    get(topic: string, defaultVal: any): any;
    pub(topic: string, args: any): void;
    sub(topic: string | any, handler?: any): EventEmitter2;
    unsub(topic: string | any, handler?: any): any;
    attach(topic: string | any, handler?: any): EventEmitter2;
    unattach(topic: string | any, handler?: any): any;
    detach(topic: string | any, handler?: any): any;
}
declare const stateMachine: PrettyStateMachine;

export { PrettyStateMachine, stateMachine as default, stateMachine as prettyStateMachine, stateMachine };

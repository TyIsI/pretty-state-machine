import { type EventListener, type EventNames } from 'eventemitter3'

export type psmType = EventNames<string | symbol>

export type psmHandler<T extends psmType> = EventListener<string | symbol, T>

export type psmObject = Record<psmType, unknown>

export type psmStoreObject = Record<psmType, unknown | psmObject>

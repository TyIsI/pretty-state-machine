import { EventListener, EventNames } from 'eventemitter3'

export type psmType = EventNames<string | symbol>

export type psmHandler<T extends psmType> = EventListener<string | symbol, T>

export type psmObject = Record<psmType, unknown>

export interface psmStoreObject {
  [key: psmType]: unknown | psmObject
}

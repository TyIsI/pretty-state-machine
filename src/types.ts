import { type EventListener, type EventNames } from 'eventemitter3'

export type PSM_Type = EventNames<string | symbol>

export type PSM_Handler<T extends PSM_Type> = EventListener<string | symbol, T>

export type PSM_Object = Record<PSM_Type, unknown>

export type PSM_StoreObject = Record<PSM_Type, unknown | PSM_Object>

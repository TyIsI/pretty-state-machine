var __defProp = Object.defineProperty;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};

// src/index.ts
import EventEmitter from "eventemitter3";
import Debug from "debug";
import { copy } from "copy-anything";
var debug = Debug("pretty-state-machine");
var PrettyStateMachine = class {
  name;
  debug;
  consumers;
  defaultTopic;
  store;
  localStorageKey;
  constructor(name) {
    this.name = name || "default";
    this.debug = debug.extend(this.name);
    this.debug("starting");
    this.consumers = new EventEmitter();
    this.defaultTopic = "state";
    this.store = { [this.defaultTopic]: {} };
    this.localStorageKey = "pretty-state-machine" + (this.name !== "default" ? ":" + this.name : "");
    if (typeof localStorage !== "undefined") {
      if (localStorage.getItem(this.localStorageKey) !== null) {
        this.debug("trying to load data from localStorage");
        try {
          const store = JSON.parse(localStorage.getItem(this.localStorageKey));
          this.store = __spreadValues(__spreadValues({}, store), { [this.defaultTopic]: store });
          this.debug("loaded data from localStorage");
        } catch (err) {
          this.debug("failed to load data from localStorage:", err);
        }
      }
      this.debug("setting up persistence to localStorage for", this.localStorageKey);
      this.sub((state) => {
        this.debug("saving to localStorage:", this.localStorageKey, state);
        localStorage.setItem(this.localStorageKey, JSON.stringify(state));
      });
    }
    this.pub("init", "ok");
  }
  delete(topic) {
    if (this.store[this.defaultTopic][topic] != null) {
      delete this.store[this.defaultTopic][topic];
    }
    if (this.store[topic] != null) {
      delete this.store[topic];
    }
    this.consumers.emit(topic, null);
  }
  fetch(topic, defaultVal) {
    defaultVal = defaultVal || {};
    return this.store[topic] != null ? copy({ [topic]: this.store[topic] }) : typeof defaultVal !== "object" ? copy({ [topic]: copy(defaultVal) }) : defaultVal[topic] != null ? copy(defaultVal) : { [topic]: {} };
  }
  get(topic, defaultVal) {
    return this.store[topic] != null ? copy(this.store[topic]) : this.store[this.defaultTopic][topic] != null ? copy(this.store[this.defaultTopic][topic]) : defaultVal != null ? copy(defaultVal) : null;
  }
  pub(topic, value) {
    if (typeof topic !== "string") {
      value = topic;
      topic = this.defaultTopic;
    }
    const updateObj = this.set(topic, value);
    if (Object.keys(updateObj).length > 0) {
      for (const emitKey in updateObj) {
        this.consumers.emit(emitKey, { [emitKey]: this.store[emitKey] });
      }
      this.consumers.emit(this.defaultTopic, this.store[this.defaultTopic]);
    }
    return updateObj;
  }
  set(topic, value) {
    if (typeof topic !== "string") {
      value = topic;
      topic = this.defaultTopic;
    }
    let updateObj = {};
    if (Array.isArray(value)) {
      if (this.store[topic] == null) {
        this.store[topic] = [];
      }
      if (JSON.stringify(this.store[topic]) !== JSON.stringify(value)) {
        updateObj = { [topic]: value };
      }
    } else if (typeof value === "object" && value != null) {
      if (this.store[topic] == null)
        this.store[topic] = {};
      for (const updateKey in value) {
        if ((this.store[topic][updateKey] == null || JSON.stringify(this.store[topic][updateKey]) !== JSON.stringify(value[updateKey])) && updateKey !== this.defaultTopic) {
          updateObj[updateKey] = copy(value[updateKey]);
        }
      }
    } else {
      if (this.store[topic] !== value) {
        updateObj = { [topic]: value };
      }
    }
    if (Object.keys(updateObj).length > 0) {
      this.store[this.defaultTopic] = __spreadValues(__spreadValues({}, this.store[this.defaultTopic]), updateObj);
      if (topic !== this.defaultTopic) {
        this.store = __spreadValues(__spreadValues({}, this.store), updateObj);
      }
      for (const emitKey in updateObj) {
        this.store[emitKey] = updateObj[emitKey];
      }
    }
    return updateObj;
  }
  sub(topic, handler) {
    if (typeof topic === "function") {
      handler = topic;
      topic = this.defaultTopic;
    }
    topic = topic || this.defaultTopic;
    try {
      return this.consumers.on(topic, handler);
    } catch (err) {
      this.debug("failed to subscribe:", err);
      return null;
    }
  }
  unsub(topic, handler) {
    if (typeof topic === "function") {
      handler = topic;
      topic = this.defaultTopic;
    }
    topic = topic || this.defaultTopic;
    return this.consumers.off(topic, handler);
  }
  attach(topic, handler) {
    return this.sub(topic, handler);
  }
  unattach(topic, handler) {
    return this.unsub(topic, handler);
  }
  detach(topic, handler) {
    return this.unsub(topic, handler);
  }
  shutdown() {
    this.consumers.removeAllListeners();
    this.pub({ init: "shutdown" });
  }
};
var stateMachine = new PrettyStateMachine();
var src_default = stateMachine;
export {
  PrettyStateMachine,
  src_default as default,
  stateMachine as prettyStateMachine,
  stateMachine
};

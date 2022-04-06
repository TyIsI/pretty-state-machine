var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __getProtoOf = Object.getPrototypeOf;
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
var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __reExport = (target, module2, copyDefault, desc) => {
  if (module2 && typeof module2 === "object" || typeof module2 === "function") {
    for (let key of __getOwnPropNames(module2))
      if (!__hasOwnProp.call(target, key) && (copyDefault || key !== "default"))
        __defProp(target, key, { get: () => module2[key], enumerable: !(desc = __getOwnPropDesc(module2, key)) || desc.enumerable });
  }
  return target;
};
var __toESM = (module2, isNodeMode) => {
  return __reExport(__markAsModule(__defProp(module2 != null ? __create(__getProtoOf(module2)) : {}, "default", !isNodeMode && module2 && module2.__esModule ? { get: () => module2.default, enumerable: true } : { value: module2, enumerable: true })), module2);
};
var __toCommonJS = /* @__PURE__ */ ((cache) => {
  return (module2, temp) => {
    return cache && cache.get(module2) || (temp = __reExport(__markAsModule({}), module2, 1), cache && cache.set(module2, temp), temp);
  };
})(typeof WeakMap !== "undefined" ? /* @__PURE__ */ new WeakMap() : 0);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  PrettyStateMachine: () => PrettyStateMachine,
  default: () => src_default,
  prettyStateMachine: () => stateMachine,
  stateMachine: () => stateMachine
});
var import_eventemitter3 = __toESM(require("eventemitter3"));
var import_debug = __toESM(require("debug"));
var debug = (0, import_debug.default)("pretty-state-machine");
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
    this.consumers = new import_eventemitter3.default();
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
    if (this.store[topic] !== void 0) {
      delete this.store[topic];
    }
    this.consumers.emit(topic, null);
  }
  fetch(topic, defaultVal) {
    defaultVal = defaultVal || {};
    return this.store[topic] !== void 0 ? { [topic]: this.store[topic] } : typeof defaultVal !== "object" ? { [topic]: defaultVal } : defaultVal[topic] !== void 0 ? defaultVal : { [topic]: {} };
  }
  get(topic, defaultVal) {
    return this.store[topic] !== void 0 ? this.store[topic] : this.store[this.defaultTopic][topic] !== void 0 ? this.store[this.defaultTopic][topic] : defaultVal !== void 0 ? defaultVal : null;
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
      if (this.store[topic] === void 0) {
        this.store[topic] = [];
      }
      if (JSON.stringify(this.store[topic]) !== JSON.stringify(value)) {
        updateObj = { [topic]: value };
      }
    } else if (typeof value === "object") {
      if (this.store[topic] === void 0)
        this.store[topic] = {};
      for (const updateKey in value) {
        if ((this.store[topic][updateKey] === void 0 || JSON.stringify(this.store[topic][updateKey]) !== JSON.stringify(value[updateKey])) && updateKey !== this.defaultTopic) {
          updateObj[updateKey] = value[updateKey];
        }
      }
    } else {
      if (this.store[topic] !== value) {
        updateObj = { [topic]: value };
        this.store[topic] = value;
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
module.exports = __toCommonJS(src_exports);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  PrettyStateMachine,
  prettyStateMachine,
  stateMachine
});

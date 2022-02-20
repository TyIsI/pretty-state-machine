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
var import_eventemitter2 = require("eventemitter2");
var import_debug = __toESM(require("debug"));
var debug = (0, import_debug.default)("pretty-state-machine");
var PrettyStateMachine = class {
  name;
  debug;
  consumers;
  defaultTopic;
  store;
  constructor(name) {
    this.name = name || "default";
    this.debug = debug.extend(this.name);
    this.debug("starting");
    this.consumers = new import_eventemitter2.EventEmitter2({ wildcard: false, maxListeners: 100 });
    this.defaultTopic = "state";
    this.store = { [this.defaultTopic]: {} };
    if (typeof localStorage !== "undefined" && localStorage.getItem("pretty-state-machine") !== null) {
      debug("pretty-state-machine", "trying to load data from localStorage");
      try {
        const store = JSON.parse(localStorage.getItem("pretty-state-machine"));
        this.store = __spreadValues(__spreadValues({}, store), { [this.defaultTopic]: store });
        this.debug("pretty-state-machine", "loaded data from localStorage");
      } catch (err) {
        this.debug("pretty-state-machine", "failed to load data from localStorage:", err);
      }
    }
  }
  fetch(topic, defaultVal) {
    return this.store[topic] !== void 0 ? { [topic]: this.store[topic] } : this.store[this.defaultTopic][topic] !== void 0 ? { [topic]: this.store[this.defaultTopic][topic] } : typeof defaultVal !== "object" ? { [topic]: defaultVal } : defaultVal || {};
  }
  get(topic, defaultVal) {
    return this.store[topic] !== void 0 ? this.store[topic] : this.store[this.defaultTopic][topic] !== void 0 ? this.store[this.defaultTopic][topic] : defaultVal || null;
  }
  pub(topic, args) {
    if (typeof topic !== "string") {
      args = topic;
      topic = this.defaultTopic;
    }
    let updateObj = {};
    if (Array.isArray(args)) {
      if (this.store[topic] === void 0)
        this.store[topic] = [];
      if (JSON.stringify(this.store[topic]) !== JSON.stringify(args)) {
        updateObj = { [topic]: args };
      }
    } else if (typeof args === "object") {
      if (this.store[topic] === void 0)
        this.store[topic] = {};
      for (const updateKey in args) {
        if ((this.store[topic][updateKey] === void 0 || JSON.stringify(this.store[topic][updateKey]) !== JSON.stringify(args[updateKey])) && updateKey !== this.defaultTopic) {
          updateObj[updateKey] = args[updateKey];
        }
      }
    } else {
      if (this.store[topic] !== args) {
        updateObj = { [topic]: args };
        this.store[topic] = args;
      }
    }
    if (Object.keys(updateObj).length > 0) {
      this.store[this.defaultTopic] = __spreadValues(__spreadValues({}, this.store[this.defaultTopic]), updateObj);
      if (topic !== this.defaultTopic) {
        this.store = __spreadValues(__spreadValues({}, this.store), updateObj);
      }
      for (const emitKey in updateObj) {
        this.store[emitKey] = updateObj[emitKey];
        this.consumers.emit(emitKey, { [emitKey]: this.store[emitKey] });
      }
      this.consumers.emit(this.defaultTopic, this.store[this.defaultTopic]);
    }
  }
  sub(topic, handler) {
    if (typeof topic === "function") {
      handler = topic;
      topic = this.defaultTopic;
    }
    topic = topic || this.defaultTopic;
    return this.consumers.on(topic, handler);
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
};
var stateMachine = new PrettyStateMachine();
if (typeof localStorage !== "undefined") {
  stateMachine.debug("pretty-state-machine", "saving to localStorage");
  stateMachine.sub((store) => {
    stateMachine.debug("pretty-state-machine", "saved to localStorage");
    localStorage.setItem("pretty-state-machine", JSON.stringify(store));
  });
}
stateMachine.pub("init", "ok");
var src_default = stateMachine;
module.exports = __toCommonJS(src_exports);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  PrettyStateMachine,
  prettyStateMachine,
  stateMachine
});

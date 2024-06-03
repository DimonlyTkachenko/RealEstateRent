function _applyDecoratedDescriptor(i, e, r, n, l) {
  var a = {};
  return Object.keys(n).forEach(function (i) {
    a[i] = n[i];
  }), a.enumerable = !!a.enumerable, a.configurable = !!a.configurable, ("value" in a || a.initializer) && (a.writable = !0), a = r.slice().reverse().reduce(function (r, n) {
    return n(i, e, r) || r;
  }, a), l && void 0 !== a.initializer && (a.value = a.initializer ? a.initializer.call(l) : void 0, a.initializer = void 0), void 0 === a.initializer && (Object.defineProperty(i, e, a), a = null), a;
}

// make PromiseIndex a nominal typing
var PromiseIndexBrand;
(function (PromiseIndexBrand) {
  PromiseIndexBrand[PromiseIndexBrand["_"] = -1] = "_";
})(PromiseIndexBrand || (PromiseIndexBrand = {}));
const TYPE_KEY = "typeInfo";
var TypeBrand;
(function (TypeBrand) {
  TypeBrand["BIGINT"] = "bigint";
  TypeBrand["DATE"] = "date";
})(TypeBrand || (TypeBrand = {}));
const ERR_INCONSISTENT_STATE = "The collection is an inconsistent state. Did previous smart contract execution terminate unexpectedly?";
const ERR_INDEX_OUT_OF_BOUNDS = "Index out of bounds";
/**
 * Asserts that the expression passed to the function is truthy, otherwise throws a new Error with the provided message.
 *
 * @param expression - The expression to be asserted.
 * @param message - The error message to be printed.
 */
function assert(expression, message) {
  if (!expression) {
    throw new Error("assertion failed: " + message);
  }
}
function getValueWithOptions(value, options = {
  deserializer: deserialize
}) {
  if (value === null) {
    return options?.defaultValue ?? null;
  }
  const deserialized = deserialize(value);
  if (deserialized === undefined || deserialized === null) {
    return options?.defaultValue ?? null;
  }
  if (options?.reconstructor) {
    return options.reconstructor(deserialized);
  }
  return deserialized;
}
function serializeValueWithOptions(value, {
  serializer
} = {
  serializer: serialize
}) {
  return serializer(value);
}
function serialize(valueToSerialize) {
  return encode(JSON.stringify(valueToSerialize, function (key, value) {
    if (typeof value === "bigint") {
      return {
        value: value.toString(),
        [TYPE_KEY]: TypeBrand.BIGINT
      };
    }
    if (typeof this[key] === "object" && this[key] !== null && this[key] instanceof Date) {
      return {
        value: this[key].toISOString(),
        [TYPE_KEY]: TypeBrand.DATE
      };
    }
    return value;
  }));
}
function deserialize(valueToDeserialize) {
  return JSON.parse(decode(valueToDeserialize), (_, value) => {
    if (value !== null && typeof value === "object" && Object.keys(value).length === 2 && Object.keys(value).every(key => ["value", TYPE_KEY].includes(key))) {
      switch (value[TYPE_KEY]) {
        case TypeBrand.BIGINT:
          return BigInt(value["value"]);
        case TypeBrand.DATE:
          return new Date(value["value"]);
      }
    }
    return value;
  });
}
/**
 * Convert a string to Uint8Array, each character must have a char code between 0-255.
 * @param s - string that with only Latin1 character to convert
 * @returns result Uint8Array
 */
function bytes(s) {
  return env.latin1_string_to_uint8array(s);
}
/**
 * Convert a Uint8Array to string, each uint8 to the single character of that char code
 * @param a - Uint8Array to convert
 * @returns result string
 */
function str(a) {
  return env.uint8array_to_latin1_string(a);
}
/**
 * Encode the string to Uint8Array with UTF-8 encoding
 * @param s - String to encode
 * @returns result Uint8Array
 */
function encode(s) {
  return env.utf8_string_to_uint8array(s);
}
/**
 * Decode the Uint8Array to string in UTF-8 encoding
 * @param a - array to decode
 * @returns result string
 */
function decode(a) {
  return env.uint8array_to_utf8_string(a);
}

var CurveType;
(function (CurveType) {
  CurveType[CurveType["ED25519"] = 0] = "ED25519";
  CurveType[CurveType["SECP256K1"] = 1] = "SECP256K1";
})(CurveType || (CurveType = {}));
var DataLength;
(function (DataLength) {
  DataLength[DataLength["ED25519"] = 32] = "ED25519";
  DataLength[DataLength["SECP256K1"] = 64] = "SECP256K1";
})(DataLength || (DataLength = {}));

/**
 * A Promise result in near can be one of:
 * - NotReady = 0 - the promise you are specifying is still not ready, not yet failed nor successful.
 * - Successful = 1 - the promise has been successfully executed and you can retrieve the resulting value.
 * - Failed = 2 - the promise execution has failed.
 */
var PromiseResult;
(function (PromiseResult) {
  PromiseResult[PromiseResult["NotReady"] = 0] = "NotReady";
  PromiseResult[PromiseResult["Successful"] = 1] = "Successful";
  PromiseResult[PromiseResult["Failed"] = 2] = "Failed";
})(PromiseResult || (PromiseResult = {}));
/**
 * A promise error can either be due to the promise failing or not yet being ready.
 */
var PromiseError;
(function (PromiseError) {
  PromiseError[PromiseError["Failed"] = 0] = "Failed";
  PromiseError[PromiseError["NotReady"] = 1] = "NotReady";
})(PromiseError || (PromiseError = {}));

const U64_MAX = 2n ** 64n - 1n;
const EVICTED_REGISTER = U64_MAX - 1n;
/**
 * Logs parameters in the NEAR WASM virtual machine.
 *
 * @param params - Parameters to log.
 */
function log(...params) {
  env.log(params.reduce((accumulated, parameter, index) => {
    // Stringify undefined
    const param = parameter === undefined ? "undefined" : parameter;
    // Convert Objects to strings and convert to string
    const stringified = typeof param === "object" ? JSON.stringify(param) : `${param}`;
    if (index === 0) {
      return stringified;
    }
    return `${accumulated} ${stringified}`;
  }, ""));
}
/**
 * Returns the account ID of the account that called the function.
 * Can only be called in a call or initialize function.
 */
function predecessorAccountId() {
  env.predecessor_account_id(0);
  return str(env.read_register(0));
}
/**
 * Returns the account ID of the current contract - the contract that is being executed.
 */
function currentAccountId() {
  env.current_account_id(0);
  return str(env.read_register(0));
}
/**
 * Returns the amount of NEAR attached to this function call.
 * Can only be called in payable functions.
 */
function attachedDeposit() {
  return env.attached_deposit();
}
/**
 * Returns the amount of Gas that has been used by this function call until now.
 */
function usedGas() {
  return env.used_gas();
}
/**
 * Reads the value from NEAR storage that is stored under the provided key.
 *
 * @param key - The key to read from storage.
 */
function storageReadRaw(key) {
  const returnValue = env.storage_read(key, 0);
  if (returnValue !== 1n) {
    return null;
  }
  return env.read_register(0);
}
/**
 * Checks for the existance of a value under the provided key in NEAR storage.
 *
 * @param key - The key to check for in storage.
 */
function storageHasKeyRaw(key) {
  return env.storage_has_key(key) === 1n;
}
/**
 * Checks for the existance of a value under the provided utf-8 string key in NEAR storage.
 *
 * @param key - The utf-8 string key to check for in storage.
 */
function storageHasKey(key) {
  return storageHasKeyRaw(encode(key));
}
/**
 * Get the last written or removed value from NEAR storage.
 */
function storageGetEvictedRaw() {
  return env.read_register(EVICTED_REGISTER);
}
/**
 * Writes the provided bytes to NEAR storage under the provided key.
 *
 * @param key - The key under which to store the value.
 * @param value - The value to store.
 */
function storageWriteRaw(key, value) {
  return env.storage_write(key, value, EVICTED_REGISTER) === 1n;
}
/**
 * Removes the value of the provided key from NEAR storage.
 *
 * @param key - The key to be removed.
 */
function storageRemoveRaw(key) {
  return env.storage_remove(key, EVICTED_REGISTER) === 1n;
}
/**
 * Removes the value of the provided utf-8 string key from NEAR storage.
 *
 * @param key - The utf-8 string key to be removed.
 */
function storageRemove(key) {
  return storageRemoveRaw(encode(key));
}
/**
 * Returns the arguments passed to the current smart contract call.
 */
function inputRaw() {
  env.input(0);
  return env.read_register(0);
}
/**
 * Returns the arguments passed to the current smart contract call as utf-8 string.
 */
function input() {
  return decode(inputRaw());
}

/**
 * A lookup map that stores data in NEAR storage.
 */
class LookupMap {
  /**
   * @param keyPrefix - The byte prefix to use when storing elements inside this collection.
   */
  constructor(keyPrefix) {
    this.keyPrefix = keyPrefix;
  }
  /**
   * Checks whether the collection contains the value.
   *
   * @param key - The value for which to check the presence.
   */
  containsKey(key) {
    const storageKey = this.keyPrefix + key;
    return storageHasKey(storageKey);
  }
  /**
   * Get the data stored at the provided key.
   *
   * @param key - The key at which to look for the data.
   * @param options - Options for retrieving the data.
   */
  get(key, options) {
    const storageKey = this.keyPrefix + key;
    const value = storageReadRaw(encode(storageKey));
    return getValueWithOptions(value, options);
  }
  /**
   * Removes and retrieves the element with the provided key.
   *
   * @param key - The key at which to remove data.
   * @param options - Options for retrieving the data.
   */
  remove(key, options) {
    const storageKey = this.keyPrefix + key;
    if (!storageRemove(storageKey)) {
      return options?.defaultValue ?? null;
    }
    const value = storageGetEvictedRaw();
    return getValueWithOptions(value, options);
  }
  /**
   * Store a new value at the provided key.
   *
   * @param key - The key at which to store in the collection.
   * @param newValue - The value to store in the collection.
   * @param options - Options for retrieving and storing the data.
   */
  set(key, newValue, options) {
    const storageKey = this.keyPrefix + key;
    const storageValue = serializeValueWithOptions(newValue, options);
    if (!storageWriteRaw(encode(storageKey), storageValue)) {
      return options?.defaultValue ?? null;
    }
    const value = storageGetEvictedRaw();
    return getValueWithOptions(value, options);
  }
  /**
   * Extends the current collection with the passed in array of key-value pairs.
   *
   * @param keyValuePairs - The key-value pairs to extend the collection with.
   * @param options - Options for storing the data.
   */
  extend(keyValuePairs, options) {
    for (const [key, value] of keyValuePairs) {
      this.set(key, value, options);
    }
  }
  /**
   * Serialize the collection.
   *
   * @param options - Options for storing the data.
   */
  serialize(options) {
    return serializeValueWithOptions(this, options);
  }
  /**
   * Converts the deserialized data from storage to a JavaScript instance of the collection.
   *
   * @param data - The deserialized data to create an instance from.
   */
  static reconstruct(data) {
    return new LookupMap(data.keyPrefix);
  }
}

function indexToKey(prefix, index) {
  const data = new Uint32Array([index]);
  const array = new Uint8Array(data.buffer);
  const key = str(array);
  return prefix + key;
}
/**
 * An iterable implementation of vector that stores its content on the trie.
 * Uses the following map: index -> element
 */
class Vector {
  /**
   * @param prefix - The byte prefix to use when storing elements inside this collection.
   * @param length - The initial length of the collection. By default 0.
   */
  constructor(prefix, length = 0) {
    this.prefix = prefix;
    this.length = length;
  }
  /**
   * Checks whether the collection is empty.
   */
  isEmpty() {
    return this.length === 0;
  }
  /**
   * Get the data stored at the provided index.
   *
   * @param index - The index at which to look for the data.
   * @param options - Options for retrieving the data.
   */
  get(index, options) {
    if (index >= this.length) {
      return options?.defaultValue ?? null;
    }
    const storageKey = indexToKey(this.prefix, index);
    const value = storageReadRaw(bytes(storageKey));
    return getValueWithOptions(value, options);
  }
  /**
   * Removes an element from the vector and returns it in serialized form.
   * The removed element is replaced by the last element of the vector.
   * Does not preserve ordering, but is `O(1)`.
   *
   * @param index - The index at which to remove the element.
   * @param options - Options for retrieving and storing the data.
   */
  swapRemove(index, options) {
    assert(index < this.length, ERR_INDEX_OUT_OF_BOUNDS);
    if (index + 1 === this.length) {
      return this.pop(options);
    }
    const key = indexToKey(this.prefix, index);
    const last = this.pop(options);
    assert(storageWriteRaw(bytes(key), serializeValueWithOptions(last, options)), ERR_INCONSISTENT_STATE);
    const value = storageGetEvictedRaw();
    return getValueWithOptions(value, options);
  }
  /**
   * Adds data to the collection.
   *
   * @param element - The data to store.
   * @param options - Options for storing the data.
   */
  push(element, options) {
    const key = indexToKey(this.prefix, this.length);
    this.length += 1;
    storageWriteRaw(bytes(key), serializeValueWithOptions(element, options));
  }
  /**
   * Removes and retrieves the element with the highest index.
   *
   * @param options - Options for retrieving the data.
   */
  pop(options) {
    if (this.isEmpty()) {
      return options?.defaultValue ?? null;
    }
    const lastIndex = this.length - 1;
    const lastKey = indexToKey(this.prefix, lastIndex);
    this.length -= 1;
    assert(storageRemoveRaw(bytes(lastKey)), ERR_INCONSISTENT_STATE);
    const value = storageGetEvictedRaw();
    return getValueWithOptions(value, options);
  }
  /**
   * Replaces the data stored at the provided index with the provided data and returns the previously stored data.
   *
   * @param index - The index at which to replace the data.
   * @param element - The data to replace with.
   * @param options - Options for retrieving and storing the data.
   */
  replace(index, element, options) {
    assert(index < this.length, ERR_INDEX_OUT_OF_BOUNDS);
    const key = indexToKey(this.prefix, index);
    assert(storageWriteRaw(bytes(key), serializeValueWithOptions(element, options)), ERR_INCONSISTENT_STATE);
    const value = storageGetEvictedRaw();
    return getValueWithOptions(value, options);
  }
  /**
   * Extends the current collection with the passed in array of elements.
   *
   * @param elements - The elements to extend the collection with.
   */
  extend(elements) {
    for (const element of elements) {
      this.push(element);
    }
  }
  [Symbol.iterator]() {
    return new VectorIterator(this);
  }
  /**
   * Create a iterator on top of the default collection iterator using custom options.
   *
   * @param options - Options for retrieving and storing the data.
   */
  createIteratorWithOptions(options) {
    return {
      [Symbol.iterator]: () => new VectorIterator(this, options)
    };
  }
  /**
   * Return a JavaScript array of the data stored within the collection.
   *
   * @param options - Options for retrieving and storing the data.
   */
  toArray(options) {
    const array = [];
    const iterator = options ? this.createIteratorWithOptions(options) : this;
    for (const value of iterator) {
      array.push(value);
    }
    return array;
  }
  /**
   * Remove all of the elements stored within the collection.
   */
  clear() {
    for (let index = 0; index < this.length; index++) {
      const key = indexToKey(this.prefix, index);
      storageRemoveRaw(bytes(key));
    }
    this.length = 0;
  }
  /**
   * Serialize the collection.
   *
   * @param options - Options for storing the data.
   */
  serialize(options) {
    return serializeValueWithOptions(this, options);
  }
  /**
   * Converts the deserialized data from storage to a JavaScript instance of the collection.
   *
   * @param data - The deserialized data to create an instance from.
   */
  static reconstruct(data) {
    const vector = new Vector(data.prefix, data.length);
    return vector;
  }
}
/**
 * An iterator for the Vector collection.
 */
class VectorIterator {
  /**
   * @param vector - The vector collection to create an iterator for.
   * @param options - Options for retrieving and storing data.
   */
  constructor(vector, options) {
    this.vector = vector;
    this.options = options;
    this.current = 0;
  }
  next() {
    if (this.current >= this.vector.length) {
      return {
        value: null,
        done: true
      };
    }
    const value = this.vector.get(this.current, this.options);
    this.current += 1;
    return {
      value,
      done: false
    };
  }
}

/**
 * An unordered map that stores data in NEAR storage.
 */
class UnorderedMap {
  /**
   * @param prefix - The byte prefix to use when storing elements inside this collection.
   */
  constructor(prefix) {
    this.prefix = prefix;
    this._keys = new Vector(`${prefix}u`); // intentional different prefix with old UnorderedMap
    this.values = new LookupMap(`${prefix}m`);
  }
  /**
   * The number of elements stored in the collection.
   */
  get length() {
    return this._keys.length;
  }
  /**
   * Checks whether the collection is empty.
   */
  isEmpty() {
    return this._keys.isEmpty();
  }
  /**
   * Get the data stored at the provided key.
   *
   * @param key - The key at which to look for the data.
   * @param options - Options for retrieving the data.
   */
  get(key, options) {
    const valueAndIndex = this.values.get(key);
    if (valueAndIndex === null) {
      return options?.defaultValue ?? null;
    }
    const [value] = valueAndIndex;
    return getValueWithOptions(encode(value), options);
  }
  /**
   * Store a new value at the provided key.
   *
   * @param key - The key at which to store in the collection.
   * @param value - The value to store in the collection.
   * @param options - Options for retrieving and storing the data.
   */
  set(key, value, options) {
    const valueAndIndex = this.values.get(key);
    const serialized = serializeValueWithOptions(value, options);
    if (valueAndIndex === null) {
      const newElementIndex = this.length;
      this._keys.push(key);
      this.values.set(key, [decode(serialized), newElementIndex]);
      return null;
    }
    const [oldValue, oldIndex] = valueAndIndex;
    this.values.set(key, [decode(serialized), oldIndex]);
    return getValueWithOptions(encode(oldValue), options);
  }
  /**
   * Removes and retrieves the element with the provided key.
   *
   * @param key - The key at which to remove data.
   * @param options - Options for retrieving the data.
   */
  remove(key, options) {
    const oldValueAndIndex = this.values.remove(key);
    if (oldValueAndIndex === null) {
      return options?.defaultValue ?? null;
    }
    const [value, index] = oldValueAndIndex;
    assert(this._keys.swapRemove(index) !== null, ERR_INCONSISTENT_STATE);
    // the last key is swapped to key[index], the corresponding [value, index] need update
    if (!this._keys.isEmpty() && index !== this._keys.length) {
      // if there is still elements and it was not the last element
      const swappedKey = this._keys.get(index);
      const swappedValueAndIndex = this.values.get(swappedKey);
      assert(swappedValueAndIndex !== null, ERR_INCONSISTENT_STATE);
      this.values.set(swappedKey, [swappedValueAndIndex[0], index]);
    }
    return getValueWithOptions(encode(value), options);
  }
  /**
   * Remove all of the elements stored within the collection.
   */
  clear() {
    for (const key of this._keys) {
      // Set instead of remove to avoid loading the value from storage.
      this.values.set(key, null);
    }
    this._keys.clear();
  }
  [Symbol.iterator]() {
    return new UnorderedMapIterator(this);
  }
  /**
   * Create a iterator on top of the default collection iterator using custom options.
   *
   * @param options - Options for retrieving and storing the data.
   */
  createIteratorWithOptions(options) {
    return {
      [Symbol.iterator]: () => new UnorderedMapIterator(this, options)
    };
  }
  /**
   * Return a JavaScript array of the data stored within the collection.
   *
   * @param options - Options for retrieving and storing the data.
   */
  toArray(options) {
    const array = [];
    const iterator = options ? this.createIteratorWithOptions(options) : this;
    for (const value of iterator) {
      array.push(value);
    }
    return array;
  }
  /**
   * Extends the current collection with the passed in array of key-value pairs.
   *
   * @param keyValuePairs - The key-value pairs to extend the collection with.
   */
  extend(keyValuePairs) {
    for (const [key, value] of keyValuePairs) {
      this.set(key, value);
    }
  }
  /**
   * Serialize the collection.
   *
   * @param options - Options for storing the data.
   */
  serialize(options) {
    return serializeValueWithOptions(this, options);
  }
  /**
   * Converts the deserialized data from storage to a JavaScript instance of the collection.
   *
   * @param data - The deserialized data to create an instance from.
   */
  static reconstruct(data) {
    const map = new UnorderedMap(data.prefix);
    // reconstruct keys Vector
    map._keys = new Vector(`${data.prefix}u`);
    map._keys.length = data._keys.length;
    // reconstruct values LookupMap
    map.values = new LookupMap(`${data.prefix}m`);
    return map;
  }
  keys({
    start,
    limit
  }) {
    const ret = [];
    if (start === undefined) {
      start = 0;
    }
    if (limit == undefined) {
      limit = this.length - start;
    }
    for (let i = start; i < start + limit; i++) {
      ret.push(this._keys.get(i));
    }
    return ret;
  }
}
/**
 * An iterator for the UnorderedMap collection.
 */
class UnorderedMapIterator {
  /**
   * @param unorderedMap - The unordered map collection to create an iterator for.
   * @param options - Options for retrieving and storing data.
   */
  constructor(unorderedMap, options) {
    this.options = options;
    this.keys = new VectorIterator(unorderedMap._keys);
    this.map = unorderedMap.values;
  }
  next() {
    const key = this.keys.next();
    if (key.done) {
      return {
        value: [key.value, null],
        done: key.done
      };
    }
    const valueAndIndex = this.map.get(key.value);
    assert(valueAndIndex !== null, ERR_INCONSISTENT_STATE);
    return {
      done: key.done,
      value: [key.value, getValueWithOptions(encode(valueAndIndex[0]), this.options)]
    };
  }
}

/**
 * Tells the SDK to expose this function as a view function.
 *
 * @param _empty - An empty object.
 */
function view(_empty) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return function (_target, _key, _descriptor
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  ) {};
}
function call({
  privateFunction = false,
  payableFunction = false
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return function (_target, _key, descriptor) {
    const originalMethod = descriptor.value;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    descriptor.value = function (...args) {
      if (privateFunction && predecessorAccountId() !== currentAccountId()) {
        throw new Error("Function is private");
      }
      if (!payableFunction && attachedDeposit() > 0n) {
        throw new Error("Function is not payable");
      }
      return originalMethod.apply(this, args);
    };
  };
}
function NearBindgen({
  requireInit = false,
  serializer = serialize,
  deserializer = deserialize
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return target => {
    return class extends target {
      static _create() {
        return new target();
      }
      static _getState() {
        const rawState = storageReadRaw(bytes("STATE"));
        return rawState ? this._deserialize(rawState) : null;
      }
      static _saveToStorage(objectToSave) {
        storageWriteRaw(bytes("STATE"), this._serialize(objectToSave));
      }
      static _getArgs() {
        return JSON.parse(input() || "{}");
      }
      static _serialize(value, forReturn = false) {
        if (forReturn) {
          return encode(JSON.stringify(value, (_, value) => typeof value === "bigint" ? `${value}` : value));
        }
        return serializer(value);
      }
      static _deserialize(value) {
        return deserializer(value);
      }
      static _reconstruct(classObject, plainObject) {
        for (const item in classObject) {
          const reconstructor = classObject[item].constructor?.reconstruct;
          classObject[item] = reconstructor ? reconstructor(plainObject[item]) : plainObject[item];
        }
        return classObject;
      }
      static _requireInit() {
        return requireInit;
      }
    };
  };
}

const IMAGES_LIMIT = 6;
class Property {
  // ref to account creator

  // reference to comments
  // maybe zulu date without time

  constructor(id, title, description = '', type = '', location = 'not specified', options, owner,
  // Near account
  price = BigInt(0), images = [],
  // only urls
  isAvailable = true, creationDate = new Date()) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.type = type;
    this.location = location;
    this.options = options;
    this.owner = owner;
    this.price = price;
    this.isAvailable = isAvailable;
    this.creationDate = creationDate;
    this.comments = [];
    this.images = images.length > IMAGES_LIMIT ? images.slice(0, IMAGES_LIMIT) : images;
  }
  static validateProperty(prop) {
    let msg = '';
    if (typeof prop !== 'object') {
      msg += 'Property must be an object!';
    }
    if (!prop?.title) {
      msg += 'Title is missing!';
    }
    if (!prop?.owner) {
      msg += 'Owner is missing!';
    }
    return {
      result: !msg,
      msg
    };
  }
}

class User {
  // Near account

  constructor(id, accountId) {
    this.id = id;
    this.accountId = accountId;
    this.bookings = [];
    this.properties = [];
  }
  // static methods are used because Near storage contains serialized plain JS objects without functions
  static addProperty(user, propertyId) {
    if (!user.properties.includes(propertyId)) {
      user.properties.push(propertyId);
    }
  }
  static removeProperty(user, propertyId) {
    const index = user.properties.indexOf(propertyId);
    if (index != -1) {
      user.properties.splice(index, 1);
    }
  }
  static addBooking(user, bookingId) {
    if (!user.bookings.includes(bookingId)) {
      user.bookings.push(bookingId);
    }
  }
  static removeBooking(user, bookingId) {
    const index = user.bookings.indexOf(bookingId);
    if (index != -1) {
      user.bookings.splice(index, 1);
    }
  }
}

var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _class, _class2;
// constants
BigInt('1000000000000000000000000');
let RealEstateNear = (_dec = NearBindgen({}), _dec2 = view(), _dec3 = view(), _dec4 = view(), _dec5 = view(), _dec6 = call({}), _dec7 = call({}), _dec8 = call({}), _dec(_class = (_class2 = class RealEstateNear {
  properties = new UnorderedMap('unique-properties');
  users = new UnorderedMap('unique-users');
  comments = new UnorderedMap('unique-comments');
  bookings = new UnorderedMap('unique-bookings');

  /**
   * Main veiw function for retrieving properties
   * @returns list of avaialable properties
   */
  getAllAvailableProperties() {
    const allProperties = this.getAllProperties();
    return allProperties.length ? allProperties.filter(el => el.isAvailable) : [];
  }
  getPropertyById({
    id
  }) {
    return id ? this.internalGetPropertyById(id) : {};
  }
  getPropertiesByAccount({
    accountId
  }) {
    log('accountID: ' + accountId);
    if (!accountId || !this.users.get(accountId)) {
      log('@getPropertiesByAccount: no account provided or it is not in storage!');
      return [];
    }
    return this.getAllProperties().filter(property => property.owner == accountId);
  }
  getBookingsByAccount(accountId) {
    if (!accountId || !this.users.get(accountId)) {
      log('@getBookingsByAccount: no account provided or it is not in storage!');
      return [];
    }
    return this.getAllProperties().filter(property => property.owner == accountId);
  }

  /**
   * Function to create new property
   * @param object typeof Property
   * @returns object with result
   */
  addProperty(object) {
    // near.log(`@addProperty: ${JSON.stringify(object)}`);
    //let donationAmount: bigint = near.attachedDeposit() as bigint;

    try {
      const newId = this.generateId(this.properties);
      const {
        result,
        msg
      } = Property.validateProperty(object);
      const callerAccount = predecessorAccountId();
      if (result) {
        // check if caller is the owner
        if (callerAccount !== object?.owner) {
          return {
            status: 'ERROR',
            error: 'Creation denied. Caller account does not match the owner!'
          };
        }
        const newProperty = new Property(newId, object?.title, object?.description, object?.type, object?.location, object?.options, object?.owner, BigInt(object?.price || 0), object?.images, object?.isAvailable);

        // add to the collection
        this.properties.set(newId, newProperty);

        // update user
        const user = this.createUserIfNotExist(callerAccount);
        // push new property
        User.addProperty(user, newProperty.id);
      } else {
        return {
          status: 'ERROR',
          error: msg
        };
      }
    } catch (e) {
      return {
        status: 'ERROR',
        error: e.msg + ' @ ' + e.stack
      };
    }
    log('gas: ' + usedGas());
    return {
      status: 'CREATED',
      error: ''
    };
  }
  updateProperty(object) {
    const existingProperty = this.internalGetPropertyById(object?.id);
    const callerAccount = predecessorAccountId();
    try {
      const {
        result,
        msg
      } = Property.validateProperty(object);
      if (!result) {
        return {
          status: 'ERROR',
          error: 'Validation error: ' + msg
        };
      }
      if (callerAccount !== object?.owner) {
        return {
          status: 'ERROR',
          error: 'Update denied. Caller account does not match the owner!'
        };
      }
      if (!existingProperty) {
        return {
          status: 'ERROR',
          error: 'Property does not exist!'
        };
      }
      existingProperty.title = object?.title ?? existingProperty.title;
      existingProperty.description = object?.description ?? existingProperty.description;
      existingProperty.type = object?.type ?? existingProperty.type;
      existingProperty.price = object?.price ?? existingProperty.price;
      existingProperty.options = object?.options ?? existingProperty.options;
      existingProperty.isAvailable = object?.isAvailable ?? existingProperty.isAvailable;
      existingProperty.location = object?.location ?? existingProperty.location;

      // Reset property
      this.properties.set(object?.id, existingProperty);
      return {
        status: 'UPDATED',
        error: ''
      };
    } catch (e) {
      return {
        status: 'ERROR',
        error: e.toString()
      };
    }
  }
  deleteProperty(object) {
    log(`@deleteProperty: ${JSON.stringify(object)}`);
    try {
      const callerAccount = predecessorAccountId();
      const existingProperty = this.internalGetPropertyById(object?.id);

      // check if caller is the owner
      if (callerAccount !== object?.owner) {
        return {
          status: 'ERROR',
          error: 'Delete denied. Caller account does not match the owner!'
        };
      }
      const user = this.users.get(callerAccount);
      this.properties.remove(existingProperty.id);
      User.removeProperty(user, existingProperty.id);
    } catch (e) {
      return {
        status: 'ERROR',
        error: e.toString()
      };
    }
    return {
      status: 'DELETED',
      error: ''
    };
  }
  createUserIfNotExist(accountId) {
    let user = this.users.get(accountId);
    if (!user) {
      const userNewId = this.generateId(this.users);
      user = new User(userNewId, accountId);
      this.users.set(accountId, user);
    }
    return user;
  }
  getAllProperties() {
    const allProperties = this.properties;
    return allProperties.isEmpty() ? [] : allProperties.toArray().map(([, property]) => property);
  }
  getAllBookings() {
    const allBookings = this.bookings;
    return allBookings.isEmpty() ? [] : allBookings.toArray().map(([, booking]) => booking);
  }
  internalGetPropertyById(id) {
    return this.properties.get(id);
  }

  /**
   * Generates new id for desired map with data
   * @param map
   * @returns string id
   */
  generateId(map) {
    return map.isEmpty() ? '1' : (map.length + 1).toString();
  }
}, (_applyDecoratedDescriptor(_class2.prototype, "getAllAvailableProperties", [_dec2], Object.getOwnPropertyDescriptor(_class2.prototype, "getAllAvailableProperties"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "getPropertyById", [_dec3], Object.getOwnPropertyDescriptor(_class2.prototype, "getPropertyById"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "getPropertiesByAccount", [_dec4], Object.getOwnPropertyDescriptor(_class2.prototype, "getPropertiesByAccount"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "getBookingsByAccount", [_dec5], Object.getOwnPropertyDescriptor(_class2.prototype, "getBookingsByAccount"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "addProperty", [_dec6], Object.getOwnPropertyDescriptor(_class2.prototype, "addProperty"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "updateProperty", [_dec7], Object.getOwnPropertyDescriptor(_class2.prototype, "updateProperty"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "deleteProperty", [_dec8], Object.getOwnPropertyDescriptor(_class2.prototype, "deleteProperty"), _class2.prototype)), _class2)) || _class);
function deleteProperty() {
  const _state = RealEstateNear._getState();
  if (!_state && RealEstateNear._requireInit()) {
    throw new Error("Contract must be initialized");
  }
  const _contract = RealEstateNear._create();
  if (_state) {
    RealEstateNear._reconstruct(_contract, _state);
  }
  const _args = RealEstateNear._getArgs();
  const _result = _contract.deleteProperty(_args);
  RealEstateNear._saveToStorage(_contract);
  if (_result !== undefined) if (_result && _result.constructor && _result.constructor.name === "NearPromise") _result.onReturn();else env.value_return(RealEstateNear._serialize(_result, true));
}
function updateProperty() {
  const _state = RealEstateNear._getState();
  if (!_state && RealEstateNear._requireInit()) {
    throw new Error("Contract must be initialized");
  }
  const _contract = RealEstateNear._create();
  if (_state) {
    RealEstateNear._reconstruct(_contract, _state);
  }
  const _args = RealEstateNear._getArgs();
  const _result = _contract.updateProperty(_args);
  RealEstateNear._saveToStorage(_contract);
  if (_result !== undefined) if (_result && _result.constructor && _result.constructor.name === "NearPromise") _result.onReturn();else env.value_return(RealEstateNear._serialize(_result, true));
}
function addProperty() {
  const _state = RealEstateNear._getState();
  if (!_state && RealEstateNear._requireInit()) {
    throw new Error("Contract must be initialized");
  }
  const _contract = RealEstateNear._create();
  if (_state) {
    RealEstateNear._reconstruct(_contract, _state);
  }
  const _args = RealEstateNear._getArgs();
  const _result = _contract.addProperty(_args);
  RealEstateNear._saveToStorage(_contract);
  if (_result !== undefined) if (_result && _result.constructor && _result.constructor.name === "NearPromise") _result.onReturn();else env.value_return(RealEstateNear._serialize(_result, true));
}
function getBookingsByAccount() {
  const _state = RealEstateNear._getState();
  if (!_state && RealEstateNear._requireInit()) {
    throw new Error("Contract must be initialized");
  }
  const _contract = RealEstateNear._create();
  if (_state) {
    RealEstateNear._reconstruct(_contract, _state);
  }
  const _args = RealEstateNear._getArgs();
  const _result = _contract.getBookingsByAccount(_args);
  if (_result !== undefined) if (_result && _result.constructor && _result.constructor.name === "NearPromise") _result.onReturn();else env.value_return(RealEstateNear._serialize(_result, true));
}
function getPropertiesByAccount() {
  const _state = RealEstateNear._getState();
  if (!_state && RealEstateNear._requireInit()) {
    throw new Error("Contract must be initialized");
  }
  const _contract = RealEstateNear._create();
  if (_state) {
    RealEstateNear._reconstruct(_contract, _state);
  }
  const _args = RealEstateNear._getArgs();
  const _result = _contract.getPropertiesByAccount(_args);
  if (_result !== undefined) if (_result && _result.constructor && _result.constructor.name === "NearPromise") _result.onReturn();else env.value_return(RealEstateNear._serialize(_result, true));
}
function getPropertyById() {
  const _state = RealEstateNear._getState();
  if (!_state && RealEstateNear._requireInit()) {
    throw new Error("Contract must be initialized");
  }
  const _contract = RealEstateNear._create();
  if (_state) {
    RealEstateNear._reconstruct(_contract, _state);
  }
  const _args = RealEstateNear._getArgs();
  const _result = _contract.getPropertyById(_args);
  if (_result !== undefined) if (_result && _result.constructor && _result.constructor.name === "NearPromise") _result.onReturn();else env.value_return(RealEstateNear._serialize(_result, true));
}
function getAllAvailableProperties() {
  const _state = RealEstateNear._getState();
  if (!_state && RealEstateNear._requireInit()) {
    throw new Error("Contract must be initialized");
  }
  const _contract = RealEstateNear._create();
  if (_state) {
    RealEstateNear._reconstruct(_contract, _state);
  }
  const _args = RealEstateNear._getArgs();
  const _result = _contract.getAllAvailableProperties(_args);
  if (_result !== undefined) if (_result && _result.constructor && _result.constructor.name === "NearPromise") _result.onReturn();else env.value_return(RealEstateNear._serialize(_result, true));
}

export { addProperty, deleteProperty, getAllAvailableProperties, getBookingsByAccount, getPropertiesByAccount, getPropertyById, updateProperty };
//# sourceMappingURL=hello_near.js.map

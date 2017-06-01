/*
 * Copyright 2017 resin.io
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const ava = require('ava');
const _ = require('lodash');
const Command = require('../lib/command');
const Signature = require('../lib/signature');
const Parameter = require('../lib/parameter');
const store = require('../lib/store');

ava.test.beforeEach(store.clear);

ava.test('clear: should clear the command store', (test) => {
  const command = new Command({
    signature: new Signature({
      command: [ 'foo', 'bar' ]
    }),
    action: _.constant(Promise.resolve())
  });

  store.set(command);
  test.deepEqual(store.look([ 'foo', 'bar' ]), [ command ]);
  store.clear();
  test.deepEqual(store.look([ 'foo', 'bar' ]), []);
});

ava.test('should store a command with two words and one string parameter and look it back', (test) => {
  const command = new Command({
    signature: new Signature({
      command: [ 'foo', 'bar' ],
      parameters: [
        new Parameter({
          name: 'baz',
          type: [ 'string' ],
          optional: false
        })
      ]
    }),
    action: _.constant(Promise.resolve())
  });

  store.set(command);
  test.deepEqual(store.look([ 'foo', 'bar', 'value' ]), [ command ]);
});

ava.test('should store a command with two words and one string parameter and fail to look it back', (test) => {
  const command = new Command({
    signature: new Signature({
      command: [ 'foo', 'bar' ],
      parameters: [
        new Parameter({
          name: 'baz',
          type: [ 'string' ],
          optional: false
        })
      ]
    }),
    action: _.constant(Promise.resolve())
  });

  store.set(command);
  test.deepEqual(store.look([ 'foo', 'bar' ]), []);
});

ava.test('should store a command with two words and one optional string parameter and look it back without the parameter', (test) => {
  const command = new Command({
    signature: new Signature({
      command: [ 'foo', 'bar' ],
      parameters: [
        new Parameter({
          name: 'baz',
          type: [ 'string' ],
          optional: true
        })
      ]
    }),
    action: _.constant(Promise.resolve())
  });

  store.set(command);
  test.deepEqual(store.look([ 'foo', 'bar' ]), [ command ]);
});

ava.test('should store a command with two words and one optional string parameter and fail to look it back with just one word', (test) => {
  const command = new Command({
    signature: new Signature({
      command: [ 'foo', 'bar' ],
      parameters: [
        new Parameter({
          name: 'baz',
          type: [ 'string' ],
          optional: true
        })
      ]
    }),
    action: _.constant(Promise.resolve())
  });

  store.set(command);
  test.deepEqual(store.look([ 'foo' ]), []);
});

ava.test('should store a command with two words and one optional string parameter and fail to look it back with no word', (test) => {
  const command = new Command({
    signature: new Signature({
      command: [ 'foo', 'bar' ],
      parameters: [
        new Parameter({
          name: 'baz',
          type: [ 'string' ],
          optional: true
        })
      ]
    }),
    action: _.constant(Promise.resolve())
  });

  store.set(command);
  test.deepEqual(store.look([]), []);
});

ava.test('should store a command with two words and one optional string parameter and fail to look it back with a different word', (test) => {
  const command = new Command({
    signature: new Signature({
      command: [ 'foo', 'bar' ],
      parameters: [
        new Parameter({
          name: 'baz',
          type: [ 'string' ],
          optional: true
        })
      ]
    }),
    action: _.constant(Promise.resolve())
  });

  store.set(command);
  test.deepEqual(store.look([ 'hey', 'bar', 'baz' ]), []);
});

ava.test('should store a command with two words and one optional string parameter and fail to look it back with too many words', (test) => {
  const command = new Command({
    signature: new Signature({
      command: [ 'foo', 'bar' ],
      parameters: [
        new Parameter({
          name: 'baz',
          type: [ 'string' ],
          optional: true
        })
      ]
    }),
    action: _.constant(Promise.resolve())
  });

  store.set(command);
  test.deepEqual(store.look([ 'foo', 'bar', 'baz', 'qux' ]), []);
});

ava.test('should store return an empty array if the store is empty and no arguments are passed', (test) => {
  test.deepEqual(store.look([ 'foo', 'bar', 'baz', 'qux' ]), []);
});

ava.test('should store and retrieve a root command without parameters', (test) => {
  const command = new Command({
    signature: new Signature({
      command: []
    }),
    action: _.constant(Promise.resolve())
  });

  store.set(command);
  test.deepEqual(store.look([]), [ command ]);
});

ava.test('should store and retrieve a root command with parameters', (test) => {
  const command = new Command({
    signature: new Signature({
      command: [],
      parameters: [
        new Parameter({
          name: 'foo',
          type: [ 'string' ],
          optional: false
        })
      ]
    }),
    action: _.constant(Promise.resolve())
  });

  store.set(command);
  test.deepEqual(store.look([ 'foo' ]), [ command ]);
});

ava.test('should store and retrieve a root command with optional parameters but no arguments', (test) => {
  const command = new Command({
    signature: new Signature({
      command: [],
      parameters: [
        new Parameter({
          name: 'foo',
          type: [ 'string' ],
          optional: true
        })
      ]
    }),
    action: _.constant(Promise.resolve())
  });

  store.set(command);
  test.deepEqual(store.look([]), [ command ]);
});

ava.test('should store and retrieve a command with many optional parameters', (test) => {
  const command = new Command({
    signature: new Signature({
      command: [ 'hello' ],
      parameters: [
        new Parameter({
          name: 'foo',
          type: [ 'string' ],
          optional: true
        }),
        new Parameter({
          name: 'bar',
          type: [ 'string' ],
          optional: true
        }),
        new Parameter({
          name: 'baz',
          type: [ 'string' ],
          optional: true
        })
      ]
    }),
    action: _.constant(Promise.resolve())
  });

  store.set(command);
  test.deepEqual(store.look([ 'hello' ]), [ command ]);
  test.deepEqual(store.look([ 'hello', 'foo' ]), [ command ]);
  test.deepEqual(store.look([ 'hello', 'foo', 'bar' ]), [ command ]);
  test.deepEqual(store.look([ 'hello', 'foo', 'bar', 'baz' ]), [ command ]);
});

ava.test('should ignore a command with many parameters even if one of the types is not met', (test) => {
  const command = new Command({
    signature: new Signature({
      command: [ 'hello' ],
      parameters: [
        new Parameter({
          name: 'foo',
          type: [ 'number' ],
          optional: true
        }),
        new Parameter({
          name: 'bar',
          type: [ 'number' ],
          optional: true
        }),
        new Parameter({
          name: 'baz',
          type: [ 'number' ],
          optional: true
        })
      ]
    }),
    action: _.constant(Promise.resolve())
  });

  store.set(command);
  test.deepEqual(store.look([ 'hello', '1', '1', 'baz' ]), []);
});

ava.test('should store and look commands with multi-types parameters', (test) => {
  const command = new Command({
    signature: new Signature({
      command: [ 'hello' ],
      parameters: [
        new Parameter({
          name: 'foo',
          type: [ 'number', 'string' ],
          optional: false
        })
      ]
    }),
    action: _.constant(Promise.resolve())
  });

  store.set(command);
  test.deepEqual(store.look([ 'hello', 'foo' ]), [ command ]);
  test.deepEqual(store.look([ 'hello', '1' ]), [ command ]);
});

ava.test('should disambiguate between two commands that differ on parameter types', (test) => {
  const stringCommand = new Command({
    signature: new Signature({
      command: [ 'foo', 'bar' ],
      parameters: [
        new Parameter({
          name: 'baz',
          type: [ 'string' ],
          optional: false
        })
      ]
    }),
    action: _.constant(Promise.resolve())
  });

  const numberCommand = new Command({
    signature: new Signature({
      command: [ 'foo', 'bar' ],
      parameters: [
        new Parameter({
          name: 'baz',
          type: [ 'number' ],
          optional: false
        })
      ]
    }),
    action: _.constant(Promise.resolve())
  });

  store.set(stringCommand);
  store.set(numberCommand);
  test.deepEqual(store.look([ 'foo', 'bar', 'baz' ]), [ stringCommand ]);
});

ava.test('should consider a number option if the string can be parsed as a number', (test) => {
  const stringCommand = new Command({
    signature: new Signature({
      command: [ 'foo', 'bar' ],
      parameters: [
        new Parameter({
          name: 'baz',
          type: [ 'string' ],
          optional: false
        })
      ]
    }),
    action: _.constant(Promise.resolve())
  });

  const numberCommand = new Command({
    signature: new Signature({
      command: [ 'foo', 'bar' ],
      parameters: [
        new Parameter({
          name: 'baz',
          type: [ 'number' ],
          optional: false
        })
      ]
    }),
    action: _.constant(Promise.resolve())
  });

  store.set(stringCommand);
  store.set(numberCommand);
  test.deepEqual(store.look([ 'foo', 'bar', '1' ]), [ stringCommand, numberCommand ]);
});

ava.test('should not consider a number option if the string is not completely parseable as a number', (test) => {
  const stringCommand = new Command({
    signature: new Signature({
      command: [ 'foo', 'bar' ],
      parameters: [
        new Parameter({
          name: 'baz',
          type: [ 'string' ],
          optional: false
        })
      ]
    }),
    action: _.constant(Promise.resolve())
  });

  const numberCommand = new Command({
    signature: new Signature({
      command: [ 'foo', 'bar' ],
      parameters: [
        new Parameter({
          name: 'baz',
          type: [ 'number' ],
          optional: false
        })
      ]
    }),
    action: _.constant(Promise.resolve())
  });

  store.set(stringCommand);
  store.set(numberCommand);
  test.deepEqual(store.look([ 'foo', 'bar', '1aa' ]), [ stringCommand ]);
});

ava.test('should find disambiguous commands where one is a subset of the other', (test) => {
  const shortCommand = new Command({
    signature: new Signature({
      command: [ 'hello' ],
      parameters: [
        new Parameter({
          name: 'foo',
          type: [ 'number', 'string' ],
          optional: false
        })
      ]
    }),
    action: _.constant(Promise.resolve())
  });

  const longCommand = new Command({
    signature: new Signature({
      command: [ 'hello', 'world' ],
      parameters: [
        new Parameter({
          name: 'foo',
          type: [ 'number', 'string' ],
          optional: false
        })
      ]
    }),
    action: _.constant(Promise.resolve())
  });

  store.set(shortCommand);
  store.set(longCommand);

  test.deepEqual(store.look([ 'hello', 'world' ]), [ shortCommand ]);
  test.deepEqual(store.look([ 'hello', 'world', 'xxx' ]), [ longCommand ]);
});

ava.test('should fail to retrieve a command with a required variadic parameter, using no words', (test) => {
  const command = new Command({
    signature: new Signature({
      command: [ 'foo', 'bar' ],
      parameters: [
        new Parameter({
          name: 'baz',
          type: [ 'string' ],
          optional: false,
          variadic: true
        })
      ]
    }),
    action: _.constant(Promise.resolve())
  });

  store.set(command);
  test.deepEqual(store.look([ 'foo', 'bar' ]), []);
});

ava.test('should store and retrieve a command with a required variadic parameter, using one word', (test) => {
  const command = new Command({
    signature: new Signature({
      command: [ 'foo', 'bar' ],
      parameters: [
        new Parameter({
          name: 'baz',
          type: [ 'string' ],
          optional: false,
          variadic: true
        })
      ]
    }),
    action: _.constant(Promise.resolve())
  });

  store.set(command);
  test.deepEqual(store.look([ 'foo', 'bar', 'value' ]), [ command ]);
});

ava.test('should store and retrieve a command with a required variadic parameter, using two words', (test) => {
  const command = new Command({
    signature: new Signature({
      command: [ 'foo', 'bar' ],
      parameters: [
        new Parameter({
          name: 'baz',
          type: [ 'string' ],
          optional: false,
          variadic: true
        })
      ]
    }),
    action: _.constant(Promise.resolve())
  });

  store.set(command);
  test.deepEqual(store.look([ 'foo', 'bar', 'value1', 'value2' ]), [ command ]);
});

ava.test('should store and retrieve a command with a required variadic parameter, using three words', (test) => {
  const command = new Command({
    signature: new Signature({
      command: [ 'foo', 'bar' ],
      parameters: [
        new Parameter({
          name: 'baz',
          type: [ 'string' ],
          optional: false,
          variadic: true
        })
      ]
    }),
    action: _.constant(Promise.resolve())
  });

  store.set(command);
  test.deepEqual(store.look([ 'foo', 'bar', 'value1', 'value2', 'value3' ]), [ command ]);
});

ava.test('should store and retrieve a command with a optional variadic parameter, using no words', (test) => {
  const command = new Command({
    signature: new Signature({
      command: [ 'foo', 'bar' ],
      parameters: [
        new Parameter({
          name: 'baz',
          type: [ 'string' ],
          optional: true,
          variadic: true
        })
      ]
    }),
    action: _.constant(Promise.resolve())
  });

  store.set(command);
  test.deepEqual(store.look([ 'foo', 'bar' ]), [ command ]);
});

ava.test('should store and retrieve a command with a optional variadic parameter, using one word', (test) => {
  const command = new Command({
    signature: new Signature({
      command: [ 'foo', 'bar' ],
      parameters: [
        new Parameter({
          name: 'baz',
          type: [ 'string' ],
          optional: true,
          variadic: true
        })
      ]
    }),
    action: _.constant(Promise.resolve())
  });

  store.set(command);
  test.deepEqual(store.look([ 'foo', 'bar', 'value' ]), [ command ]);
});

ava.test('should store and retrieve a command with a optional variadic parameter, using two words', (test) => {
  const command = new Command({
    signature: new Signature({
      command: [ 'foo', 'bar' ],
      parameters: [
        new Parameter({
          name: 'baz',
          type: [ 'string' ],
          optional: true,
          variadic: true
        })
      ]
    }),
    action: _.constant(Promise.resolve())
  });

  store.set(command);
  test.deepEqual(store.look([ 'foo', 'bar', 'value1', 'value2' ]), [ command ]);
});

ava.test('should store and retrieve a command with a optional variadic parameter, using three words', (test) => {
  const command = new Command({
    signature: new Signature({
      command: [ 'foo', 'bar' ],
      parameters: [
        new Parameter({
          name: 'baz',
          type: [ 'string' ],
          optional: true,
          variadic: true
        })
      ]
    }),
    action: _.constant(Promise.resolve())
  });

  store.set(command);
  test.deepEqual(store.look([ 'foo', 'bar', 'value1', 'value2', 'value3' ]), [ command ]);
});

ava.test('should ignore variadic commands when the type does not match', (test) => {
  const command = new Command({
    signature: new Signature({
      command: [ 'foo', 'bar' ],
      parameters: [
        new Parameter({
          name: 'baz',
          type: [ 'number' ],
          optional: true,
          variadic: true
        })
      ]
    }),
    action: _.constant(Promise.resolve())
  });

  store.set(command);
  test.deepEqual(store.look([ 'foo', 'bar', '1', '2', 'foo' ]), []);
});

ava.test('should store and retrieve a command with a multi-type variadic parameter', (test) => {
  const command = new Command({
    signature: new Signature({
      command: [ 'foo', 'bar' ],
      parameters: [
        new Parameter({
          name: 'baz',
          type: [ 'string', 'number' ],
          optional: true,
          variadic: true
        })
      ]
    }),
    action: _.constant(Promise.resolve())
  });

  store.set(command);
  test.deepEqual(store.look([ 'foo', 'bar', '1', '2', 'value3' ]), [ command ]);
});

ava.test('should ignore a command that is a subset of a variadic command when many parameters are passed', (test) => {
  const nonVariadicCommand = new Command({
    signature: new Signature({
      command: [ 'foo', 'bar' ],
      parameters: [
        new Parameter({
          name: 'baz',
          type: [ 'string' ],
          optional: false,
          variadic: false
        })
      ]
    }),
    action: _.constant(Promise.resolve())
  });

  const variadicCommand = new Command({
    signature: new Signature({
      command: [ 'foo', 'bar' ],
      parameters: [
        new Parameter({
          name: 'baz',
          type: [ 'string' ],
          optional: false,
          variadic: true
        })
      ]
    }),
    action: _.constant(Promise.resolve())
  });

  store.set(nonVariadicCommand);
  store.set(variadicCommand);

  test.deepEqual(store.look([ 'foo', 'bar', 'value1', 'value2' ]), [ variadicCommand ]);
});

ava.test('should return ambiguous results given a command that is a subset of a variadic command and both match', (test) => {
  const nonVariadicCommand = new Command({
    signature: new Signature({
      command: [ 'foo', 'bar' ],
      parameters: [
        new Parameter({
          name: 'baz',
          type: [ 'string' ],
          optional: false,
          variadic: false
        })
      ]
    }),
    action: _.constant(Promise.resolve())
  });

  const variadicCommand = new Command({
    signature: new Signature({
      command: [ 'foo', 'bar' ],
      parameters: [
        new Parameter({
          name: 'baz',
          type: [ 'string' ],
          optional: false,
          variadic: true
        })
      ]
    }),
    action: _.constant(Promise.resolve())
  });

  store.set(nonVariadicCommand);
  store.set(variadicCommand);

  test.deepEqual(store.look([ 'foo', 'bar', 'value1' ]), [ nonVariadicCommand, variadicCommand ]);
});

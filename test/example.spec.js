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
const Example = require('../lib/example');

ava.test('constructor: should throw if parameters is not an array', (test) => {
  test.throws(() => {
    new Example({
      parameters: 'foo bar'
    });
  }, 'Invalid example parameters: foo bar');
});

ava.test('constructor: should throw if parameters contain a truthy boolean', (test) => {
  test.throws(() => {
    new Example({
      parameters: [ 'foo', true ]
    });
  }, 'Invalid example parameters: foo,true');
});

ava.test('constructor: should throw if parameters contain a falsy boolean', (test) => {
  test.throws(() => {
    new Example({
      parameters: [ 'foo', false ]
    });
  }, 'Invalid example parameters: foo,false');
});

ava.test('constructor: should throw if parameters contain an array', (test) => {
  test.throws(() => {
    new Example({
      parameters: [ 'foo', [ 'bar' ] ]
    });
  }, 'Invalid example parameters: foo,bar');
});

ava.test('constructor: should throw if parameters contain an object', (test) => {
  test.throws(() => {
    new Example({
      parameters: [ 'foo', { bar: 'baz' } ]
    });
  }, 'Invalid example parameters: foo,[object Object]');
});

ava.test('constructor: should throw if description is not a string', (test) => {
  test.throws(() => {
    new Example({
      description: 1
    });
  }, 'Invalid example description: 1');
});

ava.test('constructor: should throw if options is not a plain object', (test) => {
  test.throws(() => {
    new Example({
      options: [ 1, 2, 3 ]
    });
  }, 'Invalid example options: 1,2,3');
});

ava.test('constructor: should throw if options contains an object value', (test) => {
  test.throws(() => {
    new Example({
      options: {
        foo: {
          bar: 'baz'
        }
      }
    });
  }, 'Invalid example options: [object Object]');
});

ava.test('constructor: should throw if options is empty', (test) => {
  test.throws(() => {
    new Example();
  }, 'Invalid example: undefined');
});

ava.test('constructor: should throw if options is null', (test) => {
  test.throws(() => {
    new Example(null);
  }, 'Invalid example: null');
});

ava.test('constructor: should throw if options is no a plain object', (test) => {
  test.throws(() => {
    new Example([ 1, 2, 3 ]);
  }, 'Invalid example: 1,2,3');
});

ava.test('constructor: should store the example parameters', (test) => {
  const example = new Example({
    parameters: [ 'foo' ]
  });

  test.deepEqual(example.parameters, [ 'foo' ]);
});

ava.test('constructor: should store the example description', (test) => {
  const example = new Example({
    description: 'hello world'
  });

  test.deepEqual(example.description, 'hello world');
});

ava.test('constructor: should trim the example description', (test) => {
  const example = new Example({
    description: '   hello world   '
  });

  test.deepEqual(example.description, 'hello world');
});

ava.test('constructor: should store the example options', (test) => {
  const example = new Example({
    options: {
      foo: 'bar'
    }
  });

  test.deepEqual(example.options, {
    foo: 'bar'
  });
});

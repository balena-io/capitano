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
const Signature = require('../lib/signature');
const Parameter = require('../lib/parameter');

ava.test('constructor: should throw if command is not an array', (test) => {
  test.throws(() => {
    new Signature({
      command: 'foo bar'
    });
  }, 'Invalid signature command: foo bar');
});

ava.test('constructor: should throw if command contains a non string word', (test) => {
  test.throws(() => {
    new Signature({
      command: [ 'foo', 1 ]
    });
  }, 'Invalid signature command: foo,1');
});

ava.test('constructor: should throw if parameters is not an array', (test) => {
  test.throws(() => {
    new Signature({
      command: [ 'foo' ],
      parameters: {
        name: 'foo',
        type: [ 'string' ]
      }
    });
  }, 'Invalid signature parameters: [object Object]');
});

ava.test('constructor: should throw if parameters is not an array of Parameter instances', (test) => {
  test.throws(() => {
    new Signature({
      command: [ 'foo' ],
      parameters: [
        {
          name: 'foo',
          type: [ 'string' ]
        }
      ]
    });
  }, 'Invalid signature parameters: [object Object]');
});

ava.test('constructor: should store an empty signature command', (test) => {
  const signature = new Signature({
    command: []
  });

  test.deepEqual(signature.command, []);
});

ava.test('constructor: should store a one word signature command', (test) => {
  const signature = new Signature({
    command: [ 'foo' ]
  });

  test.deepEqual(signature.command, [ 'foo' ]);
});

ava.test('constructor: should store a two word signature command', (test) => {
  const signature = new Signature({
    command: [ 'foo', 'bar' ]
  });

  test.deepEqual(signature.command, [ 'foo', 'bar' ]);
});

ava.test('constructor: should trim command strings', (test) => {
  const signature = new Signature({
    command: [ '    foo   ', '    bar' ]
  });

  test.deepEqual(signature.command, [ 'foo', 'bar' ]);
});

ava.test('constructor: should default parameters to an empty array', (test) => {
  const signature = new Signature({
    command: [ 'foo', 'bar' ]
  });

  test.deepEqual(signature.parameters, []);
});

ava.test('constructor: should store signature parameters', (test) => {
  const parameters = [
    new Parameter({
      name: 'foo',
      type: [ 'string' ]
    }),
    new Parameter({
      name: 'bar',
      type: [ 'string' ]
    })
  ];

  const signature = new Signature({
    command: [ 'foo', 'bar' ],
    parameters
  });

  test.deepEqual(signature.parameters, parameters);
});

ava.test('constructor: should store a required parameter followed by an optional parameter', (test) => {
  const parameters = [
    new Parameter({
      name: 'foo',
      type: [ 'string' ],
      optional: false
    }),
    new Parameter({
      name: 'bar',
      type: [ 'string' ],
      optional: true
    })
  ];

  const signature = new Signature({
    command: [ 'foo', 'bar' ],
    parameters
  });

  test.deepEqual(signature.parameters, parameters);
});

ava.test('constructor: should store a required parameter followed by a variadic optional parameter', (test) => {
  const parameters = [
    new Parameter({
      name: 'foo',
      type: [ 'string' ],
      optional: false
    }),
    new Parameter({
      name: 'bar',
      type: [ 'string' ],
      optional: true,
      variadic: true
    })
  ];

  const signature = new Signature({
    command: [ 'foo', 'bar' ],
    parameters
  });

  test.deepEqual(signature.parameters, parameters);
});

ava.test('constructor: should store a required parameter followed by a variadic non-optional parameter', (test) => {
  const parameters = [
    new Parameter({
      name: 'foo',
      type: [ 'string' ],
      optional: false
    }),
    new Parameter({
      name: 'bar',
      type: [ 'string' ],
      optional: false,
      variadic: true
    })
  ];

  const signature = new Signature({
    command: [ 'foo', 'bar' ],
    parameters
  });

  test.deepEqual(signature.parameters, parameters);
});

ava.test('constructor: should throw if there is a required parameter after an optional one', (test) => {
  test.throws(() => {
    new Signature({
      command: [ 'foo' ],
      parameters: [
        new Parameter({
          name: 'foo',
          type: [ 'string' ],
          optional: true
        }),
        new Parameter({
          name: 'bar',
          type: [ 'string' ],
          optional: false
        })
      ]
    });
  }, 'Invalid signature parameters: required parameter after an optional parameter');
});

ava.test('constructor: should throw if there is a required parameter after a required variadic one', (test) => {
  test.throws(() => {
    new Signature({
      command: [ 'foo' ],
      parameters: [
        new Parameter({
          name: 'foo',
          type: [ 'string' ],
          optional: false,
          variadic: true
        }),
        new Parameter({
          name: 'bar',
          type: [ 'string' ],
          optional: false
        })
      ]
    });
  }, 'Invalid signature parameters: parameter after a variadic parameter');
});

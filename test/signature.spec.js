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

ava.test('constructor: should throw if there are two parameters with the same name', (test) => {
  test.throws(() => {
    new Signature({
      command: [ 'foo' ],
      parameters: [
        new Parameter({
          name: 'foo',
          type: [ 'string' ],
          optional: false
        }),
        new Parameter({
          name: 'foo',
          type: [ 'number' ],
          optional: true
        })
      ]
    });
  }, 'Invalid signature parameters: duplicated parameters');
});

ava.test('match: should match no arguments with a signature with an optional parameter', (test) => {
  const signature = new Signature({
    command: [ 'foo' ],
    parameters: [
      new Parameter({
        name: 'bar',
        type: [ 'string' ],
        optional: true
      })
    ]
  });

  test.deepEqual(Signature.match(signature, [ 'foo' ]), {
    bar: undefined
  });
});

ava.test('match: should match one string argument against a command with one string required parameter', (test) => {
  const signature = new Signature({
    command: [ 'foo' ],
    parameters: [
      new Parameter({
        name: 'bar',
        type: [ 'string' ],
        optional: false
      })
    ]
  });

  test.deepEqual(Signature.match(signature, [ 'foo', 'baz' ]), {
    bar: 'baz'
  });
});

ava.test('match: should match one string argument against a command with one string optional parameter', (test) => {
  const signature = new Signature({
    command: [ 'foo' ],
    parameters: [
      new Parameter({
        name: 'bar',
        type: [ 'string' ],
        optional: true
      })
    ]
  });

  test.deepEqual(Signature.match(signature, [ 'foo', 'baz' ]), {
    bar: 'baz'
  });
});

ava.test('match: should match two string arguments against a command with one string optional parameter', (test) => {
  const signature = new Signature({
    command: [ 'foo' ],
    parameters: [
      new Parameter({
        name: 'bar',
        type: [ 'string' ],
        optional: true
      })
    ]
  });

  test.deepEqual(Signature.match(signature, [ 'foo', 'bar', 'baz' ]), null);
});

ava.test('match: should match two string arguments against a command with three string required parameters', (test) => {
  const signature = new Signature({
    command: [ 'foo' ],
    parameters: [
      new Parameter({
        name: 'bar',
        type: [ 'string' ],
        optional: false
      }),
      new Parameter({
        name: 'baz',
        type: [ 'string' ],
        optional: false
      }),
      new Parameter({
        name: 'qux',
        type: [ 'string' ],
        optional: false
      })
    ]
  });

  test.deepEqual(Signature.match(signature, [ 'foo', 'bar', 'baz' ]), null);
});

ava.test('match: should match no arguments against a command with three string optional parameters', (test) => {
  const signature = new Signature({
    command: [ 'foo' ],
    parameters: [
      new Parameter({
        name: 'bar',
        type: [ 'string' ],
        optional: true
      }),
      new Parameter({
        name: 'baz',
        type: [ 'string' ],
        optional: true
      }),
      new Parameter({
        name: 'qux',
        type: [ 'string' ],
        optional: true
      })
    ]
  });

  test.deepEqual(Signature.match(signature, [ 'foo' ]), {
    bar: undefined,
    baz: undefined,
    qux: undefined
  });
});

ava.test('match: should match one string argument against a command with three string optional parameters', (test) => {
  const signature = new Signature({
    command: [ 'foo' ],
    parameters: [
      new Parameter({
        name: 'bar',
        type: [ 'string' ],
        optional: true
      }),
      new Parameter({
        name: 'baz',
        type: [ 'string' ],
        optional: true
      }),
      new Parameter({
        name: 'qux',
        type: [ 'string' ],
        optional: true
      })
    ]
  });

  test.deepEqual(Signature.match(signature, [ 'foo', 'bar' ]), {
    bar: 'bar',
    baz: undefined,
    qux: undefined
  });
});

ava.test('match: should match two string arguments against a command with three string optional parameters', (test) => {
  const signature = new Signature({
    command: [ 'foo' ],
    parameters: [
      new Parameter({
        name: 'bar',
        type: [ 'string' ],
        optional: true
      }),
      new Parameter({
        name: 'baz',
        type: [ 'string' ],
        optional: true
      }),
      new Parameter({
        name: 'qux',
        type: [ 'string' ],
        optional: true
      })
    ]
  });

  test.deepEqual(Signature.match(signature, [ 'foo', 'bar', 'baz' ]), {
    bar: 'bar',
    baz: 'baz',
    qux: undefined
  });
});

ava.test('match: should match three string arguments against a command with three string optional parameters', (test) => {
  const signature = new Signature({
    command: [ 'foo' ],
    parameters: [
      new Parameter({
        name: 'bar',
        type: [ 'string' ],
        optional: true
      }),
      new Parameter({
        name: 'baz',
        type: [ 'string' ],
        optional: true
      }),
      new Parameter({
        name: 'qux',
        type: [ 'string' ],
        optional: true
      })
    ]
  });

  test.deepEqual(Signature.match(signature, [ 'foo', 'bar', 'baz', 'qux' ]), {
    bar: 'bar',
    baz: 'baz',
    qux: 'qux'
  });
});

ava.test('match: should match one number argument against a command with one string required parameter', (test) => {
  const signature = new Signature({
    command: [ 'foo' ],
    parameters: [
      new Parameter({
        name: 'bar',
        type: [ 'string' ],
        optional: false
      })
    ]
  });

  test.deepEqual(Signature.match(signature, [ 'foo', 1 ]), null);
});

ava.test('match: should match one number argument against a command with one string optional parameter', (test) => {
  const signature = new Signature({
    command: [ 'foo' ],
    parameters: [
      new Parameter({
        name: 'bar',
        type: [ 'string' ],
        optional: true
      })
    ]
  });

  test.deepEqual(Signature.match(signature, [ 'foo', 1 ]), null);
});

ava.test('match: should match one string argument against a command with one string required variadic parameter', (test) => {
  const signature = new Signature({
    command: [ 'foo' ],
    parameters: [
      new Parameter({
        name: 'bar',
        type: [ 'string' ],
        optional: false,
        variadic: true
      })
    ]
  });

  test.deepEqual(Signature.match(signature, [ 'foo', 'bar' ]), {
    bar: [ 'bar' ]
  });
});

ava.test('match: should match three string arguments against a command with one string required variadic parameter', (test) => {
  const signature = new Signature({
    command: [ 'foo' ],
    parameters: [
      new Parameter({
        name: 'bar',
        type: [ 'string' ],
        optional: false,
        variadic: true
      })
    ]
  });

  test.deepEqual(Signature.match(signature, [ 'foo', 'bar', 'baz', 'qux' ]), {
    bar: [ 'bar', 'baz', 'qux' ]
  });
});

ava.test('match: should match three number and string arguments against a command with one string and number required variadic parameter', (test) => {
  const signature = new Signature({
    command: [ 'foo' ],
    parameters: [
      new Parameter({
        name: 'bar',
        type: [ 'string', 'number' ],
        optional: false,
        variadic: true
      })
    ]
  });

  test.deepEqual(Signature.match(signature, [ 'foo', 'bar', 5, 8 ]), {
    bar: [ 'bar', 5, 8 ]
  });
});

ava.test('match: should match no arguments against a command with one string required variadic parameter', (test) => {
  const signature = new Signature({
    command: [ 'foo' ],
    parameters: [
      new Parameter({
        name: 'bar',
        type: [ 'string' ],
        optional: false,
        variadic: true
      })
    ]
  });

  test.deepEqual(Signature.match(signature, [ 'foo' ]), null);
});

ava.test('match: should match no arguments against a command with one string optional variadic parameter', (test) => {
  const signature = new Signature({
    command: [ 'foo' ],
    parameters: [
      new Parameter({
        name: 'bar',
        type: [ 'string' ],
        optional: true,
        variadic: true
      })
    ]
  });

  test.deepEqual(Signature.match(signature, [ 'foo' ]), {
    bar: []
  });
});

ava.test('match: should match five valid arguments against a command with one required string parameter and one required number variadic parameter', (test) => {
  const signature = new Signature({
    command: [ 'foo' ],
    parameters: [
      new Parameter({
        name: 'bar',
        type: [ 'string' ],
        optional: false,
        variadic: false
      }),
      new Parameter({
        name: 'baz',
        type: [ 'number' ],
        optional: false,
        variadic: true
      })
    ]
  });

  test.deepEqual(Signature.match(signature, [ 'foo', 'bar', 1, 2, 3, 4 ]), {
    bar: 'bar',
    baz: [ 1, 2, 3, 4 ]
  });
});

ava.test('match: should match five invalid arguments against a command with one required string parameter and one required number variadic parameter', (test) => {
  const signature = new Signature({
    command: [ 'foo' ],
    parameters: [
      new Parameter({
        name: 'bar',
        type: [ 'string' ],
        optional: false,
        variadic: false
      }),
      new Parameter({
        name: 'baz',
        type: [ 'number' ],
        optional: false,
        variadic: true
      })
    ]
  });

  test.deepEqual(Signature.match(signature, [ 'foo', 'bar', 1, 2, 3, 'baz' ]), null);
});

ava.test('match: should match one string argument against a command with one required string parameter and one optional number variadic parameter', (test) => {
  const signature = new Signature({
    command: [ 'foo' ],
    parameters: [
      new Parameter({
        name: 'bar',
        type: [ 'string' ],
        optional: false,
        variadic: false
      }),
      new Parameter({
        name: 'baz',
        type: [ 'number' ],
        optional: true,
        variadic: true
      })
    ]
  });

  test.deepEqual(Signature.match(signature, [ 'foo', 'bar' ]), {
    bar: 'bar',
    baz: []
  });
});

ava.test('match: should match one number argument against a command with one required string parameter and one optional number variadic parameter', (test) => {
  const signature = new Signature({
    command: [ 'foo' ],
    parameters: [
      new Parameter({
        name: 'bar',
        type: [ 'string' ],
        optional: false,
        variadic: false
      }),
      new Parameter({
        name: 'baz',
        type: [ 'number' ],
        optional: true,
        variadic: true
      })
    ]
  });

  test.deepEqual(Signature.match(signature, [ 'foo', 3 ]), null);
});

ava.test('match: should match three arguments to a command with one optional string parameter and one optional variadic number parameter', (test) => {
  const signature = new Signature({
    command: [ 'foo' ],
    parameters: [
      new Parameter({
        name: 'bar',
        type: [ 'string' ],
        optional: true,
        variadic: false
      }),
      new Parameter({
        name: 'baz',
        type: [ 'number' ],
        optional: true,
        variadic: true
      })
    ]
  });

  test.deepEqual(Signature.match(signature, [ 'foo', 'bar', 3, 4 ]), {
    bar: 'bar',
    baz: [ 3, 4 ]
  });
});

ava.test('match: should match one argument to a command with one optional string parameter and one optional variadic number parameter', (test) => {
  const signature = new Signature({
    command: [ 'foo' ],
    parameters: [
      new Parameter({
        name: 'bar',
        type: [ 'string' ],
        optional: true,
        variadic: false
      }),
      new Parameter({
        name: 'baz',
        type: [ 'number' ],
        optional: true,
        variadic: true
      })
    ]
  });

  test.deepEqual(Signature.match(signature, [ 'foo', 'bar' ]), {
    bar: 'bar',
    baz: []
  });
});

ava.test('match: should match no arguments to a command with one optional string parameter and one optional variadic number parameter', (test) => {
  const signature = new Signature({
    command: [ 'foo' ],
    parameters: [
      new Parameter({
        name: 'bar',
        type: [ 'string' ],
        optional: true,
        variadic: false
      }),
      new Parameter({
        name: 'baz',
        type: [ 'number' ],
        optional: true,
        variadic: true
      })
    ]
  });

  test.deepEqual(Signature.match(signature, [ 'foo' ]), {
    bar: undefined,
    baz: []
  });
});

ava.test('match: should match three number and string arguments against an empty command with one string and number required variadic parameter', (test) => {
  const signature = new Signature({
    command: [],
    parameters: [
      new Parameter({
        name: 'bar',
        type: [ 'string', 'number' ],
        optional: false,
        variadic: true
      })
    ]
  });

  test.deepEqual(Signature.match(signature, [ 'foo', 5, 8 ]), {
    bar: [ 'foo', 5, 8 ]
  });
});

ava.test('match: should match a one word command', (test) => {
  const signature = new Signature({
    command: [ 'foo' ],
    parameters: []
  });

  test.deepEqual(Signature.match(signature, [ 'foo' ]), {});
});

ava.test('match: should not match if the command has no arguments but there is an extra word', (test) => {
  const signature = new Signature({
    command: [ 'foo' ],
    parameters: []
  });

  test.deepEqual(Signature.match(signature, [ 'foo', 'bar' ]), null);
});

ava.test('match: should match a two word command', (test) => {
  const signature = new Signature({
    command: [ 'foo', 'bar' ],
    parameters: []
  });

  test.deepEqual(Signature.match(signature, [ 'foo', 'bar' ]), {});
});

ava.test('match: should match a three word command', (test) => {
  const signature = new Signature({
    command: [ 'foo', 'bar', 'baz' ],
    parameters: []
  });

  test.deepEqual(Signature.match(signature, [ 'foo', 'bar', 'baz' ]), {});
});

ava.test('match: should exactly match the command', (test) => {
  const signature = new Signature({
    command: [ 'foo', 'bar', 'baz' ],
    parameters: []
  });

  test.deepEqual(Signature.match(signature, [ 'foo', 'br', 'baz' ]), null);
});

ava.test('match: should match a three word command with various parameters', (test) => {
  const signature = new Signature({
    command: [ 'foo', 'bar', 'baz' ],
    parameters: [
      new Parameter({
        name: 'one',
        type: [ 'string' ],
        optional: false
      }),
      new Parameter({
        name: 'two',
        type: [ 'string', 'number' ],
        optional: false,
        variadic: true
      })
    ]
  });

  test.deepEqual(Signature.match(signature, [ 'foo', 'bar', 'baz', 'hello', 'world', 2 ]), {
    one: 'hello',
    two: [ 'world', 2 ]
  });
});

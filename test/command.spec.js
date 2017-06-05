/*
 * Copyright 2017 resin.io
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless optional by applicable law or agreed to in writing, software
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
const Example = require('../lib/example');
const Option = require('../lib/option');

ava.test('constructor: should throw if options is empty', (test) => {
  test.throws(() => {
    new Command();
  }, 'Invalid command: undefined');
});

ava.test('constructor: should throw if options is null', (test) => {
  test.throws(() => {
    new Command(null);
  }, 'Invalid command: null');
});

ava.test('constructor: should throw if options is no a plain object', (test) => {
  test.throws(() => {
    new Command([ 1, 2, 3 ]);
  }, 'Invalid command: 1,2,3');
});

ava.test('constructor: should throw if signature is not an instance of Signature', (test) => {
  test.throws(() => {
    new Command({
      signature: {
        command: [ 'foo', 'bar' ],
        parameters: [
          {
            name: 'baz',
            type: [ 'string' ],
            description: 'baz parameter',
            optional: true
          }
        ]
      },
      action: _.constant(Promise.resolve())
    });
  }, 'Invalid command signature: [object Object]');
});

ava.test('constructor: should throw if description is not a string', (test) => {
  test.throws(() => {
    new Command({
      description: 1,
      signature: new Signature({
        command: [ 'foo', 'bar' ]
      }),
      action: _.constant(Promise.resolve())
    });
  }, 'Invalid command description: 1');
});

ava.test('constructor: should throw if help is not a string', (test) => {
  test.throws(() => {
    new Command({
      help: 1,
      signature: new Signature({
        command: [ 'foo', 'bar' ]
      }),
      action: _.constant(Promise.resolve())
    });
  }, 'Invalid command help: 1');
});

ava.test('constructor: should throw if examples is not a list of Example instances', (test) => {
  test.throws(() => {
    new Command({
      signature: new Signature({
        command: [ 'foo', 'bar' ]
      }),
      examples: [
        {
          parameters: [ 'bar', 'baz' ],
          options: {
            yes: true
          }
        },
        {
          parameters: [ 'baz', 'qux' ],
          options: {
            yes: true
          }
        }
      ],
      action: _.constant(Promise.resolve())
    });
  }, 'Invalid command examples: [object Object],[object Object]');
});

ava.test('constructor: should throw if options is not a list of Option instances', (test) => {
  test.throws(() => {
    new Command({
      signature: new Signature({
        command: [ 'foo', 'bar' ]
      }),
      options: [
        {
          name: 'foo',
          type: [ 'string' ]
        },
        {
          name: 'bar',
          type: [ 'number' ]
        }
      ],
      action: _.constant(Promise.resolve())
    });
  }, 'Invalid command options: [object Object],[object Object]');
});

ava.test('constructor: should throw if there are two options with the same name but equal types', (test) => {
  test.throws(() => {
    new Command({
      signature: new Signature({
        command: [ 'foo', 'bar' ]
      }),
      options: [
        new Option({
          name: 'foo',
          placeholder: 'first',
          type: [ 'string' ]
        }),
        new Option({
          name: 'foo',
          placeholder: 'second',
          type: [ 'string' ]
        })
      ],
      action: _.constant(Promise.resolve())
    });
  }, 'Invalid command options: [--foo <first>],[--foo <second>]');
});

ava.test('constructor: should throw if there are two options with the same name but different types', (test) => {
  test.throws(() => {
    new Command({
      signature: new Signature({
        command: [ 'foo', 'bar' ]
      }),
      options: [
        new Option({
          name: 'foo',
          type: [ 'string' ]
        }),
        new Option({
          name: 'foo',
          type: [ 'boolean' ]
        })
      ],
      action: _.constant(Promise.resolve())
    });
  }, 'Invalid command options: [--foo <value>],[--foo]');
});

ava.test('constructor: should throw if an option alias equals the name of another option', (test) => {
  test.throws(() => {
    new Command({
      signature: new Signature({
        command: [ 'foo', 'bar' ]
      }),
      options: [
        new Option({
          name: 'foo',
          type: [ 'string' ]
        }),
        new Option({
          name: 'bar',
          aliases: [ 'foo' ],
          type: [ 'boolean' ]
        })
      ],
      action: _.constant(Promise.resolve())
    });
  }, 'Invalid command options: [--foo <value>],[--bar, --foo]');
});

ava.test('constructor: should throw if middlewares is not an array of functions', (test) => {
  test.throws(() => {
    new Command({
      signature: new Signature({
        command: [ 'foo', 'bar' ]
      }),
      middlewares: [ 1, 2, 3 ],
      action: _.constant(Promise.resolve())
    });
  }, 'Invalid command middlewares: 1,2,3');
});

ava.test('constructor: should throw if action is not a function', (test) => {
  test.throws(() => {
    new Command({
      signature: new Signature({
        command: [ 'foo', 'bar' ]
      }),
      action: 1
    });
  }, 'Invalid command action: 1');
});

ava.test('constructor: should store the command signature', (test) => {
  const signature = new Signature({
    command: [ 'foo', 'bar' ]
  });

  const command = new Command({
    signature,
    action: _.constant(Promise.resolve())
  });

  test.deepEqual(command.signature, signature);
});

ava.test('constructor: should store the command description', (test) => {
  const command = new Command({
    signature: new Signature({
      command: [ 'foo', 'bar' ]
    }),
    description: 'hello world',
    action: _.constant(Promise.resolve())
  });

  test.deepEqual(command.description, 'hello world');
});

ava.test('constructor: should trim the command description', (test) => {
  const command = new Command({
    signature: new Signature({
      command: [ 'foo', 'bar' ]
    }),
    description: '   hello world   ',
    action: _.constant(Promise.resolve())
  });

  test.deepEqual(command.description, 'hello world');
});

ava.test('constructor: should store the command help', (test) => {
  const command = new Command({
    signature: new Signature({
      command: [ 'foo', 'bar' ]
    }),
    help: 'command help',
    action: _.constant(Promise.resolve())
  });

  test.deepEqual(command.help, 'command help');
});

ava.test('constructor: should trim the command help', (test) => {
  const command = new Command({
    signature: new Signature({
      command: [ 'foo', 'bar' ]
    }),
    help: '   command help   ',
    action: _.constant(Promise.resolve())
  });

  test.deepEqual(command.help, 'command help');
});

ava.test('constructor: should correctly handle multi-line help', (test) => {
  const command = new Command({
    signature: new Signature({
      command: [ 'foo', 'bar' ]
    }),
    help: `
      Hello world.

      This is a multi-line help string.
    `,
    action: _.constant(Promise.resolve())
  });

  test.deepEqual(command.help, 'Hello world.\n\nThis is a multi-line help string.');
});

ava.test('constructor: should store command examples', (test) => {
  const examples = [
    new Example({
      parameters: [ 'bar', 'baz' ],
      options: {
        yes: true
      }
    })
  ];

  const command = new Command({
    signature: new Signature({
      command: [ 'foo', 'bar' ]
    }),
    examples,
    action: _.constant(Promise.resolve())
  });

  test.deepEqual(command.examples, examples);
});

ava.test('constructor: should store command options', (test) => {
  const options = [
    new Option({
      name: 'foo',
      placeholder: 'value',
      description: 'the foo option',
      type: [ 'string' ],
      default: 'bar',
      aliases: [ 'f' ]
    }),
    new Option({
      name: 'bar',
      description: 'the bar option',
      type: [ 'boolean' ]
    })
  ];

  const command = new Command({
    signature: new Signature({
      command: [ 'foo', 'bar' ]
    }),
    options,
    action: _.constant(Promise.resolve())
  });

  test.deepEqual(command.options, options);
});

ava.test('constructor: should store an object inside custom', (test) => {
  const command = new Command({
    signature: new Signature({
      command: [ 'foo', 'bar' ]
    }),
    custom: {
      foo: 'bar'
    },
    action: _.constant(Promise.resolve())
  });

  test.deepEqual(command.custom, {
    foo: 'bar'
  });
});

ava.test('constructor: should store an integer inside custom', (test) => {
  const command = new Command({
    signature: new Signature({
      command: [ 'foo', 'bar' ]
    }),
    custom: 1,
    action: _.constant(Promise.resolve())
  });

  test.deepEqual(command.custom, 1);
});

ava.test('constructor: should store command middlewares', (test) => {
  const middlewares = [
    () => {
      return Promise.resolve();
    },
    () => {
      return Promise.resolve();
    },
    () => {
      return Promise.resolve();
    }
  ];

  const command = new Command({
    signature: new Signature({
      command: [ 'foo', 'bar' ]
    }),
    middlewares,
    action: _.constant(Promise.resolve())
  });

  test.deepEqual(command.middlewares, middlewares);
});

ava.test('constructor: should store the command action', (test) => {
  const action = () => {
    return Promise.resolve();
  };

  const command = new Command({
    signature: new Signature({
      command: [ 'foo', 'bar' ]
    }),
    action
  });

  test.deepEqual(command.action, action);
});

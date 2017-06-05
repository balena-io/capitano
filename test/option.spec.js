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
const Option = require('../lib/option');

ava.test('constructor: should throw if options is empty', (test) => {
  test.throws(() => {
    new Option();
  }, 'Invalid option: undefined');
});

ava.test('constructor: should throw if options is null', (test) => {
  test.throws(() => {
    new Option(null);
  }, 'Invalid option: null');
});

ava.test('constructor: should throw if options is no a plain object', (test) => {
  test.throws(() => {
    new Option([ 1, 2, 3 ]);
  }, 'Invalid option: 1,2,3');
});

ava.test('constructor: should throw if no name', (test) => {
  test.throws(() => {
    new Option({
      type: [ 'string' ]
    });
  }, 'Invalid option name: undefined');
});

ava.test('constructor: should throw if name is not a string', (test) => {
  test.throws(() => {
    new Option({
      name: 1,
      type: [ 'string' ]
    });
  }, 'Invalid option name: 1');
});

ava.test('constructor: should throw if name is an empty string', (test) => {
  test.throws(() => {
    new Option({
      name: '',
      type: [ 'string' ]
    });
  }, 'Invalid option name: ');
});

ava.test('constructor: should throw if name is a blank string', (test) => {
  test.throws(() => {
    new Option({
      name: '    ',
      type: [ 'string' ]
    });
  }, 'Invalid option name:     ');
});

ava.test('constructor: should throw if name contains spaces', (test) => {
  test.throws(() => {
    new Option({
      name: 'foo bar',
      type: [ 'string' ]
    });
  }, 'Invalid option name: foo bar');
});

ava.test('constructor: should throw if name starts with a hyphen', (test) => {
  test.throws(() => {
    new Option({
      name: '-foo',
      type: [ 'string' ]
    });
  }, 'Invalid option name: -foo');
});

ava.test('constructor: should throw if name ends with a hyphen', (test) => {
  test.throws(() => {
    new Option({
      name: '-foo',
      type: [ 'string' ]
    });
  }, 'Invalid option name: -foo');
});

ava.test('constructor: should throw if name contains more than one grouped infix hyphen', (test) => {
  test.throws(() => {
    new Option({
      name: 'foo--bar',
      type: [ 'string' ]
    });
  }, 'Invalid option name: foo--bar');
});

ava.test('constructor: should throw if name contains more than uppercase letter', (test) => {
  test.throws(() => {
    new Option({
      name: 'ABC',
      type: [ 'string' ]
    });
  }, 'Invalid option name: ABC');
});

ava.test('constructor: should throw if name is lowercase but contains one uppercase letter', (test) => {
  test.throws(() => {
    new Option({
      name: 'Foo',
      type: [ 'string' ]
    });
  }, 'Invalid option name: Foo');
});

ava.test('constructor: should throw if type is missing', (test) => {
  test.throws(() => {
    new Option({
      name: 'foo'
    });
  }, 'Invalid option type: undefined');
});

ava.test('constructor: should throw if type is not an array', (test) => {
  test.throws(() => {
    new Option({
      name: 'foo',
      type: 'string'
    });
  }, 'Invalid option type: string');
});

ava.test('constructor: should throw if type is empty', (test) => {
  test.throws(() => {
    new Option({
      name: 'foo',
      type: []
    });
  }, 'Invalid option type: ');
});

ava.test('constructor: should throw if type is invalid', (test) => {
  test.throws(() => {
    new Option({
      name: 'foo',
      type: [ 'foo' ]
    });
  }, 'Invalid option type: foo');
});

ava.test('constructor: should throw if type is a mixture of a valid and an invalid one', (test) => {
  test.throws(() => {
    new Option({
      name: 'foo',
      type: [ 'string', 'foo' ]
    });
  }, 'Invalid option type: string,foo');
});

ava.test('constructor: should throw if type is a mixture of boolean and non-boolean types', (test) => {
  test.throws(() => {
    new Option({
      name: 'foo',
      type: [ 'boolean', 'string' ]
    });
  }, 'Invalid option type: boolean,string');
});

ava.test('constructor: should throw if description is not a string', (test) => {
  test.throws(() => {
    new Option({
      name: 'foo',
      type: [ 'string' ],
      description: 1
    });
  }, 'Invalid option description: 1');
});

ava.test('constructor: should throw if placeholder is not a string', (test) => {
  test.throws(() => {
    new Option({
      name: 'foo',
      placeholder: 1,
      type: [ 'string' ]
    });
  }, 'Invalid option placeholder: 1');
});

ava.test('constructor: should throw if the default value is not valid', (test) => {
  test.throws(() => {
    new Option({
      name: 'foo',
      type: [ 'string' ],
      default: [ 1, 2, 3 ]
    });
  }, 'Invalid option default value: 1,2,3');
});

ava.test('constructor: should throw if the type is boolean but the default value is not boolean', (test) => {
  test.throws(() => {
    new Option({
      name: 'foo',
      type: [ 'boolean' ],
      default: 'hello'
    });
  }, 'Invalid option default value: hello');
});

ava.test('constructor: should throw if the type is string but the default value is number', (test) => {
  test.throws(() => {
    new Option({
      name: 'foo',
      type: [ 'string' ],
      default: 1
    });
  }, 'Invalid option default value: 1');
});

ava.test('constructor: should throw if the type is string and number but the default value is boolean', (test) => {
  test.throws(() => {
    new Option({
      name: 'foo',
      type: [ 'string', 'number' ],
      default: true
    });
  }, 'Invalid option default value: true');
});

ava.test('constructor: should throw if aliases contain invalid elements', (test) => {
  test.throws(() => {
    new Option({
      name: 'foo',
      type: [ 'string', 'number' ],
      aliases: [ 1, 2 ]
    });
  }, 'Invalid option aliases: 1,2');
});

ava.test('constructor: should throw if aliases contain duplicate elements', (test) => {
  test.throws(() => {
    new Option({
      name: 'foo',
      type: [ 'string', 'number' ],
      aliases: [ 'f', 'f' ]
    });
  }, 'Invalid option aliases: f,f');
});

ava.test('constructor: should throw if the option name is contained in the aliases', (test) => {
  test.throws(() => {
    new Option({
      name: 'foo',
      type: [ 'string', 'number' ],
      aliases: [ 'foo', 'f' ]
    });
  }, 'Invalid option aliases: foo,f');
});

ava.test('constructor: should throw if aliases contain strings with spaces', (test) => {
  test.throws(() => {
    new Option({
      name: 'foo',
      type: [ 'string', 'number' ],
      aliases: [ 'foo bar' ]
    });
  }, 'Invalid option aliases: foo bar');
});

ava.test('constructor: should throw if optional is not boolean', (test) => {
  test.throws(() => {
    new Option({
      name: 'foo',
      type: [ 'string' ],
      optional: 1
    });
  }, 'Invalid option optional flag: 1');
});

ava.test('constructor: should throw if environment is not boolean nor string', (test) => {
  test.throws(() => {
    new Option({
      name: 'foo',
      type: [ 'string' ],
      environment: 1
    });
  }, 'Invalid option environment: 1');
});

ava.test('constructor: should throw if environment is an empty string', (test) => {
  test.throws(() => {
    new Option({
      name: 'foo',
      type: [ 'string' ],
      environment: ''
    });
  }, 'Invalid option environment: ');
});

ava.test('constructor: should throw if environment is a blank string', (test) => {
  test.throws(() => {
    new Option({
      name: 'foo',
      type: [ 'string' ],
      environment: '    '
    });
  }, 'Invalid option environment:     ');
});

ava.test('constructor: should throw if environment contains invalid characters', (test) => {
  test.throws(() => {
    new Option({
      name: 'foo',
      type: [ 'string' ],
      environment: '%foo $bar'
    });
  }, 'Invalid option environment: %foo $bar');
});

ava.test('constructor: should store the option name', (test) => {
  const option = new Option({
    name: 'foo',
    type: [ 'string' ]
  });

  test.deepEqual(option.name, 'foo');
});

ava.test('constructor: should store number option names', (test) => {
  const option = new Option({
    name: '9',
    type: [ 'string' ]
  });

  test.deepEqual(option.name, '9');
});

ava.test('constructor: should store single letter option names', (test) => {
  const option = new Option({
    name: 'a',
    type: [ 'string' ]
  });

  test.deepEqual(option.name, 'a');
});

ava.test('constructor: should store uppercase single letter option names', (test) => {
  const option = new Option({
    name: 'A',
    type: [ 'string' ]
  });

  test.deepEqual(option.name, 'A');
});

ava.test('constructor: should store option names with infix hyphens', (test) => {
  const option = new Option({
    name: 'foo-bar',
    type: [ 'string' ]
  });

  test.deepEqual(option.name, 'foo-bar');
});

ava.test('constructor: should default the option placeholder to "value"', (test) => {
  const option = new Option({
    name: 'foo',
    type: [ 'string' ]
  });

  test.deepEqual(option.placeholder, 'value');
});

ava.test('constructor: should store the option placeholder', (test) => {
  const option = new Option({
    name: 'foo',
    placeholder: 'bar',
    type: [ 'string' ]
  });

  test.deepEqual(option.placeholder, 'bar');
});

ava.test('constructor: should trim the option placeholder', (test) => {
  const option = new Option({
    name: 'foo',
    placeholder: '   bar   ',
    type: [ 'string' ]
  });

  test.deepEqual(option.placeholder, 'bar');
});

ava.test('constructor: should store the option description', (test) => {
  const option = new Option({
    name: 'foo',
    description: 'my foo description',
    type: [ 'string' ]
  });

  test.deepEqual(option.description, 'my foo description');
});

ava.test('constructor: should trim the option description', (test) => {
  const option = new Option({
    name: 'foo',
    description: '   my foo description   ',
    type: [ 'string' ]
  });

  test.deepEqual(option.description, 'my foo description');
});

ava.test('constructor: should store the option type', (test) => {
  const option = new Option({
    name: 'foo',
    type: [ 'string' ]
  });

  test.deepEqual(option.type, [ 'string' ]);
});

ava.test('constructor: should set default to undefined by default', (test) => {
  const option = new Option({
    name: 'foo',
    type: [ 'string' ]
  });

  test.deepEqual(option.default, undefined);
});

ava.test('constructor: should store a default string value', (test) => {
  const option = new Option({
    name: 'foo',
    type: [ 'string' ],
    default: 'bar'
  });

  test.deepEqual(option.default, 'bar');
});

ava.test('constructor: should store a default boolean value', (test) => {
  const option = new Option({
    name: 'foo',
    type: [ 'boolean' ],
    default: false
  });

  test.deepEqual(option.default, false);
});

ava.test('constructor: should set no aliases by default', (test) => {
  const option = new Option({
    name: 'foo',
    type: [ 'string' ]
  });

  test.deepEqual(option.aliases, []);
});

ava.test('constructor: should store option aliases', (test) => {
  const option = new Option({
    name: 'foo',
    type: [ 'string' ],
    aliases: [ 'f', 'b' ]
  });

  test.deepEqual(option.aliases, [ 'f', 'b' ]);
});

ava.test('constructor: should set the optional flag to true by default', (test) => {
  const option = new Option({
    name: 'foo',
    type: [ 'boolean' ]
  });

  test.deepEqual(option.optional, true);
});

ava.test('constructor: should store the optional option flag', (test) => {
  const option = new Option({
    name: 'foo',
    type: [ 'boolean' ],
    optional: false
  });

  test.deepEqual(option.optional, false);
});

ava.test('constructor: should set environment to true by default', (test) => {
  const option = new Option({
    name: 'foo',
    type: [ 'boolean' ]
  });

  test.deepEqual(option.environment, true);
});

ava.test('constructor: should store a true environment flag value', (test) => {
  const option = new Option({
    name: 'foo',
    type: [ 'boolean' ],
    environment: true
  });

  test.deepEqual(option.environment, true);
});

ava.test('constructor: should store a false environment flag value', (test) => {
  const option = new Option({
    name: 'foo',
    type: [ 'boolean' ],
    environment: false
  });

  test.deepEqual(option.environment, false);
});

ava.test('constructor: should store a one word environment string', (test) => {
  const option = new Option({
    name: 'foo',
    type: [ 'boolean' ],
    environment: 'FOO'
  });

  test.deepEqual(option.environment, 'FOO');
});

ava.test('constructor: should store a multi word environment string', (test) => {
  const option = new Option({
    name: 'foo',
    type: [ 'boolean' ],
    environment: 'FOO_BAR_BAZ'
  });

  test.deepEqual(option.environment, 'FOO_BAR_BAZ');
});

ava.test('constructor: should store a lowecase multi word environment string', (test) => {
  const option = new Option({
    name: 'foo',
    type: [ 'boolean' ],
    environment: 'foo_bar_baz'
  });

  test.deepEqual(option.environment, 'foo_bar_baz');
});

ava.test('isBoolean: should return true if variable is boolean', (test) => {
  const option = new Option({
    name: 'foo',
    type: [ 'boolean' ]
  });

  test.true(Option.isBoolean(option));
});

ava.test('isBoolean: should return false if variable is number', (test) => {
  const option = new Option({
    name: 'foo',
    type: [ 'number' ]
  });

  test.false(Option.isBoolean(option));
});

ava.test('isBoolean: should return false if variable is string', (test) => {
  const option = new Option({
    name: 'foo',
    type: [ 'string' ]
  });

  test.false(Option.isBoolean(option));
});

ava.test('isBoolean: should return false if variable is string and number', (test) => {
  const option = new Option({
    name: 'foo',
    type: [ 'number', 'string' ]
  });

  test.false(Option.isBoolean(option));
});

ava.test('isString: should use a custom placeholder', (test) => {
  const option = new Option({
    name: 'foo',
    placeholder: 'bar',
    optional: false,
    type: [ 'string' ]
  });

  test.is(option.toString(), '--foo <bar>');
});

ava.test('isString: should allow a hyphened option', (test) => {
  const option = new Option({
    name: 'foo-bar',
    optional: false,
    type: [ 'string' ]
  });

  test.is(option.toString(), '--foo-bar <value>');
});

ava.test('isString: should allow a hyphened alias', (test) => {
  const option = new Option({
    name: 'foo',
    aliases: [ 'bar-baz' ],
    optional: false,
    type: [ 'string' ]
  });

  test.is(option.toString(), '--foo, --bar-baz <value>');
});

_.each([
  {
    option: {
      name: 'foo',
      type: [ 'string' ],
      aliases: [],
      optional: true
    },
    expected: {
      unix: '[--foo <value>]'
    }
  },
  {
    option: {
      name: 'foo',
      type: [ 'string' ],
      aliases: [],
      optional: false
    },
    expected: {
      unix: '--foo <value>'
    }
  },

  {
    option: {
      name: 'foo',
      type: [ 'string' ],
      aliases: [ 'f' ],
      optional: true
    },
    expected: {
      unix: '[--foo, -f <value>]'
    }
  },
  {
    option: {
      name: 'foo',
      type: [ 'string' ],
      aliases: [ 'f' ],
      optional: false
    },
    expected: {
      unix: '--foo, -f <value>'
    }
  },

  {
    option: {
      name: 'foo',
      type: [ 'string' ],
      aliases: [ 'f', 'bar' ],
      optional: true
    },
    expected: {
      unix: '[--foo, -f, --bar <value>]'
    }
  },
  {
    option: {
      name: 'foo',
      type: [ 'string' ],
      aliases: [ 'f', 'bar' ],
      optional: false
    },
    expected: {
      unix: '--foo, -f, --bar <value>'
    }
  },

  {
    option: {
      name: 'foo',
      type: [ 'boolean' ],
      aliases: [],
      optional: true
    },
    expected: {
      unix: '[--foo]'
    }
  },
  {
    option: {
      name: 'foo',
      type: [ 'boolean' ],
      aliases: [],
      optional: false
    },
    expected: {
      unix: '--foo'
    }
  },

  {
    option: {
      name: 'foo',
      type: [ 'boolean' ],
      aliases: [ 'f' ],
      optional: true
    },
    expected: {
      unix: '[--foo, -f]'
    }
  },
  {
    option: {
      name: 'foo',
      type: [ 'boolean' ],
      aliases: [ 'f' ],
      optional: false
    },
    expected: {
      unix: '--foo, -f'
    }
  },

  {
    option: {
      name: 'foo',
      type: [ 'boolean' ],
      aliases: [ 'f', 'bar' ],
      optional: true
    },
    expected: {
      unix: '[--foo, -f, --bar]'
    }
  },
  {
    option: {
      name: 'foo',
      type: [ 'boolean' ],
      aliases: [ 'f', 'bar' ],
      optional: false
    },
    expected: {
      unix: '--foo, -f, --bar'
    }
  }

], (testCase) => {

  ava.test(_.join([
    'toString:',
    `should return ${testCase.expected.unix} given`,
    `optional=${testCase.option.optional}`,
    `type=${testCase.option.type}`,
    `aliases=${testCase.option.aliases.length}`
  ], ' '), (test) => {
    const option = new Option(testCase.option);
    test.is(option.toString(), testCase.expected.unix);
  });

});

_.each([
  {
    option: {
      name: 'foo',
      type: [ 'string' ],
      aliases: [],
      optional: false
    },
    values: [
      [ undefined, null ],
      [ '', null ],
      [ true, null ],
      [ false, null ],
      [ 'foo', 'foo' ],
      [ '1', '1' ],
      [ 'true', 'true' ],
      [ 'false', 'false' ]
    ]
  },
  {
    option: {
      name: 'foo',
      type: [ 'string' ],
      aliases: [],
      optional: true
    },
    values: [
      [ undefined, undefined ],
      [ '', undefined ],
      [ true, null ],
      [ false, null ],
      [ 'foo', 'foo' ],
      [ '1', '1' ],
      [ 'true', 'true' ],
      [ 'false', 'false' ]
    ]
  },
  {
    option: {
      name: 'foo',
      type: [ 'string' ],
      aliases: [],
      default: 'hello',
      optional: true
    },
    values: [
      [ undefined, 'hello' ],
      [ '', 'hello' ],
      [ true, null ],
      [ false, null ],
      [ 'foo', 'foo' ],
      [ '1', '1' ],
      [ 'true', 'true' ],
      [ 'false', 'false' ]
    ]
  },
  {
    option: {
      name: 'foo',
      type: [ 'number' ],
      aliases: [],
      optional: false
    },
    values: [
      [ undefined, null ],
      [ '', null ],
      [ true, null ],
      [ false, null ],
      [ 'foo', null ],
      [ '1', 1 ],
      [ 'true', null ],
      [ 'false', null ]
    ]
  },
  {
    option: {
      name: 'foo',
      type: [ 'number' ],
      aliases: [],
      optional: true
    },
    values: [
      [ undefined, undefined ],
      [ '', null ],
      [ true, null ],
      [ false, null ],
      [ 'foo', null ],
      [ '1', 1 ],
      [ 'true', null ],
      [ 'false', null ]
    ]
  },
  {
    option: {
      name: 'foo',
      type: [ 'number' ],
      aliases: [],
      default: 5,
      optional: true
    },
    values: [
      [ undefined, 5 ],
      [ '', null ],
      [ true, null ],
      [ false, null ],
      [ 'foo', null ],
      [ '1', 1 ],
      [ 'true', null ],
      [ 'false', null ]
    ]
  },
  {
    option: {
      name: 'foo',
      type: [ 'boolean' ],
      aliases: [],
      optional: false
    },
    values: [
      [ undefined, null ],
      [ '', null ],
      [ true, true ],
      [ false, false ],
      [ 'foo', null ],
      [ '1', null ],
      [ 'true', true ],
      [ 'false', false ]
    ]
  },
  {
    option: {
      name: 'foo',
      type: [ 'boolean' ],
      aliases: [],
      optional: true
    },
    values: [
      [ undefined, false ],
      [ '', null ],
      [ true, true ],
      [ false, false ],
      [ 'foo', null ],
      [ '1', null ],
      [ 'true', true ],
      [ 'false', false ]
    ]
  },
  {
    option: {
      name: 'foo',
      type: [ 'boolean' ],
      aliases: [],
      default: true,
      optional: true
    },
    values: [
      [ undefined, true ],
      [ '', null ],
      [ true, true ],
      [ false, false ],
      [ 'foo', null ],
      [ '1', null ],
      [ 'true', true ],
      [ 'false', false ]
    ]
  },
  {
    option: {
      name: 'foo',
      type: [ 'boolean' ],
      aliases: [],
      default: false,
      optional: true
    },
    values: [
      [ undefined, false ],
      [ '', null ],
      [ true, true ],
      [ false, false ],
      [ 'foo', null ],
      [ '1', null ],
      [ 'true', true ],
      [ 'false', false ]
    ]
  },
  {
    option: {
      name: 'foo',
      type: [ 'string', 'number' ],
      aliases: [],
      optional: false
    },
    values: [
      [ undefined, null ],
      [ '', null ],
      [ true, null ],
      [ false, null ],
      [ 'foo', 'foo' ],
      [ '1', 1 ],
      [ 'true', 'true' ],
      [ 'false', 'false' ]
    ]
  },
  {
    option: {
      name: 'foo',
      type: [ 'string', 'number' ],
      aliases: [],
      optional: true
    },
    values: [
      [ undefined, undefined ],
      [ '', undefined ],
      [ true, null ],
      [ false, null ],
      [ 'foo', 'foo' ],
      [ '1', 1 ],
      [ 'true', 'true' ],
      [ 'false', 'false' ]
    ]
  },
  {
    option: {
      name: 'foo',
      type: [ 'string', 'number' ],
      aliases: [],
      default: 'hello',
      optional: true
    },
    values: [
      [ undefined, 'hello' ],
      [ '', 'hello' ],
      [ true, null ],
      [ false, null ],
      [ 'foo', 'foo' ],
      [ '1', 1 ],
      [ 'true', 'true' ],
      [ 'false', 'false' ]
    ]
  },
  {
    option: {
      name: 'foo',
      type: [ 'string', 'number' ],
      aliases: [],
      default: 5,
      optional: true
    },
    values: [
      [ undefined, 5 ],
      [ '', 5 ],
      [ true, null ],
      [ false, null ],
      [ 'foo', 'foo' ],
      [ '1', 1 ],
      [ 'true', 'true' ],
      [ 'false', 'false' ]
    ]
  }
], (testCase) => {
  _.each(testCase.values, ([ value, expected ]) => {
    ava.test(_.join([
      'compile:',
      `should return ${expected} for ${value} given`,
      `optional=${testCase.option.optional}`,
      `type=${testCase.option.type}`
    ], ' '), (test) => {
      const option = new Option(testCase.option);
      test.is(Option.compile(option, value), expected);
    });
  });
});

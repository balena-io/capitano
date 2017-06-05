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
const tokenizer = require('../../lib/parser/tokenizer');
const matching = require('../../lib/parser/matching');
const MODES = require('../../lib/parser/modes');

ava.test('getValidCombinations: should combinate an ambiguous one word command with a leading, infix, and trailing option', (test) => {
  test.deepEqual(matching.getValidCombinations(tokenizer.tokenize([
    '-v',
    'foo',
    '-b',
    'baz',
    '-t'
  ], {
    mode: MODES.UNIX
  })), [
    {
      command: [],
      options: {
        v: 'foo',
        b: 'baz',
        t: true
      }
    },
    {
      command: [ 'baz' ],
      options: {
        v: 'foo',
        b: true,
        t: true
      }
    },
    {
      command: [ 'foo' ],
      options: {
        v: true,
        b: 'baz',
        t: true
      }
    },
    {
      command: [ 'foo', 'baz' ],
      options: {
        v: true,
        b: true,
        t: true
      }
    }
  ]);
});

ava.test('getValidCombinations: should combinate an ambiguous one word command with a leading option', (test) => {
  test.deepEqual(matching.getValidCombinations(tokenizer.tokenize([
    '--hey',
    'foo'
  ], {
    mode: MODES.UNIX
  })), [
    {
      command: [],
      options: {
        hey: 'foo'
      }
    },
    {
      command: [ 'foo' ],
      options: {
        hey: true
      }
    }
  ]);
});

ava.test('getValidCombinations: should combinate an ambiguous one word command with a trailing option', (test) => {
  test.deepEqual(matching.getValidCombinations(tokenizer.tokenize([
    'foo',
    '--hey'
  ], {
    mode: MODES.UNIX
  })), [
    {
      command: [ 'foo' ],
      options: {
        hey: true
      }
    }
  ]);
});

ava.test('getValidCombinations: should combinate an ambiguous two word command with an infix option', (test) => {
  test.deepEqual(matching.getValidCombinations(tokenizer.tokenize([
    'foo',
    '--hey',
    'bar'
  ], {
    mode: MODES.UNIX
  })), [
    {
      command: [ 'foo' ],
      options: {
        hey: 'bar'
      }
    },
    {
      command: [ 'foo', 'bar' ],
      options: {
        hey: true
      }
    }
  ]);
});

ava.test('getValidCombinations: should combinate an ambiguous two word command with a leading option', (test) => {
  test.deepEqual(matching.getValidCombinations(tokenizer.tokenize([
    '-v',
    'foo',
    'bar'
  ], {
    mode: MODES.UNIX
  })), [
    {
      command: [ 'bar' ],
      options: {
        v: 'foo'
      }
    },
    {
      command: [ 'foo', 'bar' ],
      options: {
        v: true
      }
    }
  ]);
});

ava.test('getValidCombinations: should combinate an ambiguous two word command with a leading and various trailing options', (test) => {
  test.deepEqual(matching.getValidCombinations(tokenizer.tokenize([
    '-v',
    'foo',
    'bar',
    '-a',
    '-b'
  ], {
    mode: MODES.UNIX
  })), [
    {
      command: [ 'bar' ],
      options: {
        a: true,
        b: true,
        v: 'foo'
      }
    },
    {
      command: [ 'foo', 'bar' ],
      options: {
        a: true,
        b: true,
        v: true
      }
    }
  ]);
});

ava.test('getValidCombinations: should combinate an unambiguous two word command various trailing options', (test) => {
  test.deepEqual(matching.getValidCombinations(tokenizer.tokenize([
    'foo',
    'bar',
    '-a',
    '-b'
  ], {
    mode: MODES.UNIX
  })), [
    {
      command: [ 'foo', 'bar' ],
      options: {
        a: true,
        b: true
      }
    }
  ]);
});

ava.test('getValidCombinations: should combinate an ambiguous two word command various non-boolean trailing options', (test) => {
  test.deepEqual(matching.getValidCombinations(tokenizer.tokenize([
    'foo',
    'bar',
    '-a',
    'hello',
    '-b',
    'world'
  ], {
    mode: MODES.UNIX
  })), [
    {
      command: [ 'foo', 'bar' ],
      options: {
        a: 'hello',
        b: 'world'
      }
    },
    {
      command: [ 'foo', 'bar', 'world' ],
      options: {
        a: 'hello',
        b: true
      }
    },
    {
      command: [ 'foo', 'bar', 'hello' ],
      options: {
        a: true,
        b: 'world'
      }
    },
    {
      command: [ 'foo', 'bar', 'hello', 'world' ],
      options: {
        a: true,
        b: true
      }
    }
  ]);
});

ava.test('getValidCombinations: should combinate an unambiguous two word command various boolean and non-boolean trailing options', (test) => {
  test.deepEqual(matching.getValidCombinations(tokenizer.tokenize([
    'foo',
    'bar',
    '-x',
    '-a',
    'hello',
    '-b',
    'world',
    '-z'
  ], {
    mode: MODES.UNIX
  })), [
    {
      command: [ 'foo', 'bar' ],
      options: {
        x: true,
        z: true,
        a: 'hello',
        b: 'world'
      }
    },
    {
      command: [ 'foo', 'bar', 'world' ],
      options: {
        x: true,
        z: true,
        a: 'hello',
        b: true
      }
    },
    {
      command: [ 'foo', 'bar', 'hello' ],
      options: {
        x: true,
        z: true,
        a: true,
        b: 'world'
      }
    },
    {
      command: [ 'foo', 'bar', 'hello', 'world' ],
      options: {
        x: true,
        z: true,
        a: true,
        b: true
      }
    }
  ]);
});

ava.test('getValidCombinations: should combinate an unambiguous command with two equal boolean options', (test) => {
  test.deepEqual(matching.getValidCombinations(tokenizer.tokenize([
    'foo',
    'bar',
    '-v',
    '-v'
  ], {
    mode: MODES.UNIX
  })), [
    {
      command: [ 'foo', 'bar' ],
      options: {
        v: true
      }
    }
  ]);
});

ava.test('getValidCombinations: should combinate an ambiguous command with two equal boolean options', (test) => {
  test.deepEqual(matching.getValidCombinations(tokenizer.tokenize([
    '-v',
    'foo',
    'bar',
    '-v'
  ], {
    mode: MODES.UNIX
  })), [
    {
      command: [ 'foo', 'bar' ],
      options: {
        v: true
      }
    }
  ]);
});

ava.test('getValidCombinations: should combinate an ambiguous command with three equal boolean options', (test) => {
  test.deepEqual(matching.getValidCombinations(tokenizer.tokenize([
    '-v',
    '-v',
    'foo',
    '-v',
    'bar'
  ], {
    mode: MODES.UNIX
  })), [
    {
      command: [ 'foo', 'bar' ],
      options: {
        v: true
      }
    }
  ]);
});

ava.test('getCommandFromOptionValues: should get the command of no word without options', (test) => {
  test.deepEqual(matching.getCommandFromOptionValues(tokenizer.tokenize([], {
    mode: MODES.UNIX
  }), {}), []);
});

ava.test('getCommandFromOptionValues: should get the command of no word with boolean options', (test) => {
  test.deepEqual(matching.getCommandFromOptionValues(tokenizer.tokenize([ '--foo', '-b', '-z' ], {
    mode: MODES.UNIX
  }), {
    foo: true,
    b: true,
    z: true
  }), []);
});

ava.test('getCommandFromOptionValues: should get the command of one word without options', (test) => {
  test.deepEqual(matching.getCommandFromOptionValues(tokenizer.tokenize([
    'foo'
  ], {
    mode: MODES.UNIX
  }), {}), [ 'foo' ]);
});

ava.test('getCommandFromOptionValues: should get the command of three words without options', (test) => {
  test.deepEqual(matching.getCommandFromOptionValues(tokenizer.tokenize([
    'foo',
    'bar',
    'baz'
  ], {
    mode: MODES.UNIX
  }), {}), [ 'foo', 'bar', 'baz' ]);
});

ava.test('getCommandFromOptionValues: should get the command of three words with a leading boolean option', (test) => {
  test.deepEqual(matching.getCommandFromOptionValues(tokenizer.tokenize([
    '-x',
    'foo',
    'bar',
    'baz'
  ], {
    mode: MODES.UNIX
  }), {
    x: true
  }), [ 'foo', 'bar', 'baz' ]);
});

ava.test('getCommandFromOptionValues: should get the command of three words with a leading non-boolean option', (test) => {
  test.deepEqual(matching.getCommandFromOptionValues(tokenizer.tokenize([
    '-x',
    'foo',
    'bar',
    'baz'
  ], {
    mode: MODES.UNIX
  }), {
    x: 'foo'
  }), [ 'bar', 'baz' ]);
});

ava.test('getCommandFromOptionValues: should get the command of three words with an infix boolean option', (test) => {
  test.deepEqual(matching.getCommandFromOptionValues(tokenizer.tokenize([
    'foo',
    '-x',
    'bar',
    'baz'
  ], {
    mode: MODES.UNIX
  }), {
    x: true
  }), [ 'foo', 'bar', 'baz' ]);
});

ava.test('getCommandFromOptionValues: should get the command of three words with an infix non-boolean option after the first option', (test) => {
  test.deepEqual(matching.getCommandFromOptionValues(tokenizer.tokenize([
    'foo',
    '-x',
    'bar',
    'baz'
  ], {
    mode: MODES.UNIX
  }), {
    x: 'bar'
  }), [ 'foo', 'baz' ]);
});

ava.test('getCommandFromOptionValues: should get the command of three words with an infix non-boolean option before the last option', (test) => {
  test.deepEqual(matching.getCommandFromOptionValues(tokenizer.tokenize([
    'foo',
    'bar',
    '-x',
    'baz'
  ], {
    mode: MODES.UNIX
  }), {
    x: 'baz'
  }), [ 'foo', 'bar' ]);
});

ava.test('getCommandFromOptionValues: should get the command of three words with a trailing boolean option', (test) => {
  test.deepEqual(matching.getCommandFromOptionValues(tokenizer.tokenize([
    'foo',
    'bar',
    'baz',
    '-x'
  ], {
    mode: MODES.UNIX
  }), {
    x: true
  }), [ 'foo', 'bar', 'baz' ]);
});

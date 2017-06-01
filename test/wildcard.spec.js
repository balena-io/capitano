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
const Parameter = require('../lib/parameter');
const wildcard = require('../lib/wildcard');

ava.test('getTypes: should return null if the wildcard is empty', (test) => {
  test.is(wildcard.getTypes('<>'), null);
});

ava.test('getTypes: should return null if the wildcard is variadic and contains more than 4 periods', (test) => {
  test.is(wildcard.getTypes('<string....>'), null);
});

ava.test('getTypes: should return null if the wildcard is variadic and contains more than 2 periods', (test) => {
  test.is(wildcard.getTypes('<string..>'), null);
});

ava.test('getTypes: should return null if the wildcard contains an unknown type', (test) => {
  test.is(wildcard.getTypes('<foo>'), null);
});

ava.test('parse: should return null if the wildcard is invalid', (test) => {
  test.is(wildcard.parse('hello'), null);
});

ava.test('matches: should return false if the wildcard is invalid', (test) => {
  test.false(wildcard.matches('hello', [ 'foo' ]));
});

_.each([

  // String type

  {
    parameter: {
      name: 'foo',
      type: [ 'string' ],
      optional: false,
      variadic: false
    },
    wildcard: '<string>',
    matches: [
      [ false, [] ],
      [ true, [ 'foo' ] ],
      [ false, [ 1 ] ],
      [ false, [ 'foo', 'bar' ] ],
      [ false, [ 1, 2 ] ],
      [ false, [ 1, 'foo' ] ]
    ]
  },
  {
    parameter: {
      name: 'foo',
      type: [ 'string' ],
      optional: true,
      variadic: false
    },
    wildcard: '[string]',
    matches: [
      [ true, [] ],
      [ true, [ 'foo' ] ],
      [ false, [ 1 ] ],
      [ false, [ 'foo', 'bar' ] ],
      [ false, [ 1, 2 ] ],
      [ false, [ 1, 'foo' ] ]
    ]
  },
  {
    parameter: {
      name: 'foo',
      type: [ 'string' ],
      optional: false,
      variadic: true
    },
    wildcard: '<string...>',
    matches: [
      [ false, [] ],
      [ true, [ 'foo' ] ],
      [ false, [ 1 ] ],
      [ true, [ 'foo', 'bar' ] ],
      [ false, [ 1, 2 ] ],
      [ false, [ 1, 'foo' ] ]
    ]
  },
  {
    parameter: {
      name: 'foo',
      type: [ 'string' ],
      optional: true,
      variadic: true
    },
    wildcard: '[string...]',
    matches: [
      [ true, [] ],
      [ true, [ 'foo' ] ],
      [ false, [ 1 ] ],
      [ true, [ 'foo', 'bar' ] ],
      [ false, [ 1, 2 ] ],
      [ false, [ 1, 'foo' ] ]
    ]
  },

  // Number type

  {
    parameter: {
      name: 'foo',
      type: [ 'number' ],
      optional: false,
      variadic: false
    },
    wildcard: '<number>',
    matches: [
      [ false, [] ],
      [ false, [ 'foo' ] ],
      [ true, [ 1 ] ],
      [ false, [ 'foo', 'bar' ] ],
      [ false, [ 1, 2 ] ],
      [ false, [ 1, 'foo' ] ]
    ]
  },
  {
    parameter: {
      name: 'foo',
      type: [ 'number' ],
      optional: true,
      variadic: false
    },
    wildcard: '[number]',
    matches: [
      [ true, [] ],
      [ false, [ 'foo' ] ],
      [ true, [ 1 ] ],
      [ false, [ 'foo', 'bar' ] ],
      [ false, [ 1, 2 ] ],
      [ false, [ 1, 'foo' ] ]
    ]
  },
  {
    parameter: {
      name: 'foo',
      type: [ 'number' ],
      optional: false,
      variadic: true
    },
    wildcard: '<number...>',
    matches: [
      [ false, [] ],
      [ false, [ 'foo' ] ],
      [ true, [ 1 ] ],
      [ false, [ 'foo', 'bar' ] ],
      [ true, [ 1, 2 ] ],
      [ false, [ 1, 'foo' ] ]
    ]
  },
  {
    parameter: {
      name: 'foo',
      type: [ 'number' ],
      optional: true,
      variadic: true
    },
    wildcard: '[number...]',
    matches: [
      [ true, [] ],
      [ false, [ 'foo' ] ],
      [ true, [ 1 ] ],
      [ false, [ 'foo', 'bar' ] ],
      [ true, [ 1, 2 ] ],
      [ false, [ 1, 'foo' ] ]
    ]
  },

  // String, number type

  {
    parameter: {
      name: 'foo',
      type: [ 'string', 'number' ],
      optional: false,
      variadic: false
    },
    wildcard: '<string,number>',
    matches: [
      [ false, [] ],
      [ true, [ 'foo' ] ],
      [ true, [ 1 ] ],
      [ false, [ 'foo', 'bar' ] ],
      [ false, [ 1, 2 ] ],
      [ false, [ 1, 'foo' ] ]
    ]
  },
  {
    parameter: {
      name: 'foo',
      type: [ 'string', 'number' ],
      optional: true,
      variadic: false
    },
    wildcard: '[string,number]',
    matches: [
      [ true, [] ],
      [ true, [ 'foo' ] ],
      [ true, [ 1 ] ],
      [ false, [ 'foo', 'bar' ] ],
      [ false, [ 1, 2 ] ],
      [ false, [ 1, 'foo' ] ]
    ]
  },
  {
    parameter: {
      name: 'foo',
      type: [ 'string', 'number' ],
      optional: false,
      variadic: true
    },
    wildcard: '<string,number...>',
    matches: [
      [ false, [] ],
      [ true, [ 'foo' ] ],
      [ true, [ 1 ] ],
      [ true, [ 'foo', 'bar' ] ],
      [ true, [ 1, 2 ] ],
      [ true, [ 1, 'foo' ] ]
    ]
  },
  {
    parameter: {
      name: 'foo',
      type: [ 'string', 'number' ],
      optional: true,
      variadic: true
    },
    wildcard: '[string,number...]',
    matches: [
      [ true, [] ],
      [ true, [ 'foo' ] ],
      [ true, [ 1 ] ],
      [ true, [ 'foo', 'bar' ] ],
      [ true, [ 1, 2 ] ],
      [ true, [ 1, 'foo' ] ]
    ]
  }

], (testCase) => {
  const parameter = new Parameter(testCase.parameter);
  const wildcardString = wildcard.fromParameter(parameter);

  ava.test(_.join([
    `fromParameter: should return ${testCase.wildcard} if`,
    `type=${parameter.type},`,
    `variadic=${parameter.variadic},`,
    `optional=${parameter.optional},`
  ], ' '), (test) => {
    test.is(wildcardString, testCase.wildcard);
  });

  ava.test(`getTypes: should return ${parameter.type} for ${wildcardString}`, (test) => {
    test.deepEqual(wildcard.getTypes(wildcardString), parameter.type);
  });

  ava.test(`parse: should parse ${wildcardString}`, (test) => {
    test.deepEqual(wildcard.parse(wildcardString), {
      type: parameter.type,
      optional: parameter.optional,
      variadic: parameter.variadic
    });
  });

  _.each(testCase.matches, (match) => {
    const [ expected, words ] = match;

    ava.test(_.join([
      `matches: should return ${expected} if`,
      `type=${parameter.type},`,
      `variadic=${parameter.variadic},`,
      `optional=${parameter.optional},`,
      `words=${words},`
    ], ' '), (test) => {
      test.is(wildcard.matches(wildcardString, words), expected);
    });

  });
});

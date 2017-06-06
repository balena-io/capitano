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
const middleware = require('../lib/middleware');

ava.test('execute: should resolve nothing if passed an empty array', (test) => {
  return middleware.execute([ {}, {}, {} ], []).then((result) => {
    test.is(result, undefined);
  });
});

ava.test('execute: should resolve the result of the last promise', (test) => {
  return middleware.execute([
    { foo: 1 },
    { bar: 2 },
    { baz: 3 }
  ], [
    (params) => {
      return params.foo + 1;
    },
    (params) => {
      return params.foo + 2;
    },
    (params, options, context) => {
      return params.foo + context.baz;
    }
  ]).then((result) => {
    test.is(result, 4);
  });
});

ava.test('execute: should have access to the params, options, and context at every step', (test) => {
  const data = {
    params: { foo: 1 },
    options: { bar: 2 },
    context: { baz: 3 }
  };

  const steps = {
    one: {},
    two: {},
    three: {}
  };

  return middleware.execute([ data.params, data.options, data.context ], [
    (params, options, context) => {
      steps.one.params = params;
      steps.one.options = options;
      steps.one.context = context;
    },
    (params, options, context) => {
      steps.two.params = params;
      steps.two.options = options;
      steps.two.context = context;
    },
    (params, options, context) => {
      steps.three.params = params;
      steps.three.options = options;
      steps.three.context = context;
    }
  ]).then(() => {
    test.deepEqual(steps.one, data);
    test.deepEqual(steps.two, data);
    test.deepEqual(steps.three, data);
  });
});

ava.test('execute: should execute all steps in order', (test) => {
  const log = [];

  return middleware.execute([ {}, {}, {} ], [
    () => {
      log.push(1);
    },
    () => {
      log.push(2);
    },
    () => {
      log.push(3);
    },
    () => {
      log.push(4);
    },
    () => {
      log.push(5);
    }
  ]).then(() => {
    test.deepEqual(log, [ 1, 2, 3, 4, 5 ]);
  });
});

ava.test('execute: should stop the chain by an error at the head of the chain', (test) => {
  const log = [];

  return middleware.execute([ {}, {}, {} ], [
    () => {
      throw new Error('middleware error');
    },
    () => {
      log.push(2);
    },
    () => {
      log.push(3);
    },
    () => {
      log.push(4);
    },
    () => {
      log.push(5);
    }
  ]).catch((error) => {
    test.true(_.isError(error));
    test.is(error.message, 'middleware error');
    test.deepEqual(log, []);
  });
});

ava.test('execute: should stop the chain by an error at the middle of the chain', (test) => {
  const log = [];

  return middleware.execute([ {}, {}, {} ], [
    () => {
      log.push(1);
    },
    () => {
      log.push(2);
    },
    () => {
      throw new Error('middleware error');
    },
    () => {
      log.push(4);
    },
    () => {
      log.push(5);
    }
  ]).catch((error) => {
    test.true(_.isError(error));
    test.is(error.message, 'middleware error');
    test.deepEqual(log, [ 1, 2 ]);
  });
});

ava.test('execute: should stop the chain by an error at the tail of the chain', (test) => {
  const log = [];

  return middleware.execute([ {}, {}, {} ], [
    () => {
      log.push(1);
    },
    () => {
      log.push(2);
    },
    () => {
      log.push(3);
    },
    () => {
      log.push(4);
    },
    () => {
      throw new Error('middleware error');
    }
  ]).catch((error) => {
    test.true(_.isError(error));
    test.is(error.message, 'middleware error');
    test.deepEqual(log, [ 1, 2, 3, 4 ]);
  });
});

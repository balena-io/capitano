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

const _ = require('lodash');

/**
 * @summary Capitano parsing modes
 * @namespace MODES
 * @public
 */
module.exports = {

  /**
   * @property {Object} UNIX
   * @memberof MODES
   *
   * @description
   * In this parsing mode, short options are `-f` and long options are `--foo`.
   */
  UNIX: {
    optionShort: /^-([a-zA-Z0-9])$/,
    optionLong: /^--([a-zA-Z0-9][a-zA-Z0-9-]+)$/,
    endOfParameterSymbol: '--',
    optionToString: (name, options = {}) => {
      const SHORT_OPTION_MAXIMUM_LENGTH = 1;

      if (_.size(name) > SHORT_OPTION_MAXIMUM_LENGTH) {
        return options.inverse ? `--[no-]${name}` : `--${name}`;
      }

      return options.inverse ? `-[-no-]${name}` : `-${name}`;
    }
  }

};

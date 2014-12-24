var Parameter, REGEX_MULTIWORD, REGEX_OPTIONAL, REGEX_REQUIRED, REGEX_VARIADIC, parse, _;

_ = require('lodash');

_.str = require('underscore.string');

parse = require('./parse');

REGEX_REQUIRED = /^<(.*)>$/;

REGEX_OPTIONAL = /^\[(.*)\]$/;

REGEX_VARIADIC = /^[<\[](.*)[\.]{3}[>\]]$/;

REGEX_MULTIWORD = /\s/;

module.exports = Parameter = (function() {
  function Parameter(parameter) {
    if (_.isNumber(parameter)) {
      parameter = String(parameter);
    }
    if ((parameter == null) || !_.isString(parameter)) {
      throw new Error("Missing or invalid parameter: " + parameter);
    }
    this.parameter = parameter;
  }

  Parameter.prototype._testRegex = function(regex) {
    return regex.test(this.parameter);
  };

  Parameter.prototype.isRequired = function() {
    return this._testRegex(REGEX_REQUIRED);
  };

  Parameter.prototype.isOptional = function() {
    return this._testRegex(REGEX_OPTIONAL);
  };

  Parameter.prototype.isVariadic = function() {
    return this._testRegex(REGEX_VARIADIC);
  };

  Parameter.prototype.isWord = function() {
    return !_.any([this.isRequired(), this.isOptional()]);
  };

  Parameter.prototype.isMultiWord = function() {
    return this._testRegex(REGEX_MULTIWORD);
  };

  Parameter.prototype.getValue = function() {
    var regex, result;
    if (this.isWord()) {
      return this.parameter;
    }
    if (this.isRequired()) {
      regex = REGEX_REQUIRED;
    }
    if (this.isOptional()) {
      regex = REGEX_OPTIONAL;
    }
    if (this.isVariadic()) {
      regex = REGEX_VARIADIC;
    }
    result = this.parameter.match(regex);
    return result[1];
  };

  Parameter.prototype.getType = function() {
    if (this.isWord()) {
      return 'word';
    }
    return 'parameter';
  };

  Parameter.prototype.matches = function(parameter) {
    var parameterWordsLength;
    if (this.isWord()) {
      return parameter === this.parameter;
    }
    parameterWordsLength = parse.split(parameter).length;
    if (this.isVariadic()) {
      if (this.isOptional()) {
        return true;
      }
      if (parameterWordsLength < 1) {
        return false;
      }
    } else {
      if (this.isRequired()) {
        if (parameterWordsLength < 1) {
          return false;
        }
      }
    }
    return true;
  };

  Parameter.prototype.toString = function() {
    if (this.isMultiWord() && this.isWord()) {
      return _.str.quote(this.parameter);
    }
    return this.parameter;
  };

  return Parameter;

})();

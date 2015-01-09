var Parameter, Signature, parse, settings, _;

_ = require('lodash');

_.str = require('underscore.string');

Parameter = require('./parameter');

settings = require('./settings');

parse = require('./parse');

module.exports = Signature = (function() {
  function Signature(signature) {
    var index, variadicParameters;
    if ((signature == null) || !_.isString(signature)) {
      throw new Error('Missing or invalid signature');
    }
    this.parameters = [];
    _.each(parse.split(signature), this._addParameter, this);
    if (this.hasVariadicParameters()) {
      variadicParameters = _.filter(this.parameters, function(parameter) {
        return parameter.isVariadic();
      });
      if (variadicParameters.length > 1) {
        throw new Error('Signature can only contain one variadic parameter');
      }
      index = _.findIndex(this.parameters, function(parameter) {
        return parameter.isVariadic();
      });
      if (index !== this.parameters.length - 1) {
        throw new Error('The variadic parameter should be the last');
      }
    }
  }

  Signature.prototype._addParameter = function(word) {
    var parameter;
    parameter = new Parameter(word);
    return this.parameters.push(parameter);
  };

  Signature.prototype.hasParameters = function() {
    return _.any(this.parameters, function(parameter) {
      return !parameter.isWord();
    });
  };

  Signature.prototype.hasVariadicParameters = function() {
    return _.any(this.parameters, function(parameter) {
      return parameter.isVariadic();
    });
  };

  Signature.prototype.toString = function() {
    var parameter, result, _i, _len, _ref;
    result = [];
    _ref = this.parameters;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      parameter = _ref[_i];
      result.push(parameter.toString());
    }
    return result.join(' ');
  };

  Signature.prototype.isWildcard = function() {
    return _.all([this.parameters.length === 1, this.parameters[0].toString() === settings.signatures.wildcard]);
  };

  Signature.prototype.matches = function(command) {
    var error;
    try {
      this.compileParameters(command);
      return true;
    } catch (_error) {
      error = _error;
      if (_.str.startsWith(error.message, 'Missing')) {
        return true;
      }
      return false;
    }
  };

  Signature.prototype.compileParameters = function(command) {
    var commandWords, comparison, item, parameter, parameterIndex, parameterValue, result, value, word, _i, _len;
    commandWords = parse.split(command);
    comparison = _.zip(this.parameters, commandWords);
    result = {};
    if (this.isWildcard()) {
      return result;
    }
    for (_i = 0, _len = comparison.length; _i < _len; _i++) {
      item = comparison[_i];
      parameter = item[0];
      word = item[1];
      if (parameter == null) {
        throw new Error('Signature dismatch');
      }
      parameterValue = parameter.getValue();
      if (!parameter.matches(word)) {
        if (parameter.isRequired()) {
          throw new Error("Missing " + parameterValue);
        }
        throw new Error("" + parameterValue + " does not match " + word);
      }
      if (parameter.isVariadic()) {
        parameterIndex = _.indexOf(this.parameters, parameter);
        value = _.rest(commandWords, parameterIndex).join(' ');
        if (parameter.isOptional() && _.isEmpty(value)) {
          return result;
        }
        result[parameterValue] = value;
        return result;
      }
      if (!parameter.isWord() && (word != null)) {
        if (/^\d+$/.test(word)) {
          result[parameterValue] = _.parseInt(word);
        } else {
          result[parameterValue] = word;
        }
      }
    }
    return result;
  };

  return Signature;

})();

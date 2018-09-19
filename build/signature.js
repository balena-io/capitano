var Parameter, Signature, _, appearedMoreThanOnce, async, isLastOne, parse, settings, utils;

_ = require('lodash');

async = require('async');

Parameter = require('./parameter');

settings = require('./settings');

parse = require('./parse');

utils = require('./utils');

isLastOne = function(parameters, predicate) {
  var lastParameter;
  lastParameter = _.last(parameters);
  return predicate(lastParameter);
};

appearedMoreThanOnce = function(parameters, predicate) {
  var filteredParameters;
  filteredParameters = _.filter(parameters, predicate);
  return filteredParameters.length > 1;
};

module.exports = Signature = (function() {
  function Signature(signature) {
    var isStdin, isVariadic;
    if ((signature == null) || !_.isString(signature)) {
      throw new Error('Missing or invalid signature');
    }
    this.parameters = [];
    _.forEach(parse.split(signature), (function(_this) {
      return function(word) {
        return _this._addParameter(word);
      };
    })(this));
    if (this.allowsStdin()) {
      isStdin = function(parameter) {
        return parameter.allowsStdin();
      };
      if (appearedMoreThanOnce(this.parameters, isStdin)) {
        throw new Error('Signature can only contain one stdin parameter');
      }
      if (!isLastOne(this.parameters, isStdin)) {
        throw new Error('The stdin parameter should be the last one');
      }
    }
    if (this.hasVariadicParameters()) {
      isVariadic = function(parameter) {
        return parameter.isVariadic();
      };
      if (appearedMoreThanOnce(this.parameters, isVariadic)) {
        throw new Error('Signature can only contain one variadic parameter');
      }
      if (!isLastOne(this.parameters, isVariadic)) {
        throw new Error('The variadic parameter should be the last one');
      }
    }
  }

  Signature.prototype._addParameter = function(word) {
    var parameter;
    parameter = new Parameter(word);
    return this.parameters.push(parameter);
  };

  Signature.prototype.hasParameters = function() {
    return _.some(this.parameters, function(parameter) {
      return !parameter.isWord();
    });
  };

  Signature.prototype.hasVariadicParameters = function() {
    return _.some(this.parameters, function(parameter) {
      return parameter.isVariadic();
    });
  };

  Signature.prototype.allowsStdin = function() {
    return _.some(this.parameters, function(parameter) {
      return parameter.allowsStdin();
    });
  };

  Signature.prototype.toString = function() {
    var i, len, parameter, ref, result;
    result = [];
    ref = this.parameters;
    for (i = 0, len = ref.length; i < len; i++) {
      parameter = ref[i];
      result.push(parameter.toString());
    }
    return result.join(' ');
  };

  Signature.prototype.isWildcard = function() {
    return _.every([this.parameters.length === 1, this.parameters[0].toString() === settings.signatures.wildcard]);
  };

  Signature.prototype.matches = function(command, callback) {
    return this.compileParameters(command, function(error) {
      if (error == null) {
        return callback(true);
      }
      if (_.startsWith(error.message, 'Missing')) {
        return callback(true);
      }
      return callback(false);
    }, false);
  };

  Signature.prototype.compileParameters = function(command, callback, performStdin) {
    var commandWords, comparison, result;
    if (performStdin == null) {
      performStdin = true;
    }
    commandWords = parse.split(command);
    comparison = _.zip(this.parameters, commandWords);
    result = {};
    if (this.isWildcard()) {
      return callback(null, result);
    }
    return async.eachSeries(comparison, (function(_this) {
      return function(item, done) {
        var parameter, parameterIndex, parameterValue, value, word;
        parameter = item[0];
        word = item[1];
        if (parameter == null) {
          return callback(new Error('Signature dismatch'));
        }
        parameterValue = parameter.getValue();
        if (parameter.allowsStdin() && (word == null)) {
          if (!performStdin) {
            return callback(null, result);
          }
          return utils.getStdin(function(stdin) {
            if (parameter.isRequired() && (stdin == null)) {
              return callback(new Error("Missing " + parameterValue));
            }
            if (stdin != null) {
              result[parameterValue] = stdin;
            }
            return callback(null, result);
          });
        }
        if (!parameter.matches(word)) {
          if (parameter.isRequired()) {
            return callback(new Error("Missing " + parameterValue));
          }
          return callback(new Error(parameterValue + " does not match " + word));
        }
        if (parameter.isVariadic()) {
          parameterIndex = _.indexOf(_this.parameters, parameter);
          value = _.slice(commandWords, parameterIndex).join(' ');
          if (parameter.isOptional() && _.isEmpty(value)) {
            return callback(null, result);
          }
          result[parameterValue] = value;
          return callback(null, result);
        }
        if (!parameter.isWord() && (word != null)) {
          if (/^\d+$/.test(word)) {
            result[parameterValue] = _.parseInt(word);
          } else {
            result[parameterValue] = word;
          }
        }
        return done();
      };
    })(this), function(error) {
      if (error != null) {
        return callback(error);
      }
      return callback(null, result);
    });
  };

  return Signature;

})();

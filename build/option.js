var Option, Signature, isValidAlias, parse, _;

_ = require('lodash');

parse = require('./parse');

Signature = require('./signature');

isValidAlias = function(alias) {
  return _.isString(alias) || _.isArray(alias);
};

module.exports = Option = (function() {
  function Option(options) {
    if (options == null) {
      options = {};
    }
    if (!(options.signature instanceof Signature)) {
      throw new Error('Missing or invalid option signature');
    }
    if (options.signature.hasParameters()) {
      throw new Error('Use the parameter option attribute');
    }
    if ((options.alias != null) && !isValidAlias(options.alias)) {
      throw new Error('Invalid alias');
    }
    if ((options.parameter != null) && !_.isString(options.parameter)) {
      throw new Error('Invalid parameter');
    }
    if (options.boolean && (options.parameter != null)) {
      throw new Error('Boolean options can\'t have parameters');
    }
    if (!options.boolean && (options.parameter == null)) {
      throw new Error('Missing parameter');
    }
    _.defaults(options, {
      boolean: false
    });
    _.extend(this, options);
  }

  Option.prototype.getOptionsValue = function(options) {
    var value;
    value = options[this.signature];
    if (value == null) {
      value = _.chain(options).pick(this.alias).values().first().value();
    }
    return value;
  };

  Option.prototype.matches = function(value) {
    if (value == null) {
      return false;
    }
    return !_.any([this.boolean && !_.isBoolean(value), !this.boolean && _.isBoolean(value)]);
  };

  return Option;

})();

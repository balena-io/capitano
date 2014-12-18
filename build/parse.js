var minimist, settings, state, _;

_ = require('lodash');

_.str = require('underscore.string');

minimist = require('minimist');

settings = require('./settings');

state = require('./state');

exports.normalizeInput = function(argv) {
  if (argv === process.argv) {
    argv = argv.slice(2);
  }
  if (_.isArray(argv)) {
    return argv;
  }
  if (_.isString(argv)) {
    return exports.split(argv);
  }
  throw new Error('Invalid argument list');
};

exports.parse = function(argv) {
  var options, output, result;
  argv = exports.normalizeInput(argv);
  output = minimist(argv);
  options = _.omit(output, '_');
  result = {};
  result.options = options;
  result.global = exports.parseOptions(state.globalOptions, options);
  if (!_.isEmpty(output._)) {
    result.command = output._.join(' ');
  }
  return result;
};

exports.split = function(string) {
  if (string == null) {
    return [];
  }
  return string.match(/[\w-\*]+|[<\[][^<\[]+[>\]]/g) || [];
};

exports.parseOptions = function(definedOptions, options) {
  var definedOption, result, signature, value, _i, _len;
  if (options == null) {
    options = {};
  }
  result = {};
  for (_i = 0, _len = definedOptions.length; _i < _len; _i++) {
    definedOption = definedOptions[_i];
    signature = definedOption.signature;
    value = definedOption.getOptionsValue(options);
    if (!definedOption.matches(value)) {
      continue;
    }
    result[signature] = _.parseInt(value) || value;
  }
  return result;
};

var Parameter, minimist, path, settings, state, _;

path = require('path');

_ = require('lodash');

_.str = require('underscore.string');

minimist = require('minimist');

settings = require('./settings');

state = require('./state');

Parameter = require('./parameter');

exports.parseArgv = function(argv, filename) {
  var index;
  if (filename == null) {
    filename = __filename;
  }
  index = _.indexOf(argv, filename);
  if (index === -1) {
    index = _.indexOf(argv, path.basename(filename));
  }
  if (index !== -1) {
    argv = argv.slice(index + 1);
  }
  return argv;
};

exports.normalizeInput = function(argv, filename) {
  argv = exports.parseArgv(argv, filename);
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
    output._ = _.map(output._, function(word) {
      var wordParameter;
      wordParameter = new Parameter(word);
      return wordParameter.toString();
    });
    result.command = output._.join(' ');
  }
  return result;
};

exports.split = function(string) {
  var pair, regex, result;
  if (string == null) {
    return [];
  }
  regex = '';
  pair = function(_arg) {
    var end, start;
    start = _arg[0], end = _arg[1];
    start = '\\' + start;
    end = '\\' + end;
    return regex += "" + start + "[^" + end + "]+" + end + "|";
  };
  pair('[]');
  pair('<>');
  pair('""');
  pair("''");
  regex += '\\S+';
  result = string.match(new RegExp(regex, 'g')) || [];
  return _.map(result, function(word) {
    word = _.str.unquote(word, '\'');
    word = _.str.unquote(word, '"');
    return word;
  });
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

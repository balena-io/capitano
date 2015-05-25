var Parameter, _, minimist, settings, state;

_ = require('lodash');

_.str = require('underscore.string');

minimist = require('minimist');

settings = require('./settings');

state = require('./state');

Parameter = require('./parameter');

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
  pair = function(arg) {
    var end, start;
    start = arg[0], end = arg[1];
    start = '\\' + start;
    end = '\\' + end;
    return regex += start + "[^" + end + "]+" + end + "|";
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
  var definedOption, i, len, result, signature, value;
  if (options == null) {
    options = {};
  }
  result = {};
  for (i = 0, len = definedOptions.length; i < len; i++) {
    definedOption = definedOptions[i];
    signature = definedOption.signature;
    value = definedOption.getOptionsValue(options);
    if ((definedOption.required != null) && (value == null)) {
      if (_.isString(definedOption.required)) {
        throw new Error(definedOption.required);
      } else if (definedOption.required) {
        throw new Error("Option " + definedOption.signature + " is required");
      }
    }
    if (!definedOption.matches(value)) {
      continue;
    }
    result[signature] = _.parseInt(value) || value;
  }
  return result;
};

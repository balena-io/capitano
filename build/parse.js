var Parameter, _, settings, state, yargsParser;

_ = require('lodash');

_.str = require('underscore.string');

yargsParser = require('yargs-parser');

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
  output = yargsParser(argv, {
    configuration: {
      'parse-numbers': false
    }
  });
  options = _.omit(output, '_');
  result = {};
  result.options = _.mapValues(options, function(value) {
    if (/^\d+$/.test(value)) {
      return parseInt(value);
    }
    if (/^\d*\.\d+?$/.test(value)) {
      return parseFloat(value);
    }
    return value;
  });
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
    var end, middle, start;
    start = arg[0], end = arg[1];
    start = '\\' + start;
    end = '\\' + end;
    middle = '\\\\' + end;
    return regex += start + "(?:[^" + middle + "]|\\\\.)*" + end + "|";
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
    if (/^\d+$/.test(value)) {
      value = _.parseInt(value);
    }
    result[signature] = value;
  }
  return result;
};

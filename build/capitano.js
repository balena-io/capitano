var Command, Option, Signature, _;

_ = require('lodash');

Command = require('./command');

Option = require('./option');

Signature = require('./signature');

exports.parse = require('./parse').parse;

exports.state = require('./state');

exports.defaults = require('./settings');

exports.command = function(options) {
  var command;
  options.options = _.map(options.options, function(option) {
    var result;
    result = _.clone(option);
    result.signature = new Signature(option.signature);
    return new Option(result);
  });
  options.signature = new Signature(options.signature);
  command = new Command(options);
  return exports.state.commands.push(command);
};

exports.globalOption = function(options) {
  var option;
  options.signature = new Signature(options.signature);
  option = new Option(options);
  return exports.state.globalOptions.push(option);
};

exports.permission = function(name, permissionFunction) {
  if (name == null) {
    throw new Error('Missing permission name');
  }
  if (!_.isString(name)) {
    throw new Error('Invalid permission name');
  }
  if (permissionFunction == null) {
    throw new Error('Missing permission function');
  }
  if (!_.isFunction(permissionFunction)) {
    throw new Error('Invalid permission function');
  }
  return exports.state.permissions[name] = permissionFunction;
};

exports.execute = function(args, callback) {
  var command, error;
  command = exports.state.getMatchCommand(args.command);
  if (command == null) {
    return exports.defaults.actions.commandNotFound(args.command);
  }
  try {
    return command.execute(args, callback);
  } catch (_error) {
    error = _error;
    return typeof callback === "function" ? callback(error) : void 0;
  }
};

exports.run = function(argv, callback) {
  var parsedArgs;
  parsedArgs = exports.parse(argv);
  return exports.execute(parsedArgs, callback);
};

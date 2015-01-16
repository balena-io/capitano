var settings, _;

_ = require('lodash');

settings = require('./settings');

exports.commands = [];

exports.globalOptions = [];

exports.permissions = {};

exports.findCommandBySignature = function(signature) {
  return _.findWhere(exports.commands, function(command) {
    return command.signature.toString() === signature;
  });
};

exports.getMatchCommand = function(signature) {
  var command, wildcardSignature, _i, _len, _ref;
  _ref = exports.commands;
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    command = _ref[_i];
    if (command.isWildcard()) {
      continue;
    }
    if (command.signature.matches(signature)) {
      return command;
    }
  }
  wildcardSignature = settings.signatures.wildcard;
  return exports.findCommandBySignature(wildcardSignature);
};

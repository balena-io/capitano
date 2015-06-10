var _, async, settings;

_ = require('lodash');

async = require('async');

settings = require('./settings');

exports.commands = [];

exports.globalOptions = [];

exports.permissions = {};

exports.findCommandBySignature = function(signature) {
  return _.find(exports.commands, function(command) {
    return command.signature.toString() === signature;
  });
};

exports.getMatchCommand = function(signature, callback) {
  var commands;
  commands = _.reject(exports.commands, function(command) {
    return command.isWildcard();
  });
  return async.eachSeries(commands, function(command, done) {
    return command.signature.matches(signature, function(result) {
      if (!result) {
        return done();
      }
      return callback(null, command);
    });
  }, function(error) {
    var result, wildcardSignature;
    if (error != null) {
      return callback(error);
    }
    wildcardSignature = settings.signatures.wildcard;
    result = exports.findCommandBySignature(wildcardSignature);
    return callback(null, result);
  });
};

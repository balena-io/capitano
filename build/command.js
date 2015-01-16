var Command, Option, Signature, parse, settings, state, _;

_ = require('lodash');

_.str = require('underscore.string');

parse = require('./parse');

settings = require('./settings');

state = require('./state');

Option = require('./option');

Signature = require('./signature');

module.exports = Command = (function() {
  function Command(options) {
    if (options == null) {
      options = {};
    }
    if (!(options.signature instanceof Signature)) {
      throw new Error('Missing or invalid command signature');
    }
    if (!_.isFunction(options.action)) {
      throw new Error('Missing or invalid command action');
    }
    if ((options.options != null) && !_.isArray(options.options)) {
      throw new Error('Invalid options');
    }
    this.options = [];
    _.each(options.options, this.option, this);
    _.extend(this, _.omit(options, 'options'));
  }

  Command.prototype.applyPermissions = function(callback) {
    var error, permissionFunction;
    if (this.permission == null) {
      return callback();
    }
    permissionFunction = state.permissions[this.permission];
    if (permissionFunction == null) {
      error = new Error("Permission not found: " + this.permission);
      return callback(error);
    }
    return permissionFunction.call(this, callback);
  };

  Command.prototype._parseOptions = function(options) {
    var allOptions, parsedOptions;
    allOptions = _.union(state.globalOptions, this.options);
    return parsedOptions = parse.parseOptions(allOptions, options);
  };

  Command.prototype.execute = function(args, callback) {
    var params, parsedOptions;
    if (args == null) {
      args = {};
    }
    params = this.signature.compileParameters(args.command);
    parsedOptions = this._parseOptions(args.options);
    return this.applyPermissions((function(_this) {
      return function(error) {
        if (error != null) {
          return typeof callback === "function" ? callback(error) : void 0;
        }
        _this.action(params, parsedOptions, callback);
        if (_this.action.length < 3) {
          return typeof callback === "function" ? callback() : void 0;
        }
      };
    })(this));
  };

  Command.prototype.option = function(option) {
    if (!(option instanceof Option)) {
      throw new Error('Invalid option');
    }
    if (_.find(this.options, option) != null) {
      return;
    }
    return this.options.push(option);
  };

  Command.prototype.isWildcard = function() {
    return this.signature.isWildcard();
  };

  return Command;

})();

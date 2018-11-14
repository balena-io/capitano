var Command, Option, Signature, _, parse, settings, state, utils;

_ = require('lodash');

parse = require('./parse');

settings = require('./settings');

state = require('./state');

Option = require('./option');

Signature = require('./signature');

utils = require('./utils');

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
    _.forEach(options.options, (function(_this) {
      return function(option) {
        return _this.option(option);
      };
    })(this));
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

  Command.prototype._checkElevation = function(callback) {
    if (this.root != null) {
      return utils.isElevated(callback);
    } else {
      return callback(null, true);
    }
  };

  Command.prototype.execute = function(args, callback) {
    if (args == null) {
      args = {};
    }
    return this.signature.compileParameters(args.command, (function(_this) {
      return function(error, params) {
        if (error != null) {
          return typeof callback === "function" ? callback(error) : void 0;
        }
        return _this._checkElevation(function(error, isElevated) {
          var parsedOptions;
          if (error != null) {
            return typeof callback === "function" ? callback(error) : void 0;
          }
          if (_this.root && !isElevated) {
            error = new Error('You need admin privileges to run this command');
            error.code = 'EACCES';
            return callback(error);
          }
          try {
            parsedOptions = _this._parseOptions(args.options);
          } catch (error1) {
            error = error1;
            return typeof callback === "function" ? callback(error) : void 0;
          }
          return _this.applyPermissions(function(error) {
            var actionPromise;
            if (error != null) {
              return typeof callback === "function" ? callback(error) : void 0;
            }
            try {
              actionPromise = _this.action(params, parsedOptions, callback);
            } catch (error1) {
              error = error1;
              return typeof callback === "function" ? callback(error) : void 0;
            }
            if (callback != null) {
              if ((actionPromise != null ? actionPromise.then : void 0) != null) {
                return actionPromise.then(function(_value) {
                  if (_this.action.length < 3) {
                    return callback();
                  }
                }, callback);
              } else {
                if (_this.action.length < 3) {
                  return callback();
                }
              }
            }
          });
        });
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

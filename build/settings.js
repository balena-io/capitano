module.exports = {
  signatures: {
    wildcard: '*'
  },
  actions: {
    commandNotFound: function(command) {
      if (command != null) {
        console.error("Command not found: " + command);
      }
      return process.exit(1);
    }
  }
};

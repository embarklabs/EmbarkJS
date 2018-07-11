let Names = {};

Names.Providers = {};

Names.registerProvider = function (providerName, obj) {
  Names.Providers[providerName] = obj;
};

Names.setProvider = function (provider, options) {
  let providerObj = this.Providers[provider];

  if (!providerObj) {
    throw new Error('Unknown name system provider');
  }

  this.currentNameSystems = providerObj;

  return providerObj.setProvider(options);
};

// resolve resolves a name into an identifier of some kind
Names.resolve = function (name) {
  if (!this.currentNameSystems) {
    throw new Error('Name system provider not set; e.g EmbarkJS.Names.setProvider("ens")');
  }
  return this.currentNameSystems.resolve(name);
};

// the reverse of resolve, resolves using an identifier to get to a name
Names.lookup = function (identifier) {
  if (!this.currentNameSystems) {
    throw new Error('Name system provider not set; e.g EmbarkJS.Names.setProvider("ens")');
  }
  return this.currentNameSystems.lookup(identifier);
};

// register a name
Names.register = function(name, options) {
  if (!this.currentNameSystems) {
    throw new Error('Name system provider not set; e.g EmbarkJS.Names.setProvider("ens")');
  }
  return this.currentNameSystems.register(name, options);
};

export default Names;

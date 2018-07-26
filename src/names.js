let Names = {};

Names.Providers = {};
Names.noProviderError = 'Name system provider not set; e.g EmbarkJS.Names.setProvider("ens")';

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
    throw new Error(this.noProviderError);
  }
  return this.currentNameSystems.resolve(name);
};

// the reverse of resolve, resolves using an identifier to get to a name
Names.lookup = function (identifier) {
  if (!this.currentNameSystems) {
    throw new Error(this.noProviderError);
  }
  return this.currentNameSystems.lookup(identifier);
};

Names.isAvailable = function () {
    return this.currentNameSystems.isAvailable();
};

Names.registerSubDomain = function(name, address, callback) {
  if (!this.currentNameSystems) {
    throw new Error(this.noProviderError);
  }
  return this.currentNameSystems.registerSubDomain(name, address, callback);
};

export default Names;

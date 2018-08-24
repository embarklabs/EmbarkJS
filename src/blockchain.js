import {reduce} from 'async'

function isNewWeb3_1() {
  return (typeof(web3.version) === "string");
};

function getAccounts(cb) {
  if (isNewWeb3_1()) {
    return web3.eth.getAccounts().then(function(accounts) {
      return cb(null, accounts);
    }).catch(function(err) {
      return cb(err);
    });
  }
  web3.eth.getAccounts(cb);
};

let Blockchain = {};

Blockchain.connect = function(connectionList, opts, doneCb) {
  const self = this;
  this.web3 = null;
  this.doFirst(function(cb) {
    reduce(connectionList, '', function(prev, value, next) {
      if (prev === false) {
        return next(null, false);
      }

      if (value === '$WEB3' && (typeof web3 !== 'undefined' && typeof Web3 !== 'undefined')) {
        web3.setProvider(web3.givenProvider);
      } else if (value !== '$WEB3' && (typeof Web3 !== 'undefined' && ((typeof web3 === 'undefined') || (typeof web3 !== 'undefined' && (!web3.isConnected || (web3.isConnected && !web3.isConnected())))))) {
        if (value.indexOf('ws://') >= 0) {
          web3.setProvider(new Web3.providers.WebsocketProvider(value));
        } else {
          web3.setProvider(new Web3.providers.HttpProvider(value));
        }
      } else if (value === '$WEB3') {
        return next(null, '');
      }

      getAccounts(function(err, account) {
        return next(null, !!err)
      });
    }, function(err, _result) {
      self.web3 = web3;
      getAccounts(function(err, accounts) {
        if (opts.warnAboutMetamask) {
          if (web3.eth.currentProvider && web3.eth.currentProvider.isMetaMask) {
            console.warn("%cNote: Embark has detected you are in the development environment and using Metamask, please make sure Metamask is connected to your local node", "font-size: 2em");
          }
        }
        if (accounts) {
          web3.eth.defaultAccount = accounts[0];
        }
        cb();
        doneCb(err);
      });
    });
  })
}

Blockchain.execWhenReady = function(cb) {
  if (this.done) {
    return cb(this.err);
  }
  if (!this.list) {
    this.list = [];
  }
  this.list.push(cb)
}

Blockchain.doFirst = function(todo) {
  var self = this;
  todo(function(err) {
    self.done = true;
    self.err = err;
    if (self.list) {
      self.list.map((x) => x.apply(x, [self.err]));
    }
    if (self.finalCb) {
      self.finalCb.apply(self.finalCb, []);
    }
  })
}

let Contract = function (options) {
  var self = this;
  var i, abiElement;
  var ContractClass;

  this.abi = options.abi;
  this.address = options.address;
  this.gas = options.gas;
  this.code = '0x' + options.code;

  this.web3 = options.web3;

  Contract.checkWeb3.call(this);

  if (Contract.isNewWeb3(this.web3)) {
    ContractClass = new this.web3.eth.Contract(this.abi, this.address);
    ContractClass.options.data = this.code;
    ContractClass.options.from = this.from || this.web3.eth.defaultAccount;
    ContractClass.abi = ContractClass.options.abi;
    ContractClass.address = this.address;
    ContractClass.gas = this.gas;

    let originalMethods = Object.keys(ContractClass);

    Blockchain.execWhenReady(function() {
      ContractClass.setProvider(web3.currentProvider);
      ContractClass.options.from = web3.eth.defaultAccount;
    });

    ContractClass._jsonInterface.forEach((abi) => {
      if (originalMethods.indexOf(abi.name) >= 0) {
        console.log(abi.name + " is a reserved word and cannot be used as a contract method, property or event");
        return;
      }

      if (!abi.inputs) {
        return;
      }

      let numExpectedInputs = abi.inputs.length;

      if (abi.type === 'function' && abi.constant) {
        ContractClass[abi.name] = function () {
          let options = {}, cb = null, args = Array.from(arguments || []).slice(0, numExpectedInputs);
          if (typeof (arguments[numExpectedInputs]) === 'function') {
            cb = arguments[numExpectedInputs];
          } else if (typeof (arguments[numExpectedInputs]) === 'object') {
            options = arguments[numExpectedInputs];
            cb = arguments[numExpectedInputs + 1];
          }

          let ref = ContractClass.methods[abi.name];
          let call = ref.apply(ref, ...arguments).call;
          return call.apply(call, []);
        };
      } else if (abi.type === 'function') {
        ContractClass[abi.name] = function () {
          let options = {}, cb = null, args = Array.from(arguments || []).slice(0, numExpectedInputs);
          if (typeof (arguments[numExpectedInputs]) === 'function') {
            cb = arguments[numExpectedInputs];
          } else if (typeof (arguments[numExpectedInputs]) === 'object') {
            options = arguments[numExpectedInputs];
            cb = arguments[numExpectedInputs + 1];
          }

          let ref = ContractClass.methods[abi.name];
          let send = ref.apply(ref, args).send;
          return send.apply(send, [options, cb]);
        };
      } else if (abi.type === 'event') {
        ContractClass[abi.name] = function (options, cb) {
          let ref = ContractClass.events[abi.name];
          return ref.apply(ref, [options, cb]);
        };
      }
    });

    return ContractClass;
  } else {
    ContractClass = this.web3.eth.contract(this.abi);

    this.eventList = [];

    if (this.abi) {
      for (i = 0; i < this.abi.length; i++) {
        abiElement = this.abi[i];
        if (abiElement.type === 'event') {
          this.eventList.push(abiElement.name);
        }
      }
    }

    var messageEvents = function () {
      this.cb = function () {
      };
    };

    messageEvents.prototype.then = function (cb) {
      this.cb = cb;
    };

    messageEvents.prototype.error = function (err) {
      return err;
    };

    this._originalContractObject = ContractClass.at(this.address);
    this._methods = Object.getOwnPropertyNames(this._originalContractObject).filter(function (p) {
      // TODO: check for forbidden properties
      if (self.eventList.indexOf(p) >= 0) {

        self[p] = function () {
          var promise = new messageEvents();
          var args = Array.prototype.slice.call(arguments);
          args.push(function (err, result) {
            if (err) {
              promise.error(err);
            } else {
              promise.cb(result);
            }
          });

          self._originalContractObject[p].apply(self._originalContractObject[p], args);
          return promise;
        };
        return true;
      } else if (typeof self._originalContractObject[p] === 'function') {
        self[p] = function (_args) {
          var args = Array.prototype.slice.call(arguments);
          var fn = self._originalContractObject[p];
          var props = self.abi.find((x) => x.name == p);

          var promise = new Promise(function (resolve, reject) {
            args.push(function (err, transaction) {
              promise.tx = transaction;
              if (err) {
                return reject(err);
              }

              var getConfirmation = function () {
                self.web3.eth.getTransactionReceipt(transaction, function (err, receipt) {
                  if (err) {
                    return reject(err);
                  }

                  if (receipt !== null) {
                    return resolve(receipt);
                  }

                  setTimeout(getConfirmation, 1000);
                });
              };

              if (typeof transaction !== "string" || props.constant) {
                resolve(transaction);
              } else {
                getConfirmation();
              }
            });

            fn.apply(fn, args);
          });

          return promise;
        };
        return true;
      }
      return false;
    });
  }
};

Contract.checkWeb3 = function () {};

Contract.isNewWeb3 = function (web3Obj) {
    var _web3 = web3Obj || (new Web3());
    if (typeof(_web3.version) === "string") {
        return true;
    }
    return parseInt(_web3.version.api.split('.')[0], 10) >= 1;
};

Contract.prototype.deploy = function (args, _options) {
  var self = this;
  var contractParams;
  var options = _options || {};

  contractParams = args || [];

  contractParams.push({
    from: this.web3.eth.accounts[0],
    data: this.code,
    gas: options.gas || 800000
  });

  var contractObject = this.web3.eth.contract(this.abi);

  var promise = new Promise(function (resolve, reject) {
    contractParams.push(function (err, transaction) {
      if (err) {
        reject(err);
      } else if (transaction.address !== undefined) {
        resolve(new Contract({
          abi: self.abi,
          code: self.code,
          address: transaction.address
        }));
      }
    });

    contractObject["new"].apply(contractObject, contractParams);
  });

  return promise;
};

Contract.prototype.new = Contract.prototype.deploy;

Contract.prototype.at = function (address) {
  return new Contract({abi: this.abi, code: this.code, address: address});
};

Contract.prototype.send = function (value, unit, _options) {
  var options, wei;
  if (typeof unit === 'object') {
    options = unit;
    wei = value;
  } else {
    options = _options || {};
    wei = this.web3.toWei(value, unit);
  }

  options.to = this.address;
  options.value = wei;

  this.web3.eth.sendTransaction(options);
};

Blockchain.Contract = Contract;

export default Blockchain;

import Storage from './storage.js';
import Names from './names.js';
import Messages from './messages.js';
import Contract from './contracts.js';
import Utils from './utils.js';

function __reduce(arr, memo, iteratee, cb) {
  if (typeof cb !== 'function') {
    if (typeof memo === 'function' && typeof iteratee === 'function') {
      cb = iteratee;
      iteratee = memo;
      memo = [];
    } else {
      throw new TypeError('expected callback to be a function');
    }
  }

  if (!Array.isArray(arr)) {
    cb(new TypeError('expected an array'));
    return;
  }

  if (typeof iteratee !== 'function') {
    cb(new TypeError('expected iteratee to be a function'));
    return;
  }

  (function next(i, acc) {
    if (i === arr.length) {
      cb(null, acc);
      return;
    }

    iteratee(acc, arr[i], function(err, val) {
      if (err) {
        cb(err);
        return;
      }
      next(i + 1, val);
    });
  })(0, memo);
};

function __isNewWeb3_1() {
  return (typeof(web3.version) === "string");
};

function __getAccounts(cb) {
  if (__isNewWeb3_1()) {
    web3.eth.getAccounts().then(function(accounts) {
      cb(null, accounts);
      return null;
    }).catch(function(err) {
      cb(err);
      return null;
    });
    return;
  }
  web3.eth.getAccounts(cb);
};

var EmbarkJS = {
  onReady: function (cb) {
    if (typeof (__embarkContext) === 'undefined') {
      return cb();
    }
    return __embarkContext.execWhenReady(cb);
  },

  connect: function(connectionList, opts, doneCb) {
    __reduce(connectionList, function(prev, value, next) {
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

      __getAccounts(function(err, account) {
        if (err) {
          next(null, true)
        } else {
          next(null, false)
        }
      });
    }, function(err, _result) {
      __getAccounts(function(err, accounts) {
        if (opts.warnAboutMetamask) {
          if (web3.eth.currentProvider && web3.eth.currentProvider.isMetaMask) {
            console.log("%cNote: Embark has detected you are in the development environment and using Metamask, please make sure Metamask is connected to your local node", "font-size: 2em");
          }
        }
        if (accounts) {
          web3.eth.defaultAccount = accounts[0];
        }
        doneCb();
      });
    });
  }
};

EmbarkJS.Contract = Contract;
EmbarkJS.Storage = Storage;
EmbarkJS.Names = Names;
EmbarkJS.Messages = Messages;
EmbarkJS.Utils = Utils;

EmbarkJS.isNewWeb3 = Contract.isNewWeb3;

export default EmbarkJS;

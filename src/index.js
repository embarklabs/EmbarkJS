import Storage from './storage.js';
import Names from './names.js';
import Messages from './messages.js';
import Contract from './contracts.js';
import Utils from './utils.js';

var EmbarkJS = {
  onReady: function (cb) {
    if (typeof (__embarkContext) === 'undefined') {
      return cb();
    }
    return __embarkContext.execWhenReady(cb);
  }
};

EmbarkJS.Contract = Contract;
EmbarkJS.Storage = Storage;
EmbarkJS.Names = Names;
EmbarkJS.Messages = Messages;
EmbarkJS.Utils = Utils;

EmbarkJS.isNewWeb3 = Contract.isNewWeb3;

export default EmbarkJS;

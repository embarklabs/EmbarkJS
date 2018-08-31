import Storage from './storage';
import Names from './names';
import Messages from './messages';
import Blockchain from './blockchain';
import Utils from './utils';

var EmbarkJS = {
  onReady: function (cb) {
    if (self.Blockchain.done) {
      return cb();
    }
    this.Blockchain.finalCb = function() {
      cb();
    }
  }
};

EmbarkJS.Blockchain = Blockchain;
EmbarkJS.Storage = Storage;
EmbarkJS.Names = Names;
EmbarkJS.Messages = Messages;
EmbarkJS.Utils = Utils;
EmbarkJS.Contract = function() {
  throw new Error('EmbarkJS.Contract is deprecated: please use EmbarkJS.Blockchain.Contract instead');
};

EmbarkJS.isNewWeb3 = Blockchain.Contract.isNewWeb3;

export default EmbarkJS;

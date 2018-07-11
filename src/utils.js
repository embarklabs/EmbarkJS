let Utils = {
  fromAscii: function (str) {
    var _web3 = new Web3();
    return _web3.utils ? _web3.utils.fromAscii(str) : _web3.fromAscii(str);
  },
  toAscii: function (str) {
    var _web3 = new Web3();
    return _web3.utils.toAscii(str);
  }
};

export default Utils;

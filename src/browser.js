import _EmbarkJS from './index';

var EmbarkJS = Object.assign({}, _EmbarkJS);

var _checkWeb3 = EmbarkJS.Contract.checkWeb3;

EmbarkJS.Contract.checkWeb3 = function () {
    _checkWeb3.call(this);
    if (!this.web3 && typeof (web3) !== 'undefined') {
        this.web3 = web3;
    } else if (!this.web3) {
        this.web3 = window.web3;
    }
};

export default EmbarkJS;

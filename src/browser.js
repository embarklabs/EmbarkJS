import _EmbarkJS from './embark';

var EmbarkJS = Object.assign({}, _EmbarkJS);

EmbarkJS.Contract.checkWeb3 = function () {
    _EmbarkJS.Contract.checkWeb3.call(this);
    if (!this.web3 && typeof (web3) !== 'undefined') {
        this.web3 = web3;
    } else if (!this.web3) {
        this.web3 = window.web3;
    }
};

export default EmbarkJS;

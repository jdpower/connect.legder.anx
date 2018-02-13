function verifyPackage() {

    console.log(Transport.default)
    console.log(AppBtc.default)
    console.log(AppEth.default)
}

verifyPackage()

const tbtcWalletPath = "44'/1'/0'/0/0'"
const btcWalletPath = "44'/0'/0'/0"
const ethWalletPath = "44'/60'/0'/0'/0"


const getBtcAddress = async (path) => {

    const devices = await Transport.default.list()

    if (devices.length === 0) throw "no device connected"

    const transport = await Transport.default.open(devices[0])
    const btc = new AppBtc.default(transport)
    const result = await btc.getWalletPublicKey(path)
    return result.bitcoinAddress
}

// ETH methods from ledger HQ SDK
const getEthAddress = async (path) => {

    const devices = await Transport.default.list()

    if (devices.length === 0) throw "no devices connected"

    const transport = await Transport.default.open(devices[0])
    const eth = new AppEth.default(transport)
    const result = await eth.getAddress(path, true, true)
    return result.address
}


const signEthTransaction = async (path, rawTxHex) => {

    const devices = await Transport.default.list()

    if (devices.length === 0) throw "no devices connected"

    const transport = await Transport.default.open(devices[0])
    const eth = new AppEth.default(transport)
    const result = await eth.signTransaction(path, rawTxHex)
    return result
}


const getEthAppConfiguration = async () => {

    const devices = await Transport.default.list()

    if (devices.length === 0) throw "no devices connected"

    const transport = await Transport.default.open(devices[0])
    const eth = new AppEth.default(transport)
    const result = await eth.getAppConfiguration()
    return result
}


function onGettBtcAddress(tbtcPath) {

    if (tbtcPath === "") btcPath = btcWalletPath

    getBtcAddress(tbtcPath)
        .then(result => {

            console.log(result)
            document.getElementById("result").innerHTML = JSON.stringify(result, undefined, 3)

            sendMessageBackToClient("sendtBtcAddress", { detail: result })
        })
        .catch(error => {

            console.error(error)
            document.getElementById("result").innerHTML = JSON.stringify(error, undefined, 3)

            sendMessageBackToClient("errortBtcAddress", { detail: error })
            // var event = document.createEvent("Event")
            // event.initEvent("errorBtcAddress")
            // document.dispatchEvent(event)
        })

}


function onGetBtcAddress(btcPath) {

    if (btcPath === "") btcPath = btcWalletPath

    getBtcAddress(btcPath)
        .then(result => {

            console.log(result)
            document.getElementById("result").innerHTML = JSON.stringify(result, undefined, 3)

            sendMessageBackToClient("sendBtcAddress", { detail: result })
        })
        .catch(error => {

            console.error(error)
            document.getElementById("result").innerHTML = JSON.stringify(error, undefined, 3)

            sendMessageBackToClient("errorBtcAddress", { detail: error })
            // var event = document.createEvent("Event")
            // event.initEvent("errorBtcAddress")
            // document.dispatchEvent(event)
        })

}


function onGetEthAddress(ethPath) {

    if (ethPath === "") ethPath = ethWalletPath

    getEthAddress(ethPath)
        .then(result => {

            console.log(result)
            document.getElementById("result").innerHTML = JSON.stringify(result, undefined, 3)

            sendMessageBackToClient("sendEthAddress", { detail: result })
        })
        .catch(error => {

            console.error(error)
            document.getElementById("result").innerHTML = JSON.stringify(error, undefined, 3)

            sendMessageBackToClient("errorEthAddress", { detail: error })
        })

}


function onEthSignTransaction(ethPath, rawTxHex) {

    if (ethPath === "") ethPath = ethWalletPath

    signEthTransaction(path, rawTxHex)
        .then(result => {
            
            console.log(result)
            document.getElementById("result").innerHTML = JSON.stringify(result, undefined, 3)

            sendMessageBackToClient("sendEthSignTx", { detail: result })
        })
        .catch(error => {

            console.log(error)
            document.getElementById("result").innerHTML = JSON.stringify(error, undefined, 3)

            sendMessageBackToClient("errorEthSignTx", { detail: error })
        })
}


function onEthAppConfiguration() {

    getEthAppConfiguration()
        .then(result => {
            
            console.log(result)
            document.getElementById("result").innerHTML = JSON.stringify(result, undefined, 3)

            sendMessageBackToClient("sendEthAppConfig", { detail: result })
        })
        .catch(error => {

            console.log(error)
            document.getElementById("result").innerHTML = JSON.stringify(error, undefined, 3)

            sendMessageBackToClient("errorEthAppConfig", { detail: error })
        })
}


function sendMessageBackToClient(action, message) {

    var eventData = new CustomEvent(action, message)
    document.dispatchEvent(eventData)
}


function urldecode(str) {

    return decodeURIComponent((str+'').replace(/\+/g, '%20'));
}


var getQueryString = function (field, url) {

    const href = url ? url : urldecode(window.location.href)
    const reg = new RegExp('[?&]' + field + '=([^&#]*)', 'i')
    const string = reg.exec(href)
    return string ? string[1] : null
}


function processRequest() {

    var action = getQueryString("action")
    var path = getQueryString("walletpath")
    var rawTx = getQueryString("rawtx")
    
    if (action === "getBtcAddress" && path) {

        onGetBtcAddress(path)
    } else if (action === "getEthAddress" && path) {

        onGetEthAddress(path)
    } else if (action === "gettBtcAddress" && path) {

        onGettBtcAddress(path)
    } else if (action === "signEthSignTx" && path) {

        onEthSignTransaction(path, rawTx)
    } else if (action === "getEthAppConfig") {

        onEthAppConfiguration()
    }
}


processRequest()
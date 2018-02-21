function verifyPackage() {

    console.log(Transport.default)
    console.log(AppBtc.default)
    console.log(AppEth.default)
}

verifyPackage()

// reference wallet paths
// tbtcWalletPath = "44'/1'/0'/0/0'"
// btcWalletPath = "44'/0'/0'/0"
// ethWalletPath = "44'/60'/0'/0'/0"


const getDevice = async (path) => {

    const devices = await Transport.default.list()

    if (devices.length === 0) throw "no device connected"

    return await Transport.default.open(devices[0])
}


const getBtcAddress = async (path) => {

    const transport = await getDevice(path)
    const btc = new AppBtc.default(transport)
    const result = await btc.getWalletPublicKey(path)
    return result.bitcoinAddress
}


const getEthAddress = async (path) => {

    const transport = await getDevice(path)
    const eth = new AppEth.default(transport)
    const result = await eth.getAddress(path, true, true)
    return result.address
}


const signEthTransaction = async (path, txParams) => {

    const transport = await getDevice(path)
    const eth = new AppEth.default(transport)
    const serializedTx = serializeTx(txParams)
    console.log(serializedTx)
    
    const result = await eth.signTransaction(path, serializedTx)
    return result
}


const getEthAppConfiguration = async () => {

    const transport = await getDevice(path)
    const eth = new AppEth.default(transport)
    const result = await eth.getAppConfiguration()
    return result
}


function onGettBtcAddress(tbtcPath) {

    if (tbtcPath === "") throw "no wallet path"

    getBtcAddress(tbtcPath)
        .then(result => {

            console.log(result)
            displayResult(result)
            sendMessageToExtension("sendtBtcAddress", { detail: result })
        })
        .catch(error => {

            console.error(error)
            displayResult(error)
            sendMessageToExtension("errortBtcAddress", { detail: error })
        })

}


function onGetBtcAddress(btcPath) {

    if (btcPath === "") throw "no wallet path"

    getBtcAddress(btcPath)
        .then(result => {

            console.log(result)
            displayResult(result)
            sendMessageToExtension("sendBtcAddress", { detail: result })
        })
        .catch(error => {

            console.error(error)
            displayResult(error)
            sendMessageToExtension("errorBtcAddress", { detail: error })
        })

}


function onGetEthAddress(ethPath) {

    if (ethPath === "") throw "no wallet path"

    getEthAddress(ethPath)
        .then(result => {

            console.log(result)
            displayResult(result)
            sendMessageToExtension("sendEthAddress", { detail: result })
        })
        .catch(error => {

            console.error(error)
            displayResult(error)
            sendMessageToExtension("errorEthAddress", { detail: error })
        })

}


function onEthSignTransaction(ethPath, txParams) {

    if (ethPath === "") throw "no wallet path"
    const _txParams = JSON.parse(txParams)

    signEthTransaction(ethPath, _txParams)
        .then(result => {
            
            console.log(result)
            displayResult(result)
            const data = {
                tx: _txParams,
                result: result
            }

            sendMessageToExtension("sendEthSignTx", { detail: data })
        })
        .catch(error => {

            console.log(error)
            displayResult(error)
            sendMessageToExtension("errorEthSignTx", { detail: error })
        })
}


function onEthAppConfiguration() {

    getEthAppConfiguration()
        .then(result => {
            
            console.log(result)
            displayResult(result)
            sendMessageToExtension("sendEthAppConfig", { detail: result })
        })
        .catch(error => {

            console.log(error)
            displayResult(error)
            sendMessageToExtension("errorEthAppConfig", { detail: error })
        })
}


function displayResult(result) {

    document.getElementById("result").innerHTML = JSON.stringify(result, undefined, 4)
}


function sendMessageToExtension(action, message) {

    var eventData = new CustomEvent(action, message)
    document.dispatchEvent(eventData)
}


function serializeTx(txParams) {

    let tx = new ethereumjs.Tx(Object.assign({v: txParams.chainId}, txParams))
    const serializedTx = tx.serialize()
    return serializedTx.toString("hex")

    // const _chainIdHex = ("0" + txParams.chainId.toString(16)).slice(-2)
    
    // let tx = new ethereumjs.Tx(txParams)
    // const serializedTx = tx.serialize()
    // return serializedTx.toString("hex").replace(/1c8080$/, _chainIdHex + "8080")
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


function processQueryRequest() {

    var action = getQueryString("action")
    var path = getQueryString("walletpath")
    var txParams = getQueryString("txParams")
    
    if (action === "getBtcAddress" && path) {

        onGetBtcAddress(path)
    } else if (action === "getEthAddress" && path) {

        onGetEthAddress(path)
    } else if (action === "gettBtcAddress" && path) {

        onGettBtcAddress(path)
    } else if (action === "signEthSignTx" && path) {

        onEthSignTransaction(path, txParams)
    } else if (action === "getEthAppConfig") {

        onEthAppConfiguration()
    }
}


processQueryRequest()

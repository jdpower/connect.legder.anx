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


const signEthTransaction = async (path, txParams) => {

    const devices = await Transport.default.list()

    if (devices.length === 0) throw "no devices connected"

    const transport = await Transport.default.open(devices[0])
    const eth = new AppEth.default(transport)
    
    console.log(txParams)

    txParams = {
        nonce: '0x00',
        gasPrice: '0x09184e72a000', 
        gasLimit: '0x2710',
        to: '0x0000000000000000000000000000000000000000', 
        value: '0x00', 
        data: '0x7f7465737432000000000000000000000000000000000000000000000000000000600057',
        // EIP 155 chainId - mainnet: 1, ropsten: 3
        chainId: 12
    }

    // const raw = []
    // raw.push(txParams.nonce)
    // raw.push(txParams.gasPrice)
    // raw.push(txParams.gasLimit)
    // raw.push(txParams.to)
    // raw.push(txParams.value)
    // raw.push(txParams.data)
    // raw.push(txParams.chainId)

    // const encoded = ethereumjs.RLP.encode(raw)
    // console.log(encoded)

    // var tx = new ethereumjs.Tx(txParams)
    // console.log(tx)

    const serializedTx = serializeTx(txParams)
    console.log(serializedTx)
    
    const result = await eth.signTransaction(path, encoded)
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
    const txParams = JSON.parse(rawTxHex)

    signEthTransaction(ethPath, txParams)
        .then(result => {
            
            console.log(result)
            document.getElementById("result").innerHTML = JSON.stringify(result, undefined, 3)

            const data = {
                tx: txParams,
                result: result
            }

            sendMessageBackToClient("sendEthSignTx", { detail: data })
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


// function toHex(str) {

// 	var hex = ""
// 	for(var i = 0; i < str.length; i++) {
// 		hex += "" + str.charCodeAt(i).toString(16)
// 	}
// 	return hex
// }


function serializeTx(txParams) {

    const _chainIdHex = ("0" + txParams.chainId.toString(16)).slice(-2)
    
    let tx = new ethereumjs.Tx(txParams)
    const serializedTx = tx.serialize()
    return serializedTx.toString("hex").replace(/1c8080$/, _chainIdHex + "8080")
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
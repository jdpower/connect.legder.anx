function verifyPackage() {

    console.log(Transport.default)
    console.log(AppBtc.default)
    console.log(AppEth.default)
}

verifyPackage()


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


const getEthAddress = async (path) => {

    const devices = await Transport.default.list()

    if (devices.length === 0) throw "no devices connected"

    const transport = await Transport.default.open(devices[0])
    const eth = new AppEth.default(transport)
    const result = await eth.getAddress(path, true, true)
    return result.address
}


function onGetBtcAddress() {

    getBtcAddress(btcWalletPath)
        .then(result => {

            console.log(result)
            document.getElementById("result").innerHTML = JSON.stringify(result)
        })
        .catch(error => {

            console.error(error)
            document.getElementById("result").innerHTML = JSON.stringify(error)
        })

}


function onGetEthAddress() {

    getEthAddress(ethWalletPath)
        .then(result => {

            console.log(result)
            document.getElementById("result").innerHTML = JSON.stringify(result)
        })
        .catch(error => {

            console.error(error)
            document.getElementById("result").innerHTML = JSON.stringify(error)
        })

}
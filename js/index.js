function verifyPackage() {

    console.log(Transport.default)
    console.log(AppBtc.default)
    console.log(AppEth.default)
}


const getBtcAddress = async (path) => {

    const devices = await Transport.default.list()

    if (devices.length === 0) throw "no device connected"

    // return devices[0]
    const transport = await Transport.default.open(devices[0])
    const btc = new AppBtc.default(transport)
    const result = await btc.getWalletPublicKey(path)
    return result.bitcoinAddress
}

verifyPackage()

const path = "44'/0'/0'/0"

getBtcAddress(path)
    .then(result => console.log(result))
    .catch(error => {

        console.error(error)
        // document.getElementById("result").innerHTML = JSON.stringify(error)
    })
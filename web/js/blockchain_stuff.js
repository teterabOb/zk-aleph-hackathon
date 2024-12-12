const NETWORK_ID = 5777;

const MY_CONTRACT_ADDRESS = ""
const MY_CONTRACT_ABI_PATH = "./json_abi/abi.json"

var my_contract
var accounts
var web3

function metamaskReloadCallBack() {
    window.ethereum.on('accountsChanged', function (accounts) {
        document.getElementById("web3_message").textContent = "Se cambió el account, realoading ..."
        window.location.reload()
    });

    window.ethereum.on('networkChanged', (accounts) => {
        document.getElementById("web3_message").textContent = "Se cambió el network, realoading ..."
        window.location.reload()
    })
}

const getWeb3 = async () => {
    return new Promise((resolve, reject) => {
        if (document.readyState == "complete") {
            if (window.ethereum) {
                const web3 = new Web3(window.ethereum);
                window.location.reload()
                resolve(web3);
            } else {
                reject("No se encontró metamask")
                document.getElementById("web3_message").textContent = "No se encontró metamask"
            }
        } else {
            window.addEventListener("load", async () => {
                if (window.ethereum) {
                    const web3 = new Web3(window.ethereum);
                    resolve(web3);
                } else {
                    reject("No se encontró metamask")
                    document.getElementById("web3_message").textContent = "No se encontró metamask"
                }
            })
        }
    })
}

const getContract = async (web3, address, abi_path) => {
    const response = await fetch(abi_path)
    const data = await response.json()

    //const netId = await web3.eth.net.netId()
    contract = new web3.eth.Contract(data, address)

    return contract
}

async function loadDapp() {
    metamaskReloadCallback()
    document.getElementById("web3_message").textContent = "Please connect to Metamask"
    var awaitWeb3 = async function () {
        web3 = await getWeb3()
        web3.eth.net.getId((err, netId) => {
            if (netId == NETWORK_ID) {
                var awaitContract = async function () {
                    my_contract = await getContract(web3, MY_CONTRACT_ADDRESS, MY_CONTRACT_ABI_PATH)
                    document.getElementById("web3_message").textContent = "You are connected to Metamask"
                    onContractInitCallback()
                    web3.eth.getAccounts(function (err, _accounts) {
                        accounts = _accounts
                        if (err != null) {
                            console.error("An error occurred: " + err)
                        } else if (accounts.length > 0) {
                            onWalletConnectedCallback()
                            document.getElementById("account_address").style.display = "block"
                        } else {
                            document.getElementById("connect_button").style.display = "block"
                        }
                    });
                };
                awaitContract();
            } else {
                document.getElementById("web3_message").textContent = "Please connect to Scroll Testnet";
            }
        });
    };
    awaitWeb3();
}

async function connectWallet() {
    await window.ethereum.request({ method: "eth_requestAccounts" })
    accounts = await web3.eth.getAccounts()
    onWalletConnectedCallback()
}

loadDapp()

const onContractInitCallback = async () => {
    var publicInput = await my_contract.methods.publicInput().call()
    var contract_state = "Public input: " + publicInput
    document.getElementById("contract_state").textContent = contract_state;
}

const onWalletConnectedCallback = async () => {
}

const sendProof = async (a, b) => {
    document.getElementById("web3_message").textContent = "Generating proof...";

    const { proof, publicSignals } = await snarkjs.groth16.fullProve({ a: a, b: b }, "../artifacts/balance.wasm", "../artifacts/balance_0001.zkey");

    const vkey = await fetch("../artifacts/verification_key.json").then(function (res) {
        return res.json();
    });

    const res = await snarkjs.groth16.verify(vkey, publicSignals, proof);

    console.log("Proof verified client-side: ", res);

    pA = proof.pi_a
    pA.pop()
    pB = proof.pi_b
    pB.pop()
    pC = proof.pi_c
    pC.pop()

    document.getElementById("web3_message").textContent = "Proof generated please confirm transaction.";

    const result = await my_contract.methods.verifyProof(pA, pB, pC, publicSignals)
    /*
        .send({ from: accounts[0], gas: 0, value: 0 })
        .on('transactionHash', function (hash) {
            document.getElementById("web3_message").textContent = "Executing...";
        })
        .on('receipt', function (receipt) {
            document.getElementById("web3_message").textContent = "Success.";
        })
        .catch((revertReason) => {
            console.log("ERROR! Transaction reverted: " + revertReason.receipt.transactionHash)
        });
    */

    console.log("Result : ", result)
}


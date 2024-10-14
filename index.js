require('dotenv').config();
const Web3 = require('web3');
const fs = require('fs');
const colors = require('colors');
const readline = require('readline');


const RPC_URL = process.env.EDUCHAIN_RPC_URL;
const CHAIN_ID = parseInt(process.env.CHAIN_ID);
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;


const web3 = new Web3(new Web3.providers.HttpProvider(RPC_URL));


const abi = JSON.parse(fs.readFileSync('hope.json', 'utf8'));


const contract = new web3.eth.Contract(abi, CONTRACT_ADDRESS);


web3.eth.net.isListening()
    .then(() => {
        console.log(colors.green("Koneksi berhasil ke EDUChain Testnet"));

        
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        rl.question('Private Key Bang: ', async (privateKey) => {
            const account = web3.eth.accounts.privateKeyToAccount(privateKey);
            const ACCOUNT_ADDRESS = account.address;

            
            async function callHope(usrAddress) {
                try {
                    const nonce = await web3.eth.getTransactionCount(ACCOUNT_ADDRESS);

                    const tx = {
                        from: ACCOUNT_ADDRESS,
                        to: CONTRACT_ADDRESS,
                        gas: 2000000,
                        gasPrice: web3.utils.toWei('10', 'gwei'),
                        nonce: nonce,
                        data: contract.methods.hope(web3.utils.toChecksumAddress(usrAddress)).encodeABI(),
                    };

                    const signedTx = await web3.eth.accounts.signTransaction(tx, privateKey);
                    const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
                    console.log(colors.yellow(`Transaksi hope dikirim, hash: ${receipt.transactionHash}`));
                } catch (error) {
                    console.error(colors.red(`Error: ${error.message}`));
                }
            }

            
            const usrAddress = "0x42ffae0648a84c0ac72d012402f380ab511acbb1"; 
            setInterval(() => {
                callHope(usrAddress); 
                console.log(colors.green(`Menunggu 15 detik...`));
            }, 15000);

            rl.close();
        });
    })
    .catch((err) => {
        console.error(colors.red("Gagal terhubung ke EDUChain Testnet: " + err.message));
    });

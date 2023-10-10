import * as React from 'react';
import { ethers } from 'ethers';
import { wannsee } from './wagmi';
import dotenv from 'dotenv';



export function MintTokens() {
  dotenv.config();
  const addressTo = '0x1180f524464998d2852eA4a59F495Dbc3B30Ead5';
  const contractAddress = '0x62464DC397A37D3C4104EB003881b65B171B7400';
  const address = '0x1180f524464998d2852eA4a59F495Dbc3B30Ead5'; // Replace with the address you want to check
  const privateKey = '0x48c6d90aae847adf9426fbe4de55993bf75057ad64c0ab260521c6cda0eb055c'
                   //Private Key 0x48c6d90aae847adf9426fbe4de55993bf75057ad64c0ab260521c6cda0eb055c
                   //Address: 
  const valueTo = (100*(10**18)).toString();
  const [isMinting, setIsMinting] = React.useState(false);
  const [transactionHash, setTransactionHash] = React.useState(null);
  
  const readKey = () => {

    const privateKey = process.env.REACT_APP_PRIVATE_KEY;
    console.log("Private Key: ",privateKey);
  }

  const mintTokens = async () => {
    try {
      setIsMinting(true);
      // NEVER store private keys in client-side code in production
      const providerUrl = 'https://wannsee-rpc.mxc.com';//wannsee.rpcUrls.default.http.toString(); //'https://wannsee-rpc.mxc.com';
      console.log('ProviderURL:', providerUrl)
      //const privateKey = process.env.REACT_APP_PRIVATE_KEY;

      console.log('Wallet Private Key:', privateKey)
      const provider = new ethers.providers.JsonRpcProvider(providerUrl);

    //   let randomWallet = ethers.Wallet.createRandom();
    //   console.log('Wallet Private Key:', randomWallet.privateKey)
    //   console.log('Wallet Public Key:', randomWallet.publicKey)
    //   console.log('Wallet Public Key:', randomWallet.address)
      
      const wallet = new ethers.Wallet(privateKey, provider);
      console.log('Wallet Address:', wallet.address)      
      
      provider.getBalance(address).then((balance) => {
      console.log('Balance:', ethers.utils.formatEther(balance), 'MXC')
    });

      const abi = [
        {
          name: 'mint',
          type: 'function',
          stateMutability: 'nonpayable',
          inputs: [
            { name: 'to', type: 'address' },
            { name: 'value', type: 'uint256' },
          ],
          outputs: [],
        },
      ];

      const contract = new ethers.Contract(contractAddress, abi, wallet);
      const transactionResponse = await contract.mint(addressTo, valueTo);
      setTransactionHash(transactionResponse.hash);

      await transactionResponse.wait();
      alert('Successfully minted your Token!');
    } 
    catch (error) {
      console.error('Minting failed:', error);
      alert('Minting failed. Check the console for error details.');
    } 
    finally {
      setIsMinting(false);
    }}

  mintTokens();

  return (
    <div>
      {/* <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={mintTokens}>
        {'Mint'}
      </button>
      {transactionHash && (
        <div>
          Successfully minted your Token!
          <div>
            <a href={`https://wannsee-explorer.mxc.com/address/${transactionHash}`} target="_blank" rel="noopener noreferrer">
              View on Etherscan
            </a>
          </div>
        </div>
      )}
 */}
    </div>
  );
}

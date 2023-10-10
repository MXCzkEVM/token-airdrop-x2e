import { Card } from 'flowbite-react'
import { NextPageWithLayout } from './_app'
import Layout from '@components/Layout'
import { ReactElement, useState } from 'react'
import ERC20_FACTORY, { FACTORY_ABI_FULL } from '@utils/contracts/erc20factory'
import { ERC20_IMPL_ABI_FULL } from '@utils/contracts/erc20'
import { useAccount, useContractRead, useProvider, useToken, useTransaction, useBalance } from 'wagmi'
import { watchBlockNumber } from '@wagmi/core'
import { ethers, utils } from 'ethers'
import React, { useEffect } from 'react'
import {hexToBytes, bytesToUtf8, extractJSON} from '@utils/jsonparser'
//import {MintTokens} from '@utils/mintTokenEthers'

// type tokenInfo = {
//   address: `0x${string}`
//   name: string
//   symbol: string
//   supply: string
// }
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
//var deviceInfo = "No Data";

const GetTransaction = (): React.ReactElement => {
    const { data, isError, isLoading } = useTransaction({
      hash: '0x8bc804795c699794962a1dc189176dca985b9fb98bc4cac655300863ae8b51b0',
    })
   
    if (isLoading) return <div>Fetching transaction…</div>
    if (isError) return <div>Error fetching transaction</div>
    return <div>Transaction: {JSON.stringify(data)}</div>
  }

// Retrieve tokens deployed by a user
const Page: NextPageWithLayout = () => {

  const [deviceName, setDeviceName] = React.useState("No Data");
  const [deviceEui, setDeviceEui] = React.useState("No Data");
  const [deviceData, setDeviceData] = React.useState("No Data");
  const [currentBlock, setCurrentBlock] = React.useState("No Data");
  const [myTokenBalance, setMyTokenBalance] = React.useState("No Data");

  //const [isMinting, setIsMinting] = React.useState(false);
  //const [transactionHash, setTransactionHash] = React.useState(null);

  let myTokenAddress = "";
  let myTokenSymbol = "";

  const { address } = useAccount()
  const { data, isLoading } = useContractRead({
    address: ERC20_FACTORY.address,
    abi: FACTORY_ABI_FULL,
    functionName: `getERC20s`,
    args: [ethers.utils.getAddress(address || `0x`)],
  })
  

  const GetBalance = (): React.ReactElement => {
    const { address, connector, isConnected } = useAccount()
    const { data, isError, isLoading } = useBalance({
      address: address,
      token: myTokenAddress
    })
    if (isLoading) return <div>Fetching balance…</div>
    if (isError) return <div>Error fetching balance</div>
    return (
      <div>
        Balance: {data?.formatted} {data?.symbol}
      </div>
    )
  }



  const GetTokenInfo = (tokenAddress: `0x${string}`): React.ReactElement => {
    const { data, isError, isLoading } = useToken({
      address: tokenAddress.token,
    })
    myTokenAddress = tokenAddress.token;

    //console.log(tokenAddress);    
    if (isLoading) return <div>Fetching token…</div>
    if (isError) return <div>Error fetching token</div>
    myTokenSymbol = data?.symbol ?? "";
   // UpdateBalance();
    return (
    <div>
        <div className="grid grid-cols-3 gap-4">
                <div>
                 <p className="text-1xl font-semibold leading-8 text-sky-800"> Token Symbol: </p> {data?.symbol}
                </div>
                <div>
                 <p className="text-1xl font-semibold leading-8 text-sky-800"> Token Name: </p> {data?.name}
                </div>
                <div>
                  <p className="text-1xl font-semibold leading-8 text-sky-800"> Total Supply: </p> {data?.totalSupply.formatted}
                </div>
        </div>              
    </div>
    )
  }

  const GetBlockNumberFunc = (): React.ReactElement => {
    const publicClient = useProvider();
    if(publicClient.listenerCount('block') < 1){
      publicClient.on('block', (blockNumber) => {      
        setCurrentBlock(blockNumber);
        console.log(blockNumber)
        let block = publicClient.getBlockWithTransactions(blockNumber);
        block.then(function(x){                    
              for (let tx of x.transactions) {
                if (tx.from && tx.from.toLowerCase() === '0x452403368683016c54dd16871622648f37aa946c') {
                  console.log("Transaction Found:", tx);
                  //parseTransaction(tx);
                  let utf8Str = bytesToUtf8(hexToBytes(tx.data));
                  console.log(extractJSON(utf8Str));
                  try{
                    let jsonObj = JSON.parse(extractJSON(utf8Str));		
                    console.log(jsonObj);
                    setDeviceName(jsonObj.deviceInfo.deviceName);
                    setDeviceEui(jsonObj.deviceInfo.devEui);
                    //getReward(); 
                    if(jsonObj.hasOwnProperty("object") && jsonObj.object.hasOwnProperty("x2earn_data")){ //jsonObj.object.x2earn_data.distance0   && jsonObj.object.hasOwnProperty("x2earn_data")
                      setDeviceData(jsonObj.object.x2earn_data.distance0);
                      console.log(jsonObj.object.x2earn_data.distance0);
                      getReward(); 

                      //let balance = UpdateBalance();
                      UpdateBalance();
                      console.log(balance);
                      //if(balance){setMyTokenBalance(balance);}
                      //setMyTokenBalance(balance);
                    }
                    console.log(jsonObj.deviceInfo.deviceName);
                  }
                  catch(e){
                    console.error(e);
                  }
                }
              }
            })        
        });
    }
    //console.log("get Block");S
    //console.log(block);
    return (<div>{deviceName}</div>);
  }

const getReward = () => {
  MintTokens();
}

// const UpdateBalance = ():string => {
//   const { address, connector, isConnected } = useAccount()
//   const { data, isError, isLoading } = useBalance({
//     address: address,
//     token: myTokenAddress
//   })
//   return ( data?.formatted ? data?.formatted : "" )
// }

const UpdateBalance = async () => {
  const { address } = useAccount();
  const { data, isError, isLoading } = useBalance({
    address: address,
    token: myTokenAddress,
  });

  if (isLoading) {
    return; // Do not update the state if it's still loading
  }

  if (isError) {
    console.error("Error fetching balance");
    return; // Handle error gracefully
  }

  if (data && data.formatted) {
    setMyTokenBalance(data.formatted); // Update the state with the new balance
    console.log(data.formatted);
  }
}

const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text)
    .then(() => {
      console.log('Text copied to clipboard');
    })
    .catch(err => {
      console.error('Error in copying text: ', err);
    });
    };

function MintTokens() {
      //dotenv.config();
      const addressTo = '0x1180f524464998d2852eA4a59F495Dbc3B30Ead5';
      const contractAddress = '0x62464DC397A37D3C4104EB003881b65B171B7400';
      const address = '0x1180f524464998d2852eA4a59F495Dbc3B30Ead5'; // Replace with the address you want to check
      const privateKey = '0x48c6d90aae847adf9426fbe4de55993bf75057ad64c0ab260521c6cda0eb055c'
                       //Private Key 0x48c6d90aae847adf9426fbe4de55993bf75057ad64c0ab260521c6cda0eb055c
                       //Address: 
      const valueTo = (100*(10**18)).toString();
      
      const readKey = () => {
    
        const privateKey = process.env.REACT_APP_PRIVATE_KEY;
        console.log("Private Key: ",privateKey);
      }
    
   const mintTokens = async () => {
        try {
          //setIsMinting(true);
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
          //setTransactionHash(transactionResponse.hash);
    
          await transactionResponse.wait();
          //UpdateBalance();
          alert('Successfully minted your Token!');
        } 
        catch (error) {
          console.error('Minting failed:', error);
          alert('Minting failed. Check the console for error details.');
        } 
        finally {
          //setIsMinting(false);
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

  GetBlockNumberFunc();
  //UpdateBalance();
  return (
    <>

    <div className="mx-auto w-3/5">
        <Card>
          <h5 className="text-2xl mb-4 font-bold tracking-tight text-sky-800 dark:text-white">
           Current Block Number
          </h5>
          <div className="text-4xl font-mono leading-8 text-emerald-600"> {currentBlock} </div>
        </Card>
    </div>    
    <div className="mx-auto w-3/5">
        <Card>
            <h5 className="text-2xl mb-4 font-bold tracking-tight text-sky-800 dark:text-white">
            Sensor Token Contract
            </h5>
            {isLoading && <div>Loading...</div>}
            {!isLoading && data && (
            <ul className="space-y-4 list-outside">
                {data.map((token: `0x${string}`, index: number) => (
                <li key={index} className="flex items-center list-outside">
                    <div className="mx-auto w-full">
                    <p className="text-1xl font-semibold leading-8 text-sky-800"> Token Contract Address: </p>
                        {token}
                        {GetTokenInfo({token})}
                    </div>                                          
                </li>
                ))}
            </ul>
            )}          
        </Card>
    </div>
    <div className="mx-auto w-3/5 break-words">
            <Card> 
            <h5 className="text-2xl mb-4 font-bold tracking-tight text-sky-800 dark:text-white">
                Sensors Data
            </h5>
            <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-1xl font-semibold leading-8 text-sky-800"> Device Name: </p> {deviceName}
                </div>
                <div>
                  <p className="text-1xl font-semibold leading-8 text-sky-800"> Device EUI: </p> {deviceEui}
                </div>
                <div>
                  <p className="text-1xl font-semibold leading-8 text-sky-800"> Device Data: </p> Distance: {deviceData} [m]
            </div>
        </div>     
        </Card>
    </div>
    <div className="mx-auto w-3/5 break-words">
            <Card> 
            <h5 className="text-2xl mb-4 font-bold tracking-tight text-sky-800 dark:text-white">
                Minted Tokens
            </h5>
            <div>
              {myTokenBalance} {myTokenSymbol}
              {/* <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={MintTokens}> {'Mint'} </button> */}
              {/* <GetBalance/>
              <MintTokens/> */}
            </div>
        </Card>
    </div>
    </>
  )
}

Page.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>
}

export default Page
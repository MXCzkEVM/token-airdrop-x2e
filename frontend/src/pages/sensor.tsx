import { Card } from 'flowbite-react'
import { NextPageWithLayout } from './_app'
import Layout from '@components/Layout'
import { ReactElement, useState } from 'react'
import ERC20_FACTORY, { FACTORY_ABI_FULL } from '@utils/contracts/erc20factory'
import { ERC20_IMPL_ABI_FULL } from '@utils/contracts/erc20'
import { useAccount, useContractRead, useProvider, useToken, useTransaction } from 'wagmi'
import { watchBlockNumber } from '@wagmi/core'
import { ethers } from 'ethers'
import React, { useEffect } from 'react'
import {hexToBytes, bytesToUtf8, extractJSON} from '@utils/jsonparser'

// type tokenInfo = {
//   address: `0x${string}`
//   name: string
//   symbol: string
//   supply: string
// }
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
//var deviceInfo = "No Data";
const GetTokenInfo = (tokenAddress: `0x${string}`): React.ReactElement => {
    const { data, isError, isLoading } = useToken({
      address: tokenAddress.token,
    })
    //console.log(tokenAddress);
    
    if (isLoading) return <div>Fetching token…</div>
    if (isError) return <div>Error fetching token</div>
    return (
    <div>
        <p className="text-1xl font-semibold leading-8 text-sky-800"> Token Synbol: </p> {data?.symbol}
        <p className="text-1xl font-semibold leading-8 text-sky-800"> Token Name: </p> {data?.name}
        <p className="text-1xl font-semibold leading-8 text-sky-800"> Total Supply: </p> {data?.totalSupply.formatted}
    </div>
    )
  }
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
  const { address } = useAccount()

  const { data, isLoading } = useContractRead({
    address: ERC20_FACTORY.address,
    abi: FACTORY_ABI_FULL,
    functionName: `getERC20s`,
    args: [ethers.utils.getAddress(address || `0x`)],
  })

  const [deviceName, setDeviceName] = React.useState("No Data");
  const [deviceEui, setDeviceEui] = React.useState("No Data");
  const [deviceData, setDeviceData] = React.useState("No Data");
  const [currentBlock, setCurrentBlock] = React.useState("No Data");

  const GetBlockNumberFunc = (): React.ReactElement => {
    const publicClient = useProvider();
    publicClient.on('block', (blockNumber) => {
        setCurrentBlock(blockNumber);
        let block = publicClient.getBlockWithTransactions(blockNumber);
        block.then(function(x)
            {
                console.log(blockNumber)
                for (let tx of x.transactions) {
                    if (tx.from && tx.from.toLowerCase() === '0x452403368683016c54dd16871622648f37aa946c') {
                        console.log("Transaction Found:", tx);
                        //parseTransaction(tx);
                        let utf8Str = bytesToUtf8(hexToBytes(tx.data));
                        //console.log(jsonString);
                        let jsonObj = JSON.parse(extractJSON(utf8Str));		
                        console.log(jsonObj);
                        setDeviceName(jsonObj.deviceInfo.deviceName);
                        setDeviceEui(jsonObj.deviceInfo.devEui);
                        setDeviceData(jsonObj.data);
                        console.log(deviceName);
                    }}
            })
    });
    //console.log("get Block");
    //console.log(block);
    return (<div>{deviceName}</div>);
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

  GetBlockNumberFunc();

  return (
    <>

    <div className="mx-auto w-3/5">
        <Card>
          <h5 className="text-2xl mb-4 font-bold tracking-tight text-sky-800 dark:text-white">
           Current Block Nuber
          </h5>
          <div className="text-4xl font-mono leading-8 text-emerald-600"> {currentBlock} </div>
        </Card>
    </div>    
    <div className="mx-auto w-3/5">
        <Card>
            <h5 className="text-2xl mb-4 font-bold tracking-tight text-sky-800 dark:text-white">
            Your Tokens
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
            <div>
                <p className="text-1xl font-semibold leading-8 text-sky-800"> Device Name: </p> {deviceName}
                <p className="text-1xl font-semibold leading-8 text-sky-800"> Device EUI: </p> {deviceEui} 
                <p className="text-1xl font-semibold leading-8 text-sky-800"> Device Data: </p> {deviceData}
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
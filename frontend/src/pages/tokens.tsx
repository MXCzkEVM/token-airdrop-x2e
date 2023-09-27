import { Card } from 'flowbite-react'
import { NextPageWithLayout } from './_app'
import Layout from '@components/Layout'
import { ReactElement, useState } from 'react'
import ERC20_FACTORY, { FACTORY_ABI_FULL } from '@utils/contracts/erc20factory'
import { ERC20_IMPL_ABI_FULL } from '@utils/contracts/erc20'
import { useAccount, useContractRead, useProvider, useToken } from 'wagmi'
import { ethers } from 'ethers'
import React from 'react'

// type tokenInfo = {
//   address: `0x${string}`
//   name: string
//   symbol: string
//   supply: string
// }
//const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))


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

// Retrieve tokens deployed by a user
const Page: NextPageWithLayout = () => {
  const { address } = useAccount()

  const { data, isLoading } = useContractRead({
    address: ERC20_FACTORY.address,
    abi: FACTORY_ABI_FULL,
    functionName: `getERC20s`,
    args: [ethers.utils.getAddress(address || `0x`)],
  })
  const tokenAddress : `0x${string}` = data[0];
  
  //console.log(data);

const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text)
    .then(() => {
      console.log('Text copied to clipboard');
    })
    .catch(err => {
      console.error('Error in copying text: ', err);
    });
};

//const {tokenInfo} = GetTokenInfo({tokenAddress});


  return (
    <>
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
    </>
  )
}

Page.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>
}

export default Page
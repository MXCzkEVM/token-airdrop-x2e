import { Card } from 'flowbite-react'
import { NextPageWithLayout } from './_app'
import Layout from '@components/Layout'
import { ReactElement } from 'react'
import dotenv from 'dotenv';
import React from 'react';

import {
  useAccount,
  useConnect,
  useDisconnect,
  useEnsAvatar,
  useEnsName,
} from 'wagmi'
import { useBalance } from 'wagmi'

// Load environment variables from .env file
//dotenv.config();

const GetBalance = (myaddress: string): React.ReactElement => {
  const { data, isError, isLoading } = useBalance({
    address: myaddress.address,
  })
  if (isLoading) return <div>Fetching balance…</div>
  if (isError) return <div>Error fetching balance</div>
  return (
    <div>
      Balance: {data?.formatted} {data?.symbol}
    </div>
  )
}
function Profile() {
  const { address, connector, isConnected } = useAccount()
  //const { data: ensAvatar } = useEnsAvatar({ address })
  const { data: ensName } = useEnsName({ address })
  const { connect, connectors, error, isLoading, pendingConnector } = useConnect()
  const { disconnect } = useDisconnect()
  dotenv.config();
  const myBalance = GetBalance({address});

  if (isConnected) {
    return (
      <div>
        <div>
          <p className="text-1xl font-semibold leading-8 text-sky-800"> Your Wallet Address: </p> {ensName ? `${ensName} (${address})` : address}
          <p className="text-1xl font-semibold leading-8 text-sky-800"> Connected to: </p> {connector.name}
          <p className="text-1xl font-semibold leading-8 text-sky-800"> Your Balance: </p> {myBalance}
        </div>
      </div>
    )
  }
  return (
    <div>
      Connect Wallet
    </div>
  )
}

const Page: NextPageWithLayout = () => {
  return (
    <>
      <div className="mx-auto w-3/5">
        <Card>
          <h2 className="text-2xl font-semibold leading-8 text-sky-800">
            Create an ERC20 token on zkEVM
          </h2>
        </Card>
        <Card> <Profile/> </Card>
        
      </div>
    </>
  )
}

Page.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>
}

export default Page

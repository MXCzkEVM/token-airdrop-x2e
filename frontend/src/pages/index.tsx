import { Card } from 'flowbite-react'
import { NextPageWithLayout } from './_app'
import Layout from '@components/Layout'
import { ReactElement } from 'react'

const Page: NextPageWithLayout = () => {
  return (
    <>
      <div className="mx-auto w-3/5">
        <Card>Click Deploy Token to create an ERC20 on Moonchain</Card>
      </div>
    </>
  )
}

Page.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>
}

export default Page

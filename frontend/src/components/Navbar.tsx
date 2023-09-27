import { Navbar } from 'flowbite-react'
import React from 'react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useRouter } from 'next/router'

const LayoutNavbar: React.FC = () => {
  const router = useRouter()

  const linkStyle = {
    cursor: 'pointer', // Change cursor to a hand (pointer) when hovering
  };

  return (
    <div className="mb-8">
      <Navbar fluid={true} rounded={true}>
        <Navbar.Brand href="https://mxc.org">
          <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-white">
            MXC zkEVM
          </span>
        </Navbar.Brand>
        <div className="flex md:order-2">
          <ConnectButton />
          <Navbar.Toggle />
        </div>
        <Navbar.Collapse>
          <Navbar.Link onClick={() => router.push(`/`)} style={linkStyle}>Home</Navbar.Link>
          <Navbar.Link onClick={() => router.push(`/deploy`)}style={linkStyle}>Deploy Token</Navbar.Link>
          <Navbar.Link onClick={() => router.push(`/tokens`)}style={linkStyle}>My Tokens</Navbar.Link>
          <Navbar.Link onClick={() => router.push(`/airdrop`)}style={linkStyle}>Airdrop </Navbar.Link>
          <Navbar.Link onClick={() => router.push(`/sensor`)}style={linkStyle}>Sensor Data</Navbar.Link>
        </Navbar.Collapse>
      </Navbar>
    </div>
  )
}

export default LayoutNavbar

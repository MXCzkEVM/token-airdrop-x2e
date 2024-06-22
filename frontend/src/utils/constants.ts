export const DEFAULT_SUPPLY = `1000000000000000000000000`

import { BigNumber, ethers } from 'ethers'

export const txLink = (hash: string) =>
  `<a target="_blank" href=\`\${https://geneva-explorer.mxc.com/tx/\${hash}\`>txn</a>`

export const sumBigNumbers = (numbers: BigNumber[]): BigNumber => {
  let sum = BigNumber.from(0)
  for (const number of numbers) {
    sum = sum.add(number)
  }

  console.log(`sum`, sum.toString())
  return sum
}

export const AIRDROP_CONTRACT_ADDRESS = ethers.utils.getAddress(
  `0xed181423e595A9369A865036489B4e14c43043fC`,//wannsee: 0x31c7eD1b097730f7BC363059EB71526b6CB514E3
)

export const TOKEN_CONTRACT_ADDRESS = ethers.utils.getAddress(
  `0xde2D5323690d8AEEd23e10FA90Db6a336b5FD186`,//wannsee: 0x2b8546F1E9B59eF499Acb6969D8B455DeAC6CE1B
)

export const BN_ZERO = BigNumber.from(0)

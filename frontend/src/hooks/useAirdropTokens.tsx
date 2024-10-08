import { BigNumber, ethers } from 'ethers'
import {
  useAccount,
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
  erc20ABI,
  useProvider,
} from 'wagmi'
import { toast } from 'react-hot-toast'
import { useEffect, useState } from 'react'
import useDebounce from '@hooks/useDebounce'
import Papa from 'papaparse'
import { sumBigNumbers, AIRDROP_CONTRACT_ADDRESS, BN_ZERO } from '@utils/constants'
import { useGetTokens } from '@hooks/useGetTokens'
import { AIRDROP_ABI } from '@utils/contracts/airdrop'

type AirdropCalldata = [`0x${string}`[], BigNumber[]]

type IUseAirdropTokens = {
  token: `0x${string}`
}

const useAirdropTokens = ({ token }: IUseAirdropTokens) => {
  const { address } = useAccount()
  const { tokensDeployed, isTokensLoading } = useGetTokens(
    ethers.utils.getAddress(String(address)),
  )
  const [parsedData, setParsedData] = useState<unknown[]>([])
  const [isFileUploaded, setFileUploaded] = useState<boolean>(false)
  const [file, setFile] = useState<any>(null)
  const [currentAllowance, setCurrentAllowance] = useState<BigNumber>(BN_ZERO)
  const [totalRequiredAllowance, setTotalRequiredAllowance] =
    useState<BigNumber>(BN_ZERO)
  const [isApprovalComplete, setIsApprovalComplete] = useState<boolean>(false)
  const [isAirdropComplete, setIsAirdropComplete] = useState<boolean>(false)
  const [calldata, setCallData] = useState<AirdropCalldata>([[], []] as AirdropCalldata)
  const debounceCalldata = useDebounce(calldata, 500)

  const isApprovalRequired =
    isFileUploaded &&
    currentAllowance?.lt(totalRequiredAllowance) &&
    totalRequiredAllowance.gt(0)

  // ============== APPROVAL TXN PREPARE==============
  const { config: approvalConfig, error: prepareApprovalError } =
    usePrepareContractWrite({
      address: token as `0x${string}`,
      abi: erc20ABI,
      functionName: `approve`,
      args: [
        AIRDROP_CONTRACT_ADDRESS,
        totalRequiredAllowance != null
          ? totalRequiredAllowance
          : BigNumber.from(0),
      ],
    })

  console.log('prepareApprovalError', prepareApprovalError)
  console.log('approvalConfig', approvalConfig)

  // ============== APPROVAL TXN WRITE ==============
  const {
    data: approvalData,
    write: approvalWrite,
    isError: isApprovalWriteError,
    error: approvalWriteError,
  } = useContractWrite(approvalConfig)

  console.log('approvalWriteError', approvalWriteError)
  console.log('approvalData', approvalData)
  console.log('approvalWrite', approvalWrite)

  // ============== APPROVAL TXN WAIT FOR MINE ==============
  const { isLoading: approvalLoading, isSuccess: approvalSuccess } =
    useWaitForTransaction({
      hash: approvalData?.hash,
      enabled: approvalData?.hash != null,
      confirmations: 2,
      onSuccess() {
        toast.success(`Approval Txn Success`)
        setIsApprovalComplete(true)
        console.log('Approval transaction successful')
      },
    })

  console.log('approvalLoading', approvalLoading)
  console.log('approvalSuccess', approvalSuccess)

  // ============== AIRDROP TXN PREPARE ==============
  const {
    config: airdropTokensConfig,
    error: prepareAirdropError,
    isError: isPrepareAirdropError,
  } = usePrepareContractWrite({
    address: AIRDROP_CONTRACT_ADDRESS,
    abi: AIRDROP_ABI,
    functionName: `airdropTokens`,
    args: [token as `0x${string}`, debounceCalldata[0], debounceCalldata[1]],
    enabled: isApprovalComplete && file != null,
  })

  console.log('prepareAirdropError', prepareAirdropError)
  console.log('isPrepareAirdropError', isPrepareAirdropError)
  console.log('airdropTokensConfig', airdropTokensConfig)

  // ============== AIRDROP TXN WRITE ==============
  const {
    data: airdropTokensData,
    write: airdropTokensWrite,
    isError: isAirdropWriteError,
    error: airdropWriteError,
  } = useContractWrite({
    ...airdropTokensConfig,
    enabled: isApprovalComplete && file != null,
  })

  console.log('airdropTokensWrite', airdropTokensWrite)
  console.log('isAirdropWriteError', isAirdropWriteError)
  console.log('airdropWriteError', airdropWriteError)

  // ============== AIRDROP TXN WAIT ==============
  const {
    isLoading: isAirdropResultLoading,
    isSuccess: isAirdropSuccess,
    status: airdropStatus,
  } = useWaitForTransaction({
    hash: airdropTokensData?.hash,
    confirmations: 2,
    onSuccess() {
      setIsAirdropComplete(true)
      toast.success(`Successfully Airdropped!`)
    },
  })

  console.log('isAirdropResultLoading', isAirdropResultLoading)
  console.log('isAirdropSuccess', isAirdropSuccess)
  console.log('airdropStatus', airdropStatus)

  const provider = useProvider()

  useEffect(() => {
    console.log('useAirdropTokens initialized with token:', token)
    console.log('airdropTokensWrite:', airdropTokensWrite)
    // when the selected token changes, fetch allowance from owner -> airdrop contract address
    const getAllowance = async () => {
      if (token === null || token === '0x') return
      const ERC20_INSTANCE = new ethers.Contract(token, erc20ABI, provider)
      const allowance = (await ERC20_INSTANCE.allowance(
        address,
        AIRDROP_CONTRACT_ADDRESS,
      )) as BigNumber
      console.log('allowance: ', allowance.toString())
      if (allowance.gt(BN_ZERO) && allowance.eq(totalRequiredAllowance)) {
        setIsApprovalComplete(true)
      }
      setCurrentAllowance(allowance)
    }
    getAllowance()
  }, [token, address, provider, totalRequiredAllowance])

  // handle csv file upload
  const fileHandler = (event: any) => {
    event.preventDefault()
    const files = event.target.files
    if (files && files[0]) {
      const file = files[0]
      const fileExtension = file.name.split('.').pop().toLowerCase()
      
      if (fileExtension !== 'csv') {
        toast.error('Please upload a valid CSV file.')
        return
      }

      setFile(event.target.value)
      setFileUploaded(true)
      Papa.parse(file, {
        header: false,
        skipEmptyLines: true,
        complete: function ({ data }) {
          try {
            const recipients = data.map((i: any) => i[0])
            const airdropAmounts = data.map((i: any) =>
              BigNumber.from(i[1]).mul(BigNumber.from(10).pow(18)),
            )
            const generatedCalldata: any = [recipients, airdropAmounts]

            setTotalRequiredAllowance(
              sumBigNumbers(generatedCalldata[1]).add(BigNumber.from(1)),
            )
            // Parsed Data Response in array format
            setParsedData(data)
            // set calldata
            setCallData(generatedCalldata)
          } catch (error) {
            console.error("Parsing error:", error)
            toast.error(`Error processing CSV file: ${error.message}`)
            // Reset or update state as needed
            setParsedData([])
            setCallData([[], []])
          }
        },
        error: function (error) {
          console.error("Parsing error:", error)
          toast.error(`Error parsing CSV file: ${error.message}`)
          // Reset or update state as needed
          setParsedData([])
          setCallData([[], []])
        },
      })
    } else {
      toast.error('No file selected.')
    }
  }

  // set the selected token for airdrop
  const handleSelectToken = (e: any) => {
    console.log('Selected Token', e.target.value)
  }

  // Function to reset approval state
  const resetApproval = () => {
    setIsApprovalComplete(false)
    setCurrentAllowance(BN_ZERO)
    console.log('Approval state reset')
  }

  return {
    data: {
      tokens: { tokensDeployed, isTokensLoading },
      parsedData,
      isApprovalRequired,
      isApprovalComplete,
      currentAllowance,
      totalRequiredAllowance,
      approvalLoading,
      isAirdropComplete,
      airdropTokensData,
      isAirdropResultLoading,
      isAirdropSuccess,
      errors: [
        isApprovalWriteError,
        approvalWriteError,
        isPrepareAirdropError,
        prepareAirdropError,
        isAirdropWriteError,
        airdropWriteError,
      ],
    },
    actions: {
      fileHandler,
      handleSelectToken,
      approvalWrite,
      airdropTokensWrite,
      resetApproval, // Expose the reset function
    },
  }
}

export default useAirdropTokens



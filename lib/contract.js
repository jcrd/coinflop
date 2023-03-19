import { createRequire } from "module"

import { ethers } from "ethers"

const PCS_ADDR = "0x18B2A687610328590Bc8F2e5fEdDe3b582A49cdA"
const PCS_ABI = createRequire(import.meta.url)("../abi/pancakeswap.json")

export default function (endpoint, walletKey) {
  const provider = new ethers.JsonRpcProvider(endpoint)
  const wallet = new ethers.Wallet(walletKey)
  const signer = wallet.connect(provider)
  return {
    contract: new ethers.Contract(PCS_ADDR, PCS_ABI, signer),
    signerAddress: signer.address,
  }
}

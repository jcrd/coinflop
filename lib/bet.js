import { recordBet } from "./history.js"

export const Type = {
  Bear: "Bear",
  Bull: "Bull",
}

export async function place(contract, epoch, type, amount) {
  console.log(`Round ${epoch}: Placing ${type} bet...`)
  try {
    // const tx = await contract["bet" + type](epoch, {
    //   value: ethers.parseEther(amount),
    // })
    // await tx.wait()
    console.log(`Round ${epoch}: ${type} bet placed (${amount})`)
    recordBet(epoch, type, amount)
    return true
  } catch (e) {
    console.log(`Round ${epoch}: Failed to place ${type} bet: {e}`)
    return false
  }
}

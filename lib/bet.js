import { recordBet } from "./history.js"

export const Direction = {
  Bear: "Bear",
  Bull: "Bull",
}

export async function place(contract, epoch, direction, amount) {
  console.log(`Round ${epoch}: Placing ${direction} bet...`)
  try {
    // const tx = await contract["bet" + direction](epoch, {
    //   value: ethers.parseEther(amount),
    // })
    // await tx.wait()
    console.log(`Round ${epoch}: ${direction} bet placed (${amount})`)
    recordBet(epoch, direction, amount)
    return true
  } catch (e) {
    console.log(`Round ${epoch}: Failed to place ${direction} bet: {e}`)
    return false
  }
}

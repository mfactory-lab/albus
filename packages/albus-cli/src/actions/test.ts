/*
 * This file is part of Albus code.
 *
 * Copyright (c) 2023, mFactory GmbH
 *
 * Albus is free software: you can redistribute it
 * and/or modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * Albus is distributed in the hope that it
 * will be useful, but WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.
 * If not, see <https://www.gnu.org/licenses/agpl-3.0.html>.
 *
 * You can be released from the requirements of the Affero GNU General Public License
 * by purchasing a commercial license. The purchase of such a license is
 * mandatory as soon as you develop commercial activities using the
 * Albus code without disclosing the source code of
 * your own applications.
 *
 * The developer of this program can be contacted at <info@albus.finance>.
 */

import { AlbusClient } from '@mfactory-lab/albus-sdk'
import { Keypair, LAMPORTS_PER_SOL } from '@solana/web3.js'
import log from 'loglevel'
import { useContext } from '@/context'

interface Opts {}

export async function credential(_opts: Opts) {
  const { client, provider } = useContext()

  log.info(`Client user: ${client.provider.publicKey}`)
  log.info(`Client user: ${client.pda.authority()[0]}`)

  const holder = Keypair.fromSecretKey(Uint8Array.from([172, 133, 191, 140, 191, 31, 132, 203, 134, 210, 205, 29, 225, 174, 73, 251, 88, 74, 105, 44, 197, 253, 181, 5, 34, 208, 65, 13, 83, 55, 238, 192, 238, 140, 41, 113, 58, 126, 110, 164, 91, 104, 244, 47, 206, 54, 93, 38, 95, 166, 71, 10, 96, 93, 214, 80, 64, 42, 112, 34, 88, 82, 66, 222]))
  log.info(`Holder pk: ${holder.publicKey}`)
  // log.info(`Holder sk: ${holder.secretKey}`)

  const balance = await provider.connection.getBalance(holder.publicKey)
  log.info(`Balance: ${balance}`)

  if (balance === 0) {
    log.info('Airdropping 2 SOL...')
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(holder.publicKey, 2 * LAMPORTS_PER_SOL),
    )
  }

  const holderClient = AlbusClient.keypair(provider.connection, holder)

  log.info('Creating new NFT...')
  const { mintAddress } = await holderClient.credential.create({})

  console.log(`mintAddress: ${mintAddress}`)

  log.info('Updating new NFT...')
  const res = await client.credential.update({
    mint: mintAddress,
    owner: holder.publicKey,
    uri: 'https://exmaple.com',
  })
  console.log(res)

  log.info('Revoking NFT...')
  await holderClient.credential.revoke({
    mint: mintAddress,
  })

  // const logoUri = await metaplex.storage().upload(
  //   toMetaplexFile(readFileSync('./assets/logo.svg'), 'logo.svg'),
  // )

  // console.log(logoUri)

  //
  // // const sharedSecret = await nobleED25519.getSharedSecret(keypair.secretKey.slice(32), ekp.publicKey.toBytes())
  // // const sharedSecret = sharedKey(convertSecretKey(keypair.secretKey), convertPublicKey(ekp.publicKey.toBytes()))
  // // const scp = nobleED25519.Point.fromHex(sharedSecret)
  // const sk = [1n, 2n]
  //
  // const message = JSON.stringify([
  //   '2ouc1TskoUHcDAyUefQYMzV2FYN8HQpAdXaB9wh4gZFd',
  //   '33eztcFxyqFJGgUmcKNoDBTEwY62F75XSSoSPjToo2kj',
  //   '3PaGBt2GjJPewk1ZPEz9VXnYSD248b6HA2BuXE9xerYo',
  // ])
  //
  // const chunkSize = 20
  //
  // const msgBuf = Uint8Array.from(Buffer.from(message))
  // const msgChunks = sliceIntoChunks(msgBuf, 20)
  //
  // const msg: any[] = []
  //
  // for (const msgChunk of msgChunks) {
  //   msg.push(bytesToBigInt(msgChunk))
  // }
  //
  // console.log(msg)

  // const enc = crypto.poseidonEncrypt(msg, sk)
  // const dec = crypto.poseidonDecrypt(enc, sk, msg.length)
  //
  // const b: number[] = []
  // for (const d of dec) {
  //   b.push(...bigIntToArray(d, chunkSize))
  // }
  // console.log(dec)
  // console.log(toUTF8String(Uint8Array.from(b)))
  // process.exit(0)
}

// function sliceIntoChunks(arr, chunkSize) {
//   const res = []
//   for (let i = 0; i < arr.length; i += chunkSize) {
//     const chunk = arr.slice(i, i + chunkSize)
//     res.push(chunk as never)
//   }
//   return res
// }

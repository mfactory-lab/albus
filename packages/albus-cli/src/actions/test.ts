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

import { readFileSync } from 'node:fs'
import { toMetaplexFile } from '@metaplex-foundation/js'
import { useContext } from '@/context'

interface Opts {}

export async function encryption(_opts: Opts) {
  const { metaplex } = useContext()

  const logoUri = await metaplex.storage().upload(
    toMetaplexFile(readFileSync('./assets/logo.svg'), 'logo.svg'),
  )

  console.log(logoUri)

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
  //   msg.push(arrayToBigInt(msgChunk))
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

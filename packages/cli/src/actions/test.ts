import { Buffer } from 'node:buffer'
import fs from 'node:fs'
import { toMetaplexFile } from '@metaplex-foundation/js'
import { crypto } from '@albus/core'
import { useContext } from '../context'

interface Opts {}

const { arrayToBigInt, bigIntToArray, toUTF8String } = crypto.utils

export async function encryption(_opts: Opts) {
  const { metaplex, keypair } = useContext()

  const logoUri = await metaplex.storage().upload(
    toMetaplexFile(fs.readFileSync('./assets/logo.svg'), 'logo.svg'),
  )

  console.log(logoUri)
  return

  // const sharedSecret = await nobleED25519.getSharedSecret(keypair.secretKey.slice(32), ekp.publicKey.toBytes())
  // const sharedSecret = sharedKey(convertSecretKey(keypair.secretKey), convertPublicKey(ekp.publicKey.toBytes()))
  // const scp = nobleED25519.Point.fromHex(sharedSecret)
  const sk = [1n, 2n]

  const message = JSON.stringify([
    '2ouc1TskoUHcDAyUefQYMzV2FYN8HQpAdXaB9wh4gZFd',
    '33eztcFxyqFJGgUmcKNoDBTEwY62F75XSSoSPjToo2kj',
    '3PaGBt2GjJPewk1ZPEz9VXnYSD248b6HA2BuXE9xerYo',
  ])

  const chunkSize = 20

  const msgBuf = Uint8Array.from(Buffer.from(message))
  const msgChunks = sliceIntoChunks(msgBuf, 20)

  const msg: any[] = []

  for (const msgChunk of msgChunks) {
    msg.push(arrayToBigInt(msgChunk))
  }

  console.log(msg)

  const enc = crypto.poseidonEncrypt(msg, sk)
  const dec = crypto.poseidonDecrypt(enc, sk, msg.length)

  const b: number[] = []
  for (const d of dec) {
    b.push(...bigIntToArray(d, chunkSize))
  }
  console.log(dec)
  console.log(toUTF8String(Uint8Array.from(b)))
  process.exit(0)
}

function sliceIntoChunks(arr, chunkSize) {
  const res = []
  for (let i = 0; i < arr.length; i += chunkSize) {
    const chunk = arr.slice(i, i + chunkSize)
    res.push(chunk as never)
  }
  return res
}

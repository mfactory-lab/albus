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

import type { Buffer } from 'node:buffer'
import axios from 'axios'
import { utils as AnchorUtils } from '@coral-xyz/anchor'
import type { Creator } from '@metaplex-foundation/mpl-token-metadata'
import { PublicKey } from '@solana/web3.js'
import type { AccountInfo, Connection, PublicKeyInitData } from '@solana/web3.js'
import { PROGRAM_ID as METADATA_PROGRAM_ID, Metadata } from '@metaplex-foundation/mpl-token-metadata'
import chunk from 'lodash/chunk'
import type { AlbusNftCode } from '../types'
import { NFT_SYMBOL_PREFIX } from '../constants'

export async function getSolanaTimestamp(connection: Connection) {
  const slot = await connection.getSlot()
  return (await connection.getBlockTime(slot)) ?? 0
}

export type ValidateNftProps = {
  authority: PublicKeyInitData
  code?: AlbusNftCode
  creators?: Creator[]
}

/**
 * Validate NFT Metadata
 * @param nft
 * @param props
 */
export function validateNft(nft: Metadata, props: ValidateNftProps) {
  if (props.authority && nft.updateAuthority.toString() !== new PublicKey(props.authority).toString()) {
    throw new Error('Unauthorized NFT')
  }

  if (props.code) {
    const symbol = `${NFT_SYMBOL_PREFIX}-${props.code}`
    if (nft.data.symbol !== symbol) {
      throw new Error(`Invalid NFT Symbol. Expected: ${symbol}`)
    }
  }

  if (props.creators && !props.creators.every(c => (nft.data.creators ?? []).includes(c))) {
    throw new Error('Invalid NFT creator')
  }
}

/**
 * Load and validate NFT Metadata
 * @param connection
 * @param mint
 * @param validate
 */
export async function loadNft(connection: Connection, mint: PublicKeyInitData, validate: ValidateNftProps) {
  const metadata = await getMetadataByMint(connection, mint, true)
  if (!metadata) {
    throw new Error(`Unable to find Metadata account at ${mint}`)
  }
  validateNft(metadata, validate)
  return metadata
}

/**
 * Load Metadata by accountInfo
 * @param accountInfo
 * @param loadJson
 */
export async function getMetadataByAccountInfo(accountInfo: AccountInfo<Buffer>, loadJson = false) {
  const metadata = sanitizeMetadata(Metadata.fromAccountInfo(accountInfo)[0]) as ExtendedMetadata
  if (loadJson) {
    try {
      metadata.json = (await axios.get(metadata.data.uri)).data
    } catch (e) {
      console.log('Error: Failed to load NFT metadata')
      metadata.json = {}
    }
  }
  return metadata
}

/**
 * Load Metadata by mint address
 * @param connection
 * @param mint
 * @param loadJson
 */
export async function getMetadataByMint(connection: Connection, mint: PublicKeyInitData, loadJson = false) {
  const accountInfo = await connection.getAccountInfo(getMetadataPDA(mint))
  if (accountInfo) {
    return getMetadataByAccountInfo(accountInfo, loadJson)
  }
}

/**
 * Load multiple metadata accounts for {@link owner}
 * Can be optionally filtered by {@link filter}
 * @param connection
 * @param owner
 * @param filter
 */
export async function getParsedNftAccountsByOwner(connection: Connection, owner: PublicKey, filter?: Omit<FindMetadataAccounts, 'mints'>) {
  const { value: splAccounts } = await connection.getParsedTokenAccountsByOwner(
    owner,
    { programId: AnchorUtils.token.TOKEN_PROGRAM_ID },
  )

  const mints = splAccounts
    .filter((t) => {
      const amount = t.account?.data?.parsed?.info?.tokenAmount?.uiAmount
      const decimals = t.account?.data?.parsed?.info?.tokenAmount?.decimals
      return decimals === 0 && amount === 1
    })
    .map((t) => {
      const address = t.account?.data?.parsed?.info?.mint
      return new PublicKey(address)
    })

  return findMetadataAccounts(connection, { ...filter, mints })
}

export async function getParsedNftAccountsByUpdateAuthority(connection: Connection, updateAuthority: PublicKey) {
  try {
    const res = await connection.getProgramAccounts(METADATA_PROGRAM_ID, {
      encoding: 'base64',
      // dataSlice: { offset: 0, length: 0 },
      filters: [
        {
          memcmp: {
            offset: 1,
            bytes: updateAuthority.toBase58(),
          },
        },
      ],
    })
    return res.map(acc => sanitizeMetadata(Metadata.deserialize(acc.account.data)[0]))
  } catch (err) {
    console.error(err)
    return []
  }
}

type FindMetadataAccounts = {
  mints: PublicKey[]
  updateAuthority?: PublicKeyInitData
  symbol?: string
  name?: string
  uri?: string
  // default: 100
  chunkSize?: number
  withJson?: boolean
}

export type ExtendedMetadata = Metadata & { json: Record<string, any> | null }

/**
 * Load multiple metadata with selected {@link props.mints}
 * @param connection
 * @param props
 */
export async function findMetadataAccounts(connection: Connection, props: FindMetadataAccounts): Promise<ExtendedMetadata[]> {
  let rawAccounts: (AccountInfo<any> | null)[] = []

  for (const pubKeys of chunk(props.mints.map(getMetadataPDA), props.chunkSize ?? 100)) {
    rawAccounts = [...rawAccounts, ...await connection.getMultipleAccountsInfo(pubKeys)]
  }

  rawAccounts = rawAccounts.filter(a => a !== null)

  // There is no reason to continue processing
  // if mints don't have an associated metadata account. Just return []
  if (!rawAccounts?.length || rawAccounts?.length === 0) {
    return []
  }

  // Decode data from Buffer to readable objects
  const accounts = rawAccounts.map(acc => ({
    ...sanitizeMetadata(Metadata.fromAccountInfo(acc!)[0]),
    json: null,
  })) as ExtendedMetadata[]

  const filteredAccounts = accounts.filter((acc) => {
    let valid = true
    if (props.updateAuthority !== undefined) {
      valid &&= acc.updateAuthority.toString() === new PublicKey(props.updateAuthority).toString()
    }
    if (props.symbol !== undefined) {
      valid &&= acc.data.symbol.startsWith(props.symbol)
    }
    if (props.name !== undefined) {
      valid &&= acc.data.name.includes(props.name)
    }
    if (props.uri !== undefined) {
      const uri = sanitizeString(acc.data.uri)
      valid &&= props.uri === '' ? uri === '' : uri.startsWith(props.uri)
    }
    return valid
  })

  if (props.withJson) {
    return Promise.all(
      filteredAccounts
        .map(acc => /^https?:\/\//.test(sanitizeString(acc.data.uri))
          ? axios.get(acc.data.uri)
            .then((r) => {
              acc.json = r.data
              return acc
            })
            .catch(_e => acc)
          : Promise.resolve(acc),
        ),
    )
  }

  return filteredAccounts
}

/**
 * Remove all empty space, new line, etc. symbols
 * In some reason such symbols parsed back from Buffer looks weird
 * like "\x0000" instead of usual spaces.
 * @param str
 */
function sanitizeString(str: string) {
  return str.replace(/\0/g, '')
}

function sanitizeMetadata(tokenData: Metadata) {
  return ({
    ...tokenData,
    data: {
      ...tokenData?.data,
      name: sanitizeString(tokenData?.data?.name),
      symbol: sanitizeString(tokenData?.data?.symbol),
      uri: sanitizeString(tokenData?.data?.uri),
    },
  }) as Metadata
}

export function getMetadataPDA(mint: PublicKeyInitData): PublicKey {
  return PublicKey.findProgramAddressSync(
    [
      new TextEncoder().encode('metadata'),
      METADATA_PROGRAM_ID.toBuffer(),
      new PublicKey(mint).toBuffer(),
    ],
    METADATA_PROGRAM_ID,
  )[0]
}

export function getMasterEditionPDA(mint: PublicKeyInitData) {
  return PublicKey.findProgramAddressSync(
    [
      new TextEncoder().encode('metadata'),
      METADATA_PROGRAM_ID.toBuffer(),
      new PublicKey(mint).toBuffer(),
      new TextEncoder().encode('edition'),
    ],
    METADATA_PROGRAM_ID,
  )[0]
}

export function getAssociatedTokenAddress(
  mint: PublicKey,
  owner: PublicKey,
  allowOwnerOffCurve = false,
  programId = AnchorUtils.token.TOKEN_PROGRAM_ID,
  associatedTokenProgramId = AnchorUtils.token.ASSOCIATED_PROGRAM_ID,
) {
  if (!allowOwnerOffCurve && !PublicKey.isOnCurve(owner.toBuffer())) {
    throw new Error('Invalid token owner account')
  }

  return PublicKey.findProgramAddressSync(
    [owner.toBuffer(), programId.toBuffer(), mint.toBuffer()],
    associatedTokenProgramId,
  )[0]
}

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

import { vc } from '@albus/core'
import log from 'loglevel'
import { generateCredentialSubject, mintVerifiableCredentialNFT } from './utils'
import { useContext } from '@/context'
import { exploreAddress } from '@/utils'

interface Opts {
  // provider: string
  encrypt: boolean
}

/**
 * Issue new Verifiable Credential
 */
export async function issue(opts: Opts) {
  const { keypair, config } = useContext()

  const claims = generateCredentialSubject()

  // Issue new Verifiable Credential
  const res = await vc.createVerifiableCredential(claims, {
    signerSecretKey: config.issuerSecretKey,
    encrypt: opts.encrypt,
    holder: keypair.publicKey,
    aud: [config.issuerDid],
  })

  // Generate new VC-NFT
  const nft = await mintVerifiableCredentialNFT({
    credentialRoot: res.credentialRoot,
    vc: res.payload,
  })

  log.info('Done')
  log.info(`Mint: ${nft.address}`)
  log.info(exploreAddress(nft.address))

  process.exit(0)
}

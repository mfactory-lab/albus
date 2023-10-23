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

import type { ProofRequest } from '@mfactory-lab/albus-sdk'
import { AlbusClient } from '@mfactory-lab/albus-sdk'
import { PublicKey } from '@solana/web3.js'
import { useAnchorWallet } from 'solana-wallets-vue'

export function useAlbus() {
  const connectionStore = useConnectionStore()
  const wallet = useAnchorWallet()
  // let client = AlbusClient.factory(connectionStore.connection)

  const client = computed(() => {
    return AlbusClient.factory(connectionStore.connection, wallet.value ?? { publicKey: PublicKey.default } as any)
  })

  const state = reactive({
    userPrivateKey: [156, 231, 50, 119, 29, 160, 68, 192, 204, 224, 175, 22, 158, 203, 7, 203, 175, 79, 39, 61, 204, 174, 114, 231, 149, 151, 117, 140, 158, 255, 66, 41, 124, 57, 232, 127, 220, 24, 36, 247, 90, 241, 69, 122, 228, 126, 216, 40, 227, 117, 243, 139, 177, 64, 160, 194, 195, 185, 182, 7, 43, 166, 105, 140],
    creds: [] as any,
    credsLoading: false,
    requests: [] as { pubkey: PublicKey; data: ProofRequest | null }[],
    requestsLoading: false,
  })

  watch(wallet, async (w) => {
    if (w !== undefined) {
      state.credsLoading = true
      state.requestsLoading = true
      const res = await Promise.all([
        client.value.credential.loadAll({
          decryptionKey: state.userPrivateKey,
        }),
        client.value.proofRequest.find({
          // ...
        }),
      ])
      state.creds = res[0]
      state.requests = res[1]
      state.credsLoading = false
      state.requestsLoading = false
    }
  })

  return {
    state,
    client,
  }
}

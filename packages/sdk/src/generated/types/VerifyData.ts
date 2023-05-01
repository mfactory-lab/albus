/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as beet from '@metaplex-foundation/beet'
import type { ZKPRequestStatus } from './ZKPRequestStatus'
import { zKPRequestStatusBeet } from './ZKPRequestStatus'

export interface VerifyData {
  status: ZKPRequestStatus
}

/**
 * @category userTypes
 * @category generated
 */
export const verifyDataBeet = new beet.BeetArgsStruct<VerifyData>(
  [['status', zKPRequestStatusBeet]],
  'VerifyData',
)

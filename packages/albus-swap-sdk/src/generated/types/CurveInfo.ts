/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as beet from '@metaplex-foundation/beet'
export type CurveInfo = {
  curveType: number
  curveParameters: number[] /* size: 32 */
}

/**
 * @category userTypes
 * @category generated
 */
export const curveInfoBeet = new beet.BeetArgsStruct<CurveInfo>(
  [
    ['curveType', beet.u8],
    ['curveParameters', beet.uniformFixedSizeArray(beet.u8, 32)],
  ],
  'CurveInfo'
)

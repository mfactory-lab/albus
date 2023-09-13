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

import { Buffer } from 'node:buffer'
import { assert, describe, it } from 'vitest'
import { bytesToFinite, decodeVerifyingKey, encodeVerifyingKey, finiteToBytes } from '../src/zkp'

describe('test', () => {
  const encodeVal = (s: any) => {
    try {
      return BigInt(s)
    } catch (e) {
      return `0x${Buffer.from(String(s)).toString('hex')}`
    }
  }

  it('#12', async () => {
    const x = 'asdasAasd2d[122]'.match(/^(\w+)(?:\[(\d+)\])?$/)

    console.log(x)
  })

  it('#1', async () => {
    console.log(encodeVal('123'))
    console.log(encodeVal('asdads'))
    console.log(encodeVal('test'))
    console.log(encodeVal(123))
    console.log(encodeVal(11.22))
  })

  it('test finite helpers', async () => {
    const n = '1662767948258934355069791443487100820038153707701411290986741440889424297316'
    const bytes = finiteToBytes(n)
    assert.equal(n, bytesToFinite(bytes).toString())
  })

  it('test encode decode VK', async () => {
    const vk = {
      protocol: 'groth16',
      curve: 'bn128',
      nPublic: 1,
      vk_alpha_1: [
        '20491192805390485299153009773594534940189261866228447918068658471970481763042',
        '9383485363053290200918347156157836566562967994039712273449902621266178545958',
        '1',
      ],
      vk_beta_2: [
        [
          '6375614351688725206403948262868962793625744043794305715222011528459656738731',
          '4252822878758300859123897981450591353533073413197771768651442665752259397132',
        ],
        [
          '10505242626370262277552901082094356697409835680220590971873171140371331206856',
          '21847035105528745403288232691147584728191162732299865338377159692350059136679',
        ],
        [
          '1',
          '0',
        ],
      ],
      vk_gamma_2: [
        [
          '10857046999023057135944570762232829481370756359578518086990519993285655852781',
          '11559732032986387107991004021392285783925812861821192530917403151452391805634',
        ],
        [
          '8495653923123431417604973247489272438418190587263600148770280649306958101930',
          '4082367875863433681332203403145435568316851327593401208105741076214120093531',
        ],
        [
          '1',
          '0',
        ],
      ],
      vk_delta_2: [
        [
          '10857046999023057135944570762232829481370756359578518086990519993285655852781',
          '11559732032986387107991004021392285783925812861821192530917403151452391805634',
        ],
        [
          '8495653923123431417604973247489272438418190587263600148770280649306958101930',
          '4082367875863433681332203403145435568316851327593401208105741076214120093531',
        ],
        [
          '1',
          '0',
        ],
      ],
      IC: [
        [
          '925402568810121956987317348699904710217796559306478237167131375899389694526',
          '3351180223018750063925248525996672725665933163870666127250492017223167027179',
          '1',
        ],
        [
          '19241195148067764614836915881746199779574327641842635166493459093959666127333',
          '18184405381661422952479483946463041138608179456884514815488709490810757258881',
          '1',
        ],
      ],
    }

    const bytes = encodeVerifyingKey(vk)
    assert.deepEqual(vk, decodeVerifyingKey(bytes))
  })
})

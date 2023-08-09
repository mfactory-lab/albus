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

import type { VerifiablePresentation } from '@mfactory-lab/albus-core'
import type { Circuit, Policy } from '../generated'
import { KnownSignals } from '../types'

/**
 * Format {@link date} in circuit format `20230101`
 */
export function formatCircuitDate(date?: Date) {
  const d = date ?? new Date()
  return [
    String(d.getUTCFullYear()),
    String(d.getUTCMonth() + 1).padStart(2, '0'),
    String(d.getUTCDate()).padStart(2, '0'),
  ].join('')
}

interface PrepareInputs {
  vp: VerifiablePresentation
  circuit: Circuit
  policy: Policy
  now?: Date
}

/**
 * Generate circuit inputs
 */
export async function prepareInputs({ vp, circuit, policy, now }: PrepareInputs) {
  if (vp.verifiableCredential === undefined || vp.verifiableCredential[0] === undefined) {
    throw new Error('invalid presentation, at least one credential required')
  }

  const input: any = {}
  const normalizeClaimKey = s => s.trim()

  // convert signal name `sig[5]` > ['sig', 5]
  const parseSignal = (s): [string, number] => {
    const r = s.match(/^(\w+)(?:\[(\d+)\])?$/)
    return [r[1], r[2] ? Number(r[2]) : 1]
  }

  const vc = vp.verifiableCredential[0]

  // apply private inputs
  for (const signal of circuit.privateSignals) {
    const claim = normalizeClaimKey(signal)
    if (vc.credentialSubject[claim] === undefined || vc.credentialSubject['@proof']?.[claim] === undefined) {
      throw new Error(`invalid presentation claim ${claim}`)
    }
    const [key, ...proof] = vc.credentialSubject['@proof'][claim]
    input[signal] = vc.credentialSubject[claim] ?? 0
    input[`${signal}Proof`] = proof
    input[`${signal}Key`] = key
  }

  // apply public inputs
  let idx = 0
  for (const signal of circuit.publicSignals) {
    const [signalName, signalSize] = parseSignal(signal)
    switch (signal) {
      case KnownSignals.CurrentDate: {
        input[signalName] = formatCircuitDate(now)
        break
      }
      case KnownSignals.CredentialRoot:
        input[signalName] = vc.proof.rootHash
        break
      case KnownSignals.IssuerPk:
        input[signalName] = [
          vc.proof.proofValue.ax,
          vc.proof.proofValue.ay,
        ]
        break
      case KnownSignals.IssuerSignature:
        input[signalName] = [
          vc.proof.proofValue.r8x,
          vc.proof.proofValue.r8y,
          vc.proof.proofValue.s,
        ]
        break
      default: {
        // apply policy rules
        const value = policy.rules?.find(r => r.index === idx)?.value
        if (value !== undefined) {
          input[signal] = value
        }
      }
    }
    idx += signalSize
  }

  return input
}

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

declare module 'snarkjs' {
  type ProofData = {
    readonly pi_a: readonly (string | bigint)[];
    readonly pi_b: readonly (readonly (string | bigint)[])[];
    readonly pi_c: readonly (string | bigint)[];
    readonly protocol: string;
    readonly curve: string;
  };

  type PublicSignals = readonly (string | bigint)[];

  type SNARK = {
    readonly proof: ProofData;
    readonly publicSignals: PublicSignals;
  };

  type VK = {
    readonly nPublic: number;
    readonly curve: string;
    readonly vk_alpha_1: number[];
    readonly vk_beta_2: number[][];
    readonly vk_gamma_2: number[][];
    readonly vk_delta_2: number[][];
    readonly IC: number[][];
  };

  const groth16: {
    readonly fullProve: (
      input: {
        readonly [key: string]:
          | bigint | number
          | readonly bigint[] | readonly number[]
          | readonly (readonly bigint[])[] | readonly (readonly number[])[];
      },
      wasmFile: string | { type: string, data: Uint8Array },
      zkeyFileName: string | { type: string, data: Uint8Array },
      logger?: unknown,
    ) => Promise<SNARK>;
    readonly prove: (
      zkeyFileName: string,
      witnessFilename: string,
      logger?: unknown,
    ) => Promise<SNARK>;
    readonly verify: (
      vkVerifier: VK,
      publicSignals: PublicSignals,
      proof: ProofData,
      logger?: unknown,
    ) => Promise<boolean>;
  };

  const plonk: {
    exportSolidityCallData: any;
    fullProve: any;
    prove: any;
    setup: any;
    verify: any;
  };

  const powersOfTau: {
    beacon: any;
    challengeContribute: any;
    contribute: any;
    convert: any;
    exportChallenge: any;
    exportJson: any;
    importResponse: any;
    newAccumulator: any;
    preparePhase2: any;
    truncate: any;
    verify: any;
  };

  const r1cs: {
    exportJson: (r1csName: string, logger?: unknown) => Promise<any>;
    info: (r1csName: string, logger?: unknown) => Promise<any>;
    print: (params: object, options: object) => Promise<any>;
  };

  const wtns: {
    calculate: any;
    debug: any;
    exportJson: any;
  };

  const zKey: {
    beacon: any;
    bellmanContribute: any;
    contribute: any;
    exportBellman: any;
    exportJson: any;
    exportSolidityVerifier: any;
    exportVerificationKey: (zkeyName: string | { type: string }) => Promise<VK>;
    importBellman: any;
    newZKey: (r1csName: string, ptauName: string, zkeyName: string | { type: string }, logger?: unknown) => Promise<any>;
    verifyFromInit: any;
    verifyFromR1cs: any;
  };

  export { ProofData, PublicSignals, VK, groth16, plonk, powersOfTau, r1cs, wtns, zKey };
}

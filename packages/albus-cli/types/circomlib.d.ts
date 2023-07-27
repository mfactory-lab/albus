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

declare module 'circomlibjs' {
  type FromMontgomery = (p: Uint8Array) => Uint8Array;
  type ToMontgomery = (p: Uint8Array) => Uint8Array;

  export interface BJJSignature {
    R8: [Uint8Array, Uint8Array];
    S: bigint;
  }

  interface EdDSA {
    verifyPoseidon(msg: Uint8Array, sig: BJJSignature, A: Uint8Array[]): boolean;

    signPoseidon(prv: Uint8Array, msg: Uint8Array | any): BJJSignature;

    prv2pub(prv: Uint8Array): [Uint8Array, Uint8Array];

    F: {
      fromMontgomery: FromMontgomery;
      toMontgomery: ToMontgomery;
      p: bigint;
    };
  }

  function buildEddsa(): Promise<EdDSA>;

  // BabyJubJub

  interface BabyJub {
    inCurve(p: Uint8Array[]): boolean;

    packPoint(buf: Uint8Array[]): Uint8Array;

    unpackPoint(buf: Uint8Array): [Uint8Array, Uint8Array];

    D: bigint;
    p: any; // Scalar
    F: {
      fromMontgomery: FromMontgomery
      toMontgomery: ToMontgomery
      toObject: any
      toString: any
      e: any
      p: bigint
    };
  }

  function buildBabyjub(): Promise<BabyJub>;

  // SMT

  function buildSMT(db: any, root: SmtInternalValue): Promise<SMT>;

  function newMemEmptyTrie(): Promise<SMT>;

  export type SmtRoot = any; // TODO: Uint8Array(32)
  export type SmtKey = any; // TODO: Uint8Array(32)
  export type SmtLeafValue = any; // TODO: Uint8Array(32)
  export type SmtInternalValue = Uint8Array; // TODO: Uint8Array(32)

  export interface SMT {
    F: {
      toString(s: any): string
    };
    root: SmtInternalValue;

    hash0(): SmtInternalValue;

    hash1(): SmtInternalValue;

    insert(key: SmtKey, value: SmtLeafValue): Promise<InsertIntoSmtResponse>;

    update(key: SmtKey, newValue: SmtLeafValue): Promise<UpdateSmtResponse>;

    delete(key: SmtKey): Promise<DeleteFromSmtResponse>;

    find(key: SmtKey): Promise<FindFromSmtResponse>;
  }

  export type InsertIntoSmtResponse = {
    oldRoot: SmtInternalValue;
    oldKey: SmtKey;
    oldValue: SmtLeafValue;
    siblings: SmtInternalValue[];
    newRoot: SmtRoot;
    isOld0: boolean;
  };

  export type UpdateSmtResponse = {
    oldRoot: SmtInternalValue;
    oldKey: SmtKey;
    oldValue: SmtLeafValue;
    newKey: SmtKey;
    newValue: SmtLeafValue;
    siblings: SmtInternalValue[];
    newRoot: SmtRoot;
  };

  export type DeleteFromSmtResponse = {
    oldRoot: SmtInternalValue;
    oldKey: SmtKey;
    oldValue: SmtLeafValue;
    delKey: SmtKey;
    delValue: SmtLeafValue;
    siblings: SmtInternalValue[];
    newRoot: SmtRoot;
    isOld0: boolean;
  };

  export type FindFromSmtResponse = {
    found: true;
    foundValue: SmtLeafValue;
    siblings: SmtInternalValue[];
    isOld0: boolean;
  } | {
    found: false;
    notFoundValue: SmtLeafValue;
    siblings: never[];
    isOld0: boolean;
  };

  // poseidon

  interface PoseidonFunction {
    (inputs: Uint8Array[]): Uint8Array;

    F: {
      fromMontgomery: FromMontgomery;
      toMontgomery: ToMontgomery;
    };
  }

  function buildPoseidon(): Promise<PoseidonFunction>;

  function buildPoseidonOpt(): Promise<PoseidonFunction>;

  namespace poseidonContract {
    export function createCode(size: number): string;
  }
}

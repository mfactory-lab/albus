declare module 'circomlibjs' {
  declare type FromMontgomery = (Uint8Array) => Uint8Array;
  declare type ToMontgomery = (Uint8Array) => Uint8Array;

  export interface CircomlibSignature {
    R8: [Uint8Array, Uint8Array];
    S: bigint;
  }

  declare interface EdDSA {
    verifyPoseidon(msg: Uint8Array, sig: CircomlibSignature, A: Uint8Array[]): boolean;

    signPoseidon(prv: Uint8Array, msg: Uint8Array): CircomlibSignature;

    prv2pub(prv: Uint8Array): [Uint8Array, Uint8Array];

    F: {
      fromMontgomery: FromMontgomery;
      toMontgomery: ToMontgomery;
      p: bigint;
    };
  }

  declare function buildEddsa(): Promise<EdDSA>;

  // BabyJup

  declare interface BabyJup {
    unpackPoint(buf: Uint8Array): [Uint8Array, Uint8Array]
    D: bigint
    p: any // Scalar
    F: {
      fromMontgomery: FromMontgomery;
      toMontgomery: ToMontgomery;
      p: bigint;
    };
  }

  declare function buildBabyjub(): Promise<BabyJup>;

  // SMT

  declare function buildSMT(db: any, root: SmtInternalValue): Promise<SMT>;
  declare function newMemEmptyTrie(): Promise<SMT>;

  export type SmtKey = any; // TODO: Uint8Array(32)
  export type SmtLeafValue = any; // TODO: Uint8Array(32)
  export type SmtInternalValue = any; // TODO: Uint8Array(32)

  export interface SMT {
    root: SmtInternalValue;
    hash0(): SmtInternalValue;
    hash1(): SmtInternalValue;
    F: any;
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
  export type FindFromSmtResponse =
    | {
    found: true;
    foundValue: SmtLeafValue;
    siblings: SmtInternalValue[];
    isOld0: boolean;
  }
    | {
    found: false;
    notFoundValue: SmtLeafValue;
    siblings: never[];
    isOld0: boolean;
  };

  // poseidon

  declare interface PoseidonFunction {
    (inputs: Uint8Array[]): Uint8Array;

    F: {
      fromMontgomery: FromMontgomery;
      toMontgomery: ToMontgomery;
    };
  }

  declare function buildPoseidon(): Promise<PoseidonFunction>;

  declare function buildPoseidonOpt(): Promise<PoseidonFunction>;

  namespace poseidonContract {
    export function createCode(size: number): string;
  }
}

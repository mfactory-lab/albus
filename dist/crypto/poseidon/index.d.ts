type EcdhSharedKey = BigInt[];
declare function poseidonStrategy(state: any): any;
declare function genRandomNonce(): BigInt;
declare function poseidonEncrypt(msg: any[], sharedKey: EcdhSharedKey, nonce?: bigint): BigInt[];
declare function poseidonDecrypt(ciphertext: BigInt[], sharedKey: EcdhSharedKey, length: number, nonce?: BigInt): any[];
export { poseidonStrategy, poseidonEncrypt, poseidonDecrypt, genRandomNonce, };
//# sourceMappingURL=index.d.ts.map
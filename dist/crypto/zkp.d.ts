declare const hash: {
    poseidon: (inputs: Uint8Array[]) => Promise<Uint8Array>;
};
declare const edBabyJubJub: {
    /**
     * Convert eddsa-babyjubjub private key to public key
     *
     * @param privateKey - babyjubjub private key
     * @returns public key
     */
    privateKeyToPublicKey(privateKey: Uint8Array): Promise<[Uint8Array, Uint8Array]>;
    /**
     * Generates a random babyJubJub point
     *
     * @returns random point
     */
    genRandomPoint(): Promise<Uint8Array>;
    /**
     * Creates eddsa-babyjubjub signature with poseidon hash
     *
     * @param key - private key
     * @param msg - message to sign
     * @returns signature
     */
    signPoseidon(key: Uint8Array, msg: Uint8Array): Promise<{
        s: Uint8Array;
        r8: Uint8Array[];
    }>;
};
export { hash, edBabyJubJub };
//# sourceMappingURL=zkp.d.ts.map
/// <reference types="node" />
import { Buffer } from 'node:buffer';
import { Keypair } from '@solana/web3.js';
import type { PublicKey } from '@solana/web3.js';
export declare const XC20P_IV_LENGTH = 24;
export declare const XC20P_TAG_LENGTH = 16;
export declare const XC20P_EPK_LENGTH = 32;
export type PrivateKey = number[] | string | Buffer | Uint8Array;
/**
 * Create a Solana keypair object from a x25519 private key
 * @param privateKey
 */
export declare function makeKeypair(privateKey: PrivateKey): Keypair;
/**
 * Encrypt a message with a {@link pubKey}
 */
export declare function encrypt(message: string, pubKey: PublicKey, ephemeralKey?: PrivateKey): Promise<string>;
/**
 * Decrypt an encrypted message with the {@link privateKey} that was used to encrypt it
 */
export declare function decrypt(encryptedMessage: string, privateKey: PrivateKey): Promise<string>;
//# sourceMappingURL=xc20p.d.ts.map
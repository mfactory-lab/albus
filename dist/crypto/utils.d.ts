export declare function arrayToByteLength(byteArray: Uint8Array, length: number): Uint8Array;
/**
 * Convert typed byte array to bigint
 *
 * @param array - Array to convert
 * @returns bigint
 */
export declare function arrayToBigInt(array: Uint8Array): bigint;
/**
 * Convert bigint to byte array
 *
 * @param bn - bigint
 * @param length - length of resulting byte array, 0 to return byte length of integer
 * @returns byte array
 */
export declare function bigIntToArray(bn: bigint, length: number): Uint8Array;
/**
 * Convert byte array to hex string
 *
 * @param array - byte array
 * @param prefix - prefix with 0x
 * @returns hex string
 */
export declare function arrayToHexString(array: Uint8Array, prefix?: boolean): string;
/**
 * Convert hex string to byte array
 *
 * @param hexString - hex string
 * @returns byte array
 */
export declare function hexStringToArray(hexString: string): Uint8Array;
/**
 * Split bytes into array of chunks
 *
 * @param data - data to chunk
 * @param size - size of chunks
 * @returns chunked data
 */
export declare function chunk(data: Uint8Array, size: number): Uint8Array[];
/**
 * Combines Uint8Array chunks
 *
 * @param chunks - chunks to combine
 * @returns combined data
 */
export declare function combine(chunks: Uint8Array[]): Uint8Array;
/**
 * Pads bytes to length
 *
 * @param data - bytes to pad
 * @param length - length to pad to
 * @param side - side to add padding
 * @returns padded data
 */
export declare function padToLength(data: Uint8Array, length: number, side: 'left' | 'right'): Uint8Array;
/**
 * Converts utf8 bytes to string
 *
 * @param data - bytes to decode
 * @returns decoded string
 */
export declare function toUTF8String(data: Uint8Array): string;
/**
 * Converts string to bytes
 *
 * @param string - string to convert to bytes
 * @returns encoded bytes
 */
export declare function fromUTF8String(string: string): Uint8Array;
/**
 * Implementation from:
 * https://github.com/decentralized-identity/did-jwt
 */
export declare function concatKDF(secret: Uint8Array, keyLen: number, alg: string): Uint8Array;
export declare function base64ToBytes(s: string): Uint8Array;
export declare function bytesToBase64(b: Uint8Array): string;
export declare function bytesToBase64url(b: Uint8Array): string;
export declare function stringToBytes(s: string): Uint8Array;
export declare function bytesToString(s: Uint8Array): string;
export declare function base58ToBytes(s: string): Uint8Array;
export declare function bytesToBase58(b: Uint8Array): string;
//# sourceMappingURL=utils.d.ts.map
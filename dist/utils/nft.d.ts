import { Metadata } from '@metaplex-foundation/mpl-token-metadata';
import type { Connection, PublicKeyInitData } from '@solana/web3.js';
import { PublicKey } from '@solana/web3.js';
type ExtendedMetadata = Metadata & {
    json: Record<string, any>;
};
export declare function getMetadataPDA(mint: PublicKeyInitData): PublicKey;
export declare function getMetadataByMint(connection: Connection, mint: PublicKeyInitData, loadJson?: boolean): Promise<ExtendedMetadata | undefined>;
export declare const sanitizeString: (str: string) => string;
export {};
//# sourceMappingURL=nft.d.ts.map
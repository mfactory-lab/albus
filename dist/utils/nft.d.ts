import type { Creator, Metadata } from '@metaplex-foundation/mpl-token-metadata';
import type { AlbusNftCode } from '../types';
export interface ValidateNftProps {
    code?: AlbusNftCode;
    creators?: Creator[];
}
export declare function validateNft(nft: Metadata, props?: ValidateNftProps): void;
//# sourceMappingURL=nft.d.ts.map
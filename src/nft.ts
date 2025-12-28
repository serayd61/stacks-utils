/**
 * NFT Utilities
 * Functions for working with SIP-009 NFTs on Stacks
 */

export interface NftMetadata {
  name: string;
  description?: string;
  image: string;
  attributes?: NftAttribute[];
  externalUrl?: string;
  animationUrl?: string;
  backgroundColor?: string;
}

export interface NftAttribute {
  traitType: string;
  value: string | number;
  displayType?: 'string' | 'number' | 'date' | 'boost_percentage' | 'boost_number';
}

export interface NftCollection {
  contractId: string;
  name: string;
  description?: string;
  imageUrl?: string;
  totalSupply?: number;
  floorPrice?: bigint;
}

export interface NftToken {
  tokenId: number | string;
  owner: string;
  contractId: string;
  metadata?: NftMetadata;
  listPrice?: bigint;
}

// Popular NFT marketplaces on Stacks
export const NFT_MARKETPLACES = {
  GAMMA: {
    name: 'Gamma',
    url: 'https://gamma.io',
    contractMainnet: 'SP2KAF9RF86PVX3NEE27DFV1CQX0T4WGR41X3S45C.marketplace-v4',
  },
  TRADEPORT: {
    name: 'Tradeport',
    url: 'https://tradeport.xyz',
  },
} as const;

/**
 * Parses NFT metadata from JSON
 * @param json - Raw JSON metadata
 */
export function parseNftMetadata(json: unknown): NftMetadata | null {
  if (!json || typeof json !== 'object') return null;
  
  const data = json as Record<string, unknown>;
  
  // Required fields
  if (typeof data.name !== 'string' || typeof data.image !== 'string') {
    return null;
  }
  
  const metadata: NftMetadata = {
    name: data.name,
    image: data.image,
  };
  
  // Optional fields
  if (typeof data.description === 'string') {
    metadata.description = data.description;
  }
  
  if (typeof data.external_url === 'string') {
    metadata.externalUrl = data.external_url;
  }
  
  if (typeof data.animation_url === 'string') {
    metadata.animationUrl = data.animation_url;
  }
  
  if (typeof data.background_color === 'string') {
    metadata.backgroundColor = data.background_color;
  }
  
  // Parse attributes
  if (Array.isArray(data.attributes)) {
    metadata.attributes = data.attributes
      .filter((attr): attr is Record<string, unknown> => 
        attr !== null && typeof attr === 'object'
      )
      .map(attr => ({
        traitType: String(attr.trait_type || attr.traitType || ''),
        value: attr.value as string | number,
        displayType: attr.display_type as NftAttribute['displayType'],
      }))
      .filter(attr => attr.traitType !== '');
  }
  
  return metadata;
}

/**
 * Builds the Gamma.io URL for an NFT
 * @param contractId - NFT contract ID
 * @param tokenId - Token ID
 */
export function getGammaUrl(contractId: string, tokenId: number | string): string {
  return `https://gamma.io/collections/${contractId}/${tokenId}`;
}

/**
 * Builds the Gamma.io URL for a collection
 * @param contractId - NFT contract ID
 */
export function getGammaCollectionUrl(contractId: string): string {
  return `https://gamma.io/collections/${contractId}`;
}

/**
 * Gets the API URL for fetching NFT metadata
 * @param contractId - NFT contract ID
 * @param tokenId - Token ID
 * @param network - Network type
 */
export function getNftMetadataUrl(
  contractId: string,
  tokenId: number | string,
  network: 'mainnet' | 'testnet' = 'mainnet'
): string {
  const baseUrl = network === 'mainnet'
    ? 'https://api.hiro.so'
    : 'https://api.testnet.hiro.so';
  
  return `${baseUrl}/metadata/v1/nft/${contractId}/${tokenId}`;
}

/**
 * Gets the API URL for fetching NFTs owned by an address
 * @param address - Stacks address
 * @param network - Network type
 */
export function getNftsByOwnerUrl(
  address: string,
  network: 'mainnet' | 'testnet' = 'mainnet'
): string {
  const baseUrl = network === 'mainnet'
    ? 'https://api.hiro.so'
    : 'https://api.testnet.hiro.so';
  
  return `${baseUrl}/extended/v1/tokens/nft/holdings?principal=${address}`;
}

/**
 * Validates IPFS URI and converts to HTTP gateway URL
 * @param uri - IPFS or HTTP URI
 * @param gateway - IPFS gateway to use
 */
export function resolveNftUri(
  uri: string,
  gateway: string = 'https://ipfs.io/ipfs/'
): string {
  if (!uri) return '';
  
  // Already an HTTP URL
  if (uri.startsWith('http://') || uri.startsWith('https://')) {
    return uri;
  }
  
  // IPFS protocol
  if (uri.startsWith('ipfs://')) {
    const cid = uri.replace('ipfs://', '');
    return `${gateway}${cid}`;
  }
  
  // Arweave
  if (uri.startsWith('ar://')) {
    const txId = uri.replace('ar://', '');
    return `https://arweave.net/${txId}`;
  }
  
  // Assume it's an IPFS CID
  if (uri.startsWith('Qm') || uri.startsWith('bafy')) {
    return `${gateway}${uri}`;
  }
  
  return uri;
}

/**
 * Calculates rarity score for an NFT based on trait rarity
 * @param attributes - NFT attributes
 * @param collectionTraits - Collection-wide trait statistics
 */
export function calculateRarityScore(
  attributes: NftAttribute[],
  collectionTraits: Record<string, Record<string, number>>
): number {
  if (!attributes || attributes.length === 0) return 0;
  
  let totalScore = 0;
  
  for (const attr of attributes) {
    const traitStats = collectionTraits[attr.traitType];
    if (!traitStats) continue;
    
    const traitCount = traitStats[String(attr.value)];
    const totalInTrait = Object.values(traitStats).reduce((a, b) => a + b, 0);
    
    if (traitCount && totalInTrait) {
      // Rarity = 1 / (occurrence percentage)
      const rarity = 1 / (traitCount / totalInTrait);
      totalScore += rarity;
    }
  }
  
  return Math.round(totalScore * 100) / 100;
}

/**
 * Formats NFT price for display
 * @param priceUstx - Price in micro-STX
 * @param showSymbol - Whether to show STX symbol
 */
export function formatNftPrice(priceUstx: bigint, showSymbol: boolean = true): string {
  const stx = Number(priceUstx) / 1_000_000;
  const formatted = stx.toLocaleString('en-US', { 
    minimumFractionDigits: 0,
    maximumFractionDigits: 6,
  });
  return showSymbol ? `${formatted} STX` : formatted;
}

/**
 * Generates a placeholder image URL for NFTs without images
 * @param contractId - NFT contract ID
 * @param tokenId - Token ID
 */
export function getPlaceholderImage(contractId: string, tokenId: number | string): string {
  const seed = `${contractId}-${tokenId}`;
  return `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(seed)}`;
}

/**
 * Validates if a URI points to a supported media type
 * @param uri - Media URI
 */
export function isValidNftMediaUri(uri: string): boolean {
  if (!uri || typeof uri !== 'string') return false;
  
  // Supported protocols
  const validProtocols = ['http://', 'https://', 'ipfs://', 'ar://'];
  
  return validProtocols.some(protocol => uri.startsWith(protocol)) ||
         uri.startsWith('Qm') || 
         uri.startsWith('bafy');
}

/**
 * Extracts contract ID from NFT asset identifier
 * @param assetIdentifier - Full asset identifier (e.g., "SP123.nft-contract::nft-name")
 */
export function extractContractFromAsset(assetIdentifier: string): string | null {
  const match = assetIdentifier.match(/^([A-Z0-9]+\.[a-z0-9-]+)::/);
  return match ? match[1] : null;
}


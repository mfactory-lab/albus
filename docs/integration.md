# Albus Protocol Integration

### On-chain usage

First of all, install the albus-verifier crate.

```toml
[dependencies]
albus-verifier = "0.1.1"
```

Verify ZKP Request
```rust
albus_verifier::check_compliant(&zkp_request_account_info, None)?;
```

Verify ZKP Request for provided user
```rust
albus_verifier::check_compliant(&zkp_request_account_info, Some(user.key()))?;
```

Find ZKP Request address for user
```rust
let ALBUS_PROGRAM_ID = albus_verifier::program_id();
// User address
let user = &Pubkey::new();
// Albus circuit address
let circuit = &Pubkey::new();
// Generate Service address
let (service_provider, _) = albus_verifier::find_service_provider_address(&ALBUS_PROGRAM_ID, "<YOUR_CODE>");
// Generate ZKP request address
let (zkp_request_addr, _) = albus_verifier::find_zkp_request_address(&ALBUS_PROGRAM_ID, &service_provider, &circuit, &user);
```

Find Service address by code
```rust
let ALBUS_PROGRAM_ID = albus_verifier::program_id();
let (service_provider, _) = albus_verifier::find_service_provider_address(&ALBUS_PROGRAM_ID, "<YOUR_CODE>");
```

### Off-chain usage

First of all, install the `@albus/sdk` package

```
pnpm add @albus/sdk
```

Example client initialization
```typescript
import { AnchorProvider, Wallet, web3 } from '@project-serum/anchor'
import { AlbusClient } from '@albus/sdk'

// Initialize anchor provider
const payerKeypair = Keypair.fromSecretKey([])
const opts = AnchorProvider.defaultOptions()
const provider = new AnchorProvider(
  new web3.Connection(web3.clusterApiUrl('mainnet-beta'), opts),
  new Wallet(payerKeypair),
  opts,
)

// Initialize Albus client
const client = new AlbusClient(provider)

```

Verify that the selected `user` is compliant with respect to the `circuit` and the `service`.

```typescript
// Albus circuit address
const circuit = new Pubkey("...")
// User wallet
const user = new Pubkey("...")
// Full verification process (verify provided zk proof)
const full = false
await client.checkCompliance({ serviceCode: '...', circuit, user, full })
```

Prove the ZKP request that was created earlier

```typescript
// ZKP Reqeust address
const zkpRequest = new Pubkey("...")
/// Proof NFT Metadata address
const proofMetadata = new Pubkey("...")
// Prove ZKP request
await client.prove({ zkpRequest, proofMetadata })
```

Create new ZKP request

```typescript
const { signature } = await client.createZKPRequest({
  serviceCode: "<CODE>",
  circuit: new PublicKey('...'),
  // (optional) expiration in seconds
  expiresIn: 0
})
```

Find ZKP request address by service code, circuit address and user address

```typescript
// Find Service address
const serviceAddr = client.getServiceProviderPDA('<CODE>')
// Albus circuit address
const circuit = new Pubkey("...")
// User wallet
const user = new Pubkey("...")
// Find ZKP Reqeust address
const zkpRequestAddr = client.getZKPRequestPDA(serviceAddr, circuit, user)
```

Load ZKP request by address

```typescript
const zkpRequest = await client.loadZKPRequest(zkpRequestAddr)
```

Search ZKP requests for user

```typescript
const user = new PublicKey()
// (optional) filter by circuit
const circuit = undefined
// (optional) filter by service
const serviceProvider = undefined
// find zkp requests
const data = await client.searchZKPRequests({ user, circuit })
```

Delete ZKP request

```typescript
const zkpRequest = new PublicKey()
const { signature } = await client.deleteZKPRequest({ zkpRequest })
```

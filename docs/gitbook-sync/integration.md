---
layout:
  title:
    visible: true
  description:
    visible: false
  tableOfContents:
    visible: true
  outline:
    visible: true
  pagination:
    visible: true
---

# Integration

This section will guide you through integrating Albus into your workflow. The on-chain part is implemented in Rust, while the off-chain part is built with TypeScript.

{% hint style="info" %}
Web3 protocols (business users) are referred to as service providers in this section. For all definitions, please refer to the [Glossary](/docs/gitbook-sync/glossary.md).
{% endhint %}

## On-chain component (Rust)

### Installation

Add this code to install the `albus-verifier` crate.

```toml
[dependencies]
albus-solana-verifier = "0.1.2"
```

### Usage

* Verify user compliance on-chain

This method verifies on-chain that a proof request (Certificate) is not expired and contains a valid ZK Proof. If both conditions are met, Albus proceeds to execute the code. If it's not, Albus returns an error.

_Example_

```rust
use albus_solana_verifier::AlbusCompliant;

AlbusCompliant::new(&ctx.accounts.proof_request)

  // (Optional) checks association with a user
  .with_user(ctx.accounts.sender.key("<USER_ADDRESS>"))

  // (Optional) checks association with a policy
  .with_policy(ctx.accounts.policy.key("<POLICY_ADDRESS>"))
  .check()?;
```

* Retrieve a proof request's address

This method retrieves an address of a proof request (Certificate).

It's a non-unique address of an account created on-chain when a user requests a Certificate on the frontend of the Albus application. It's associated with a specific user, policy, and service provider. It can be found by addresses of the user and the policy it is associated with.

_Example_

```rust
let user = Pubkey::new("<USER_ADDRESS>");
let policy = Pubkey::new("<POLICY_ADDRESS>");
// (Optional) retrieves a policy's address by a service provider's address and policy's code
let (policy, _) = albus_solana_verifier::find_policy_address(&service, "<POLICY_CODE>");

let (proof_request, _) = albus_solana_verifier::find_proof_request_address(&policy, &user);
```

* Retrieve a policy's address

This method retrieves an address of a policy by its code stored in our database.

_Example_

```rust
let service = Pubkey::new("SERVICE_PROVIDER_ADDRESS");
// (Optional) retrieves a service provider's address by its code
let (service, _) = find_service_provider_address("service_provider_code");

let (policy, _) = albus_solana_verifier::find_policy_address(&service, "<POLICY_CODE>");
```

* Retrieve a service provider's address

This method retrieves an address of a service provider by its unique code stored in our database.

_Example_

```rust
let (service_provider, _) = albus_solana_verifier::find_service_provider_address("<SERVICE_PROVIDER_CODE>");
```

## Off-chain component (TypeScript)

### Installation

Install the `@albus/sdk` package (`yarn` and `npm` package managers can also be used).

{% hint style="info" %}
The SDK version may vary
{% endhint %}

* Install via CLI

```shell
npm install @albus-finance/sdk@^0.2
```

* Install via package.json

```npm
"@albus-finance/albus-sdk": "^0.2"
```

### Initialization

* Initialize the Albus client (in a browser)

```ts
const network = clusterApiUrl("devnet")
const wallet = window.solana // Phantom crypto wallet
const client = AlbusClient.fromWallet(new Connection(network), wallet)
```

* Initialize the Albus client (on a validator node)

```ts
const network = clusterApiUrl("devnet")
const keypair = Keypair.fromSecretCode('...')
const client = AlbusClient.fromKeypair(new Connection(network), keypair)
```

### Methods available to Web3 businesses

* Retrieve all service providers

This method retrieves a list of all service providers.

```ts
const services = await client.service.find()
```

* Retrieve a service provider by its address

This method retrieves a specific service provider by its address.

```ts
const { publicKey } = useAnchorWallet()
const service = services.filter(s => s.data?.authority.toBase58() === publicKey.value?.toBase58())
```

* Retrieve all proof requests

This method retrieves a list of all proof requests (Certificates).

```ts
const certificates = client.proofRequest.find()
```

* Retrieve all policies

This method retrieves a list of all policies.

```ts
const policies = client.policy.find({ serviceCode: string })
```

{% hint style="info" %}
`serviceCode` can be found in the `service` entity.
{% endhint %}

### Internal methods of Albus Protocol

* Create a proof request

This method creates a proof request (Certificate) on-chain based on codes of a service provider and a policy. The codes can be added from a config file or retrieved with the `find` method.

```ts
client.proofRequest.create({ serviceCode: string, policyCode: string })
```

_Example_

```ts
import { SERVICE_CODE, POLICY_CODE } from '@/config'

// Retrieves a service provider's code via a list of all service providers
const services = await client.service.find()
const service = services.find(s => s.data.code === '<SERVICE_PROVIDER_CODE>')
const serviceCode = service?.data?.code ?? SERVICE_CODE

// Retrieves a policy's code via a list of all policies
const policies = await albus.client.policy.find({ serviceCode })
const policy = policies.find(p => p.data.code === '<POLICY_CODE>')
const policyCode = policy.data.code ?? POLICY_CODE

await client.proofRequest.create({ serviceCode, policyCode })
```

* Generate a ZK Proof for a proof request

This method generates a Zero-Knowledge Proof for a specific proof request (Certificate). Once the ZK Proof is generated and verified, the user is issued the Certificate on the frontend.

```ts
const props = {
  proofRequest: PublicKey,
  vc: PublicKey,
  userPrivateKey: Uint8Array,
}
await client.proofRequest.fullProve(props)
```

_Props_

Data passed to the `fullProve` method:

* `proofRequest`: address of the proof request for which the ZK Proof is to be generated.
* `vc`: address of the credential to be used to generate the ZK Proof.
* `userPrivateKey`: key generated from a seed phrase and used to encrypt and decrypt credentials of a user.

_Example_

```ts
const certificates = await client.proofRequest.find()
const certificate = certificates[0] // The first proof request (Certificate) is used
const proofRequest = certificate.address

const ekp = Keypair.fromSeed('<SEED_PHRASE>') // Contains the seed phrase used to generate a decryption key when creating a credential
const decryptionKey = ekp.secretKey

const credentials = await client.credential.loadAll({ decryptionKey }) // Retrieves a list of all credentials of a user
const credential = credentials[0] // The first credential is used
const vc = credential.address

const props = { proofRequest, vc, userPrivateKey }
await client.proofRequest.fullProve(props)
```

{% hint style="info" %}
* `credential`: credentials contain specific user data required for a specific ZK Proof. If a credential doesn't contain this data, ZK Proof generation will fail.
* `decryptionKey`: same as `userPrivateKey` above. If a wrong key is passed, ZK Proof generation will fail.
{% endhint %}

* Delete a proof request

This method deletes a proof request (Certificate).

```ts
await client.proofRequest.delete({ proofRequest: PublicKeyInitData})
```

_Example_

```ts
const certificate = certificates[0] // The first proof request (Certificate) is used
const proofRequest = certificate.address

await client.proofRequest.delete({ proofRequest })
```

* Retrieve all credentials

This method retrieves a list of all credentials.

```ts
const credentials = await client.credential.loadAll({ 
  decryptionKey: [
      // bytes
  ],
})
```

{% hint style="info" %}
`decryptionKey`: a key generated from a seed phrase and used to encrypt and decrypt credentials of an end user.
{% endhint %}

_Example_

```ts
import { Keypair } from '@solana/web3.js'

const ekp = Keypair.fromSeed('<SEED_PHRASE>') // Contains the seed phrase used to generate a decryption key when creating the credential

await client.credential.loadAll({ 
  decryptionKey: ekp.secretKey,
})
```

* Revoke a credential

This method revokes a credential issued for a user. Credential NFTs can only be deleted using the `revoke` method.

```ts
await client.credential.revoke({ mint: PublicKeyInitData })
```

_Example_

```ts
const credential = credentials[0] // The first credential is used
const mint = credential.address

await client.credential.revoke({ mint })
```

* Update a service provider

This method updates a service provider.

```ts
const props = {
  name: string,
  website: string, 
  secretShareThreshold: number,
  trustees: [PublicKey.default()],
  contactInfo: {
    kind: number,
    value: string,
  },
  serviceProvider: PublicKey.default(),
  newAuthority: PublicKey.default(),
}

await client.service.update(props)
```

_Props_

Data passed to the `update` method:

* `name`: service provider's name.
* `website`: service provider's website.
* `secretShareThreshold`: the number of shares into which a decryption key is split under a secret sharing scheme (for details, see the [Glossary](/docs/gitbook-sync/glossary.md#secret-sharing-scheme-shamirs-secret-sharing-sss)).

* `contactInfo`:
  * `kind`: contact type:
    * `0`: Telegram
    * `1`: email
    * `2`: Discord
  * `value`: contact info.
* `serviceProvider`: service provider's address.
* `newAuthority`: address of a new authority.
* `trustees`: addresses of Trustees.

_Example_

```ts
const props = {
  name: 'Albus Defi',
  website: 'https://defi.albus.finance/',
  secretShareThreshold: 2,
  contactInfo: {
    kind: 1,
    value: 'test@email',
  },
  serviceProvider: "ArrNHy59LQ3E9VczX7B3YQiN2AK4A9dbEPKeFU8kq1P8",
  newAuthority: '7dkvaBTSHxqUHc9uvN7VBeL1yKHUngStv7C96dgkzXAK',
  trustees: ['6GkdHy59LQ3E9VczX7B3YQiN2AK4A9dbEPKeFU8kq1P8', 'nRg3aBTSHxqUHc9uvN7VBeL1yKHUngStv7C96dgkzXAK']
}

client.service.update(props)
```

* Retrieve all Trustees

This method retrieves a list of all Trustees.

```ts
const trustees = await client.trustee.find()
```

* Add a Trustee(s) for a service provider

This method associates a Trustee(s) with a specific service provider.

```ts
await client.service.update({ 
  serviceProvider: PublicKey.default(), 
  trustees: [
      // Public key(s)
  ],
})
```

Props

Data passed to the `update` method:

* `serviceProvider`: service provider's address.
* `trustees` : addresses of Trustees.

_Example_

```ts
await client.service.update({ serviceProvider: PublicKey.default(), trustees })
```

* Retrieve all circuits

This method retrieves a list of all circuits.

```ts
await client.circuit.find()
```

* Create a policy

```ts
const props = {
  circuitCode: string,
  serviceCode: string,
  code: string,
  description: string,
  expirationPeriod: number,
  name: string,
  retentionPeriod: number,
  rules: [
      // ...
  ] as Array<{
    key: string;
    value: string | number | bigint;
    label?: string;
  }>
}

client.policy.create(props)
```

_Props_

Data passed to the `create` method:

* `circuitCode`: code of the circut used.
* `code`: any arbitrary name.
* `description`: service provider description (max. 64 characters).
* `name`: service provider's name (max. 30 characters).
* `expirationPeriod`: period in seconds after which the Certificate expires and is no longer valid.
* `retentionPeriod`: time in seconds during which user data passed for generating a ZK Proof is retained for regulatory purposes.
* `serviceCode`: service provider's code.
* `rules`: specific requirements included in a policy.

_Example_

```ts
const circuits = await client.circuit.find()
const circuitCode = circuits.find(c => c.data.code === 'agePolicy')

const serviceCode = service.data.code
const props = {
  circuitCode,
  code: 'age_policy_code',
  description: 'Age policy description',
  expirationPeriod: 31622400, 
  name: 'Swap for users over 18 years old',
  retentionPeriod: 2142300,
  rules: [
    {
      key: "minAge",
      value: "18",
      label: "" // (Optional) decription
    },
      {
      key: "maxAge",
      value: "60",
      label: "" // (Optional) decription
    },
  ],
  serviceCode
}

client.policy.create(props)
```

* Update policy

This method updates a policy.

```ts
const props = {
  circuitCode: string,
  code: string,
  description: string,
  expirationPeriod: number,
  name: string,
  retentionPeriod: number,
  rules: Array<{
    key: string;
    value: string | number | bigint;
    label?: string;
  }>,
  serviceCode: string
}

client.policy.update(props)
```

{% hint style="info" %}
The props are the same as above (create a policy).
{% endhint %}

* Delete policy

This method deletes a policy.

```ts
const serviceCode = service.data.code // Service provider's code
const policy = policies[0] // The first policy is used
const code = policy.data.code // Policy's code

client.policy.delete({ serviceCode: string, code: string })
```

_Example_

```ts
const props = {
  serviceCode: 'testDefi',
  code: 'testDefiPolicy'
}
client.policy.delete(props)
```

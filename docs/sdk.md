# Albus SDK v.0.2.12

## JavaScript integration

First of all, install the `albus-sdk`.
<sup>*SDK version may vary</sup>

### Install from the command line:
```shell
npm install @albus-finance/sdk@^0.2
```
### Install via package.json:
 ```npm
"@albus-finance/albus-sdk": "^0.2"
```

### Init client
```typescript
import { useAnchorWallet } from 'solana-wallets-vue'
// solana connection
const connection = new Connection(clusterApiUrl("mainnet-beta"))
// solana wallet
const wallet = useAnchorWallet()
const client = AlbusClient.factory(connection, wallet)
```

### Certificates API

Load certificates
```typescript
const certificates = client.proofRequest.find()
```

Create certificate
```typescript
client.proofRequest.create({ serviceCode: string, policyCode: string })
```

**Example**
```typescript
import { SERVICE_CODE, POLICY_CODE } from '@/config'

// to find out the service code, you can download all services and find your service in them, or immediately add the service code from the config
const services = await client.service.find()
const service = services.find(s => s.data.code === <SERVICE_CODE>) // You can search by other parameters, for example name or address
const serviceCode = service?.data?.code ?? SERVICE_CODE

// to find out the policy code, you can download all service policies and find your policy in them, or immediately add the policy code from the config
const policies = await albus.client.policy.find({ serviceCode })
const policy = policies.find(p => p.data.code === <POLICY_CODE>) // You can search by other parameters, for example name or address
const policyCode = policy.data.code ?? POLICY_CODE

client.proofRequest.create({ serviceCode, policyCode })
```

Proved certificate
```typescript
const props = {
  proofRequest: PublicKeyInitData,
  vc: PublicKeyInitData,
  userPrivateKey: Uint8Array,
}
client.proofRequest.fullProve(props)
```

**Example**
```typescript
const certificates = await client.proofRequest.find()
const certificate = certificates[0] // for example, let's take the first certificate
const proofRequest = certificate.address

const payer = Keypair.fromSeed(seed) //Seed phrase that was used to create the encryption key when creating the credential
const decryptionKey = payer.secretKey

const credentials = await client.credential.loadAll({ decryptionKey }) // load all user credentials
const credential = credentials[0] // for example, take the first credential
const vc = credential.address

const props = {
  proofRequest,
  vc,
  userPrivateKey,
}
client.proofRequest.fullProve(props)
```

>**Important**
>>**credential**: *Each certificate has a set of policies according to which the verification takes place, so not every credential will be suitable.*
>
>>**decryptionKey**: *The encryption key with which the credentials were encrypted when they were created. If the key does not match, then you will not be able to verify the certificate*

**Props**
Data that is passed to the `fullProve` method:
- `proofRequest`: address of the certificate you will validate
- `vc`: credential address that will be used to validate the certificate
- `userPrivateKey`: Key for decrypting a credential (each credential is stored in encrypted form)

Delete certificate
```typescript
client.proofRequest.delete({ proofRequest: PublicKeyInitData})
```

**Example**
```typescript
const certificate = certificates[0] // for example, let's take the first certificate
const proofRequest = certificate.address

client.proofRequest.delete({ proofRequest})
```

#### Credentials API

Load credentials

```typescript
const credentials = client.credential.loadAll({ decryptionKey: number[] | Uint8Array })
```

> `decryptionKey` is a `secretKey` which is used to encrypt and decrypt credentials (randomly generated)

**Example**
```typescript
import { Keypair } from '@solana/web3.js'

const payer = Keypair.fromSeed(seed) //Seed phrase that was used to create the encryption key when creating the credential
const decryptionKey = payer.secretKey
client.credential.loadAll({ decryptionKey })
```
Revoke credential

```typescript
client.credential.revoke({ mint: PublicKeyInitData })
```
> NFT credentials can only be deleted using the `revoke` method

**Example**
```typescript
const credential = credentials[0] // for example, take the first credential
const mint = credential.address

client.credential.revoke({ mint })
```


### Services API

Load services
```typescript
const services = await client.service.find()
```

Own service
```typescript
const { publicKey } = useAnchorWallet()
const service = services.filter(s => s.data?.authority.toBase58() === publicKey.value?.toBase58())
```

Update service
```typescript
const props = {
  name: string,
  website: string, 
  secretShareThreshold: number,
  trustees: PublicKeyInitData[],
  contactInfo: {
    kind: number,
    value: string,
  },
  serviceProvider: PublicKeyInitData,
  newAuthority: PublicKeyInitData,
}

client.service.update(props)
```
**Example**
```typescript
const props = {
  name: 'Test Defi',
  website: 'https://app.albus.finance/',
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
**Props**
Data that is passed to the `update` method:
- `name`: Service name
- `website`: Service website
- `secretShareThreshold`: The number of shares into which the user data encryption key is split
- `contactInfo`: 
  - `kind`: Сontact type 
  - `value`: Contact
- `serviceProvider`: Service provider address
- `newAuthority`: Address of the new authority
- `trustees`: Trustee addresses

> Сontact type:
>- `0`: Telegram
>- `1`: Email
>- `2`: Discord

### Trustees API
Load trustees 
```typescript
const trustees = client.trustee.find()
```

Add trustee to service
```typescript
client.service.update({ serviceProvider: PublicKeyInitData, trustees: PublicKeyInitData[] })
```

**Example**
```typescript
const serviceProvider = service.pubkey
client.service.update({ serviceProvider, trustees })
```

**Props**
Data that is passed to the `update` method:
- `serviceProvider`: Service address
- `trustees` : Trustee service addresses



### Circuits API
Circuits
```typescript
client.circuit.find()
```

### Policies API
Load policies
```typescript
const policies = client.policy.find({ serviceCode: string })
```
> `serviceCode` can be found in the service entity


Create Policy
```typescript
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

client.policy.create(props)
```
**Example**
```typescript
const circuits = await client.circuit.find()
const circuitCode = circuits.find(c => c.data.code === 'agePolicy')

const serviceCode = service.data.code
const props = {
  circuitCode,
  code: 'age_policy_code',
  description: 'Description of your policy',
  expirationPeriod: 31622400, 
  name: 'Swap for users over 18 years old',
  retentionPeriod: 2142300,
  rules: [
    {
      key: "minAge",
      value: "18",
      label: "" // Some information (optional)
    },
      {
      key: "maxAge",
      value: "60",
      label: "" // Some information (optional)
    },
  ],
  serviceCode
}

client.policy.create(props)
```
**Props**
Data that is passed to the `create` method:
- `circuitCode`: The circut code you are using
- `code`: Any name, create it yourself
- `description`: Description of your service, max 64 characters(optional)
- `name`: Service name (max 30 characters)
- `expirationPeriod`: Expiration of the certificate created according to your policy (time is transmitted in seconds)
- `retentionPeriod`: certificate retention period after its deletion (time is transmitted in seconds)
- `serviceCode`: Your service code
- `rules`: Circuit rules

Update Policy
```typescript
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
> The data used is the same as when creating the policy

Delete policy

```typescript
const serviceCode = service.data.code // service code
const policy = policies[0] // for example we took the first policy
const code = policy.data.code //policy code

client.policy.delete({ serviceCode: string, code: string })
```

**Example**
```typescript
const props = {
  serviceCode: 'testDefi',
  code: 'testDefiPolicy'
}
client.policy.delete(props)
```


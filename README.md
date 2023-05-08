# Table of contents

1. [What is Albus?](#what-is-albus)
2. [Self-Sovereign Identity (SSI)](#self-sovereign-identity-ssi)
3. [Threshold encryption](#threshold-encryption)
4. [Zero-knowledge proofs (ZKP)](#zero-knowledge-proofs-zkp)
5. [Workflow overview](#workflow-overview)
6. [Definitions](#definitions)
7. [Albus CLI v.0.0.1](#albus-cli-v001)
8. [Reference list](#reference-list)

# What is Albus?

Albus is a blockchain protocol that verifies compliance of users with
predefined policies of decentralized finance (DeFi) services while
preserving user anonymity and privacy. These policies can be based on
internal guidelines of DeFi services or be derived from applicable
regulations, such as know-your-customer (KYC) and anti-money laundering
(AML) rules. DeFi policies may encompass any combination of
requirements, such as age, jurisdiction, and banking account
information. A DeFi lending platform, for instance, may require that
users meet a minimum age limit and be free from sanctions.

To maintain user privacy, which is a cornerstone of the crypto
ecosystem, Albus employs the zero-knowledge proof (ZKP) technology. This
enables the protocol to verify compliance without accessing or
disclosing any personally identifiable information that could jeopardize
user anonymity.

As a Self-Sovereign Identity (SSI) mechanism, Albus ensures secure
compliance verification through a series of encryption and ZKP-based
steps, all while keeping users\' personal information confidential.
Importantly, all user data managed by Albus is either encrypted or
stored in such a way that the protocol itself has no access to it.

Currently in its minimum viable product (MVP) stage, Albus is an ongoing
project that will continue to expand and improve its functionality over
time.

The on-chain implementation imposed certain restrictions. For instance,
if verification were to be conducted on-chain only, it would require
thousands of transactions. Albus integrates a set of on- and off-chain
modules to ensure a seamless workflow.

# Self-Sovereign Identity (SSI)

Traditional digital identity management often relies on centralized
identity providers, such as Facebook or Google, which leaves personal
data of users vulnerable to hacking attacks and leaks. Additionally,
some providers have been known to gather personal information without
user consent.

The SSI model was originally developed to address these concerns by
decentralizing digital identity management based on the blockchain
technology. The conventional SSI model involves three actors: the
issuer, the holder, and the verifier. They interact with each other in a
trusted manner to facilitate secure, fraud-proof verification of users\'
digital identities, allowing users full ownership and control over their
digital identity data. With SSI, users can share only the information
they choose, without depending on third parties.

Albus incorporates a modified version of the SSI model to comply with
anti-money laundering (AML) regulations, as complete control over
digital identity data may conflict with these requirements. For
instance, if a user (the holder) under scrutiny deleted their data, a
law enforcement organization with a valid court order would be unable to
verify their transactions. To address this issue, the holder entity has
been expanded to include the Albus Trustee, an entity holding a
threshold key used for encryption of personal data.

# Threshold encryption

Albus employs threshold cryptography to encrypt and decrypt user data
obtained from a know-your-customer (KYC) provider. Three private keys
are distributed between the user, Albus, and the Albus Trustee, and only
two of them are used to decrypt the personal data.

If a fiscal or law enforcement organization presents a legitimate
request for user data, the information can be decrypted and accessed
using the keys held by Albus and by the Albus Trustee. The user can also
access their personal data by combining their key with the one held by
Albus.

# Zero-knowledge proofs (ZKP)

In order to maintain user privacy throughout the verification process,
Albus utilizes the zero-knowledge proof (ZKP) technology called
zk-SNARK. This is a cryptographic method of proving that a statement is
true without revealing the statement itself. In the case of Albus, it
allows the protocol to confirm that a user complies with a specific
policy without giving away any other information.

The proving system leverages cryptographic circuits that represent DeFi
policies. The circuits are created using Circom, a circuit programming
language. Groth16, an optimized implementation of zk-SNARK, uses these
circuits in combination with encrypted user data to create
zero-knowledge proofs. A circuit takes user data as input and processes
it through a series of logical operations to generate a proof that
confirms user compliance with an applicable policy.

# Workflow overview

When a user initiates a transaction with a DeFi service, the DeFi
service requests Albus to verify that this user complies with an
applicable policy. The Albus Requester requests a ZKP certificate of
user compliance from the Albus Holder.

If the Albus Holder has the ZKP certificate and it's valid (has not
expired), the Albus Verifier verifies it and records it as verified
on-chain. Then, the DeFi service can choose to independently reverify
the ZKP certificate.

If the required ZKP certificate has expired or is missing, the Albus
Holder generates one based on the existing verifiable credentials (VC)
and submits it to the Albus Verifier. Then, the workflow proceeds as
above.

If the Albus Holder lacks the necessary VC, it undergoes KYC
verification with a chosen KYC provider. If the KYC verification is
successful, the KYC provider provides KYC data to the Albus Issuer
adapter, which converts it to VC and encrypts. The Albus Holder decrypts
the VC and uses it to generate the required ZKP certificate. Then, the
workflow continues through the steps above.

# Definitions

## Entities and modules

**User:** a user who wants to transact with a DeFi service. In Albus,
the user is represented by the Albus Holder.

**Decentralized finance (DeFi) service**: a DeFi service, e.g. a
decentralized exchange (DEX), that must ensure that the user complies
with an applicable policy before approving the transaction.

**KYC provider:** a third party that verifies users based on the
know-your-customer (KYC) procedure and provides their KYC data to the
Albus Issuer through its adapter.

**Albus Issuer:** an Albus module that issues verifiable credentials
(VC) for the Albus Holder. The Albus Issuer is connected to KYC
providers through adapters.

**Albus Issuer adapter**: an intermediary between the Issuer and KYC
providers. The adapter retrieves KYC data from KYC providers through
API, converts it into VC, encrypts it, and passes it to the Albus
Issuer.

**Albus Holder:** a compound Albus module that represents the user but
is also closely linked to the Albus Trustee. It holds VC and a set of
wallets, and generates ZKP certificates for the Albus Verifier to prove
that the user complies with a specific policy.

**Albus Verifier:** an Albus module that can verify the Albus Holder's
ZKP certificates.

**Albus Requester:** an Albus module that creates an on-chain request
for a ZKP certificate of user compliance with an applicable policy of
the DeFi service.

## General terms

**Circuit**: a policy dataset cryptographically processed for ZKP
certificate generation.

**Policy**: a set of internal and regulatory requirements of a DeFi
service that a user must comply with in order to transact with it. A
policy may combine different sets of requirements: e.g., age +
jurisdiction, age + banking account, age + jurisdiction + banking
account.

**Verifiable credential (VC)**: in the conventional SSI model, VC is a
digital credential that can be verified. In the Albus model, VC refers
to KYC data converted by the Issuer adapter into a unified format. VC is
held by the Albus Holder, which uses it to generate ZKP certificates.

**KYC data**: data obtained by the Albus Issuer from a KYC provider as a
result of KYC verification.

**ZKP certificate**: a certificate containing a ZK proof that a certain
user complies with a certain policy. ZKP certificates are stored
on-chain as NFT.

**Zero-knowledge proof (ZKP)**: a method of proving user compliance with
a certain policy without revealing personal data.

# Albus CLI v.0.0.1

Command-line interface (CLI) for interacting with Albus program endpoints.

## Usage

```bash
pnpm cli -c <CLUSTER> -k <PATH_TO_PRIVATE_KEY> -l <LOG_LEVEL> <COMMAND>
```

`CLUSTER`: `mainnet-beta`, `testnet` or `devnet`; `devnet` is the default value

`PATH_TO_PRIVATE_KEY`: the default value is `~/.config/solana/id.json`

`LOG_LEVEL`: `info`, `error`, or `warn`

`COMMAND`: the main command

**Examples**

Running `admin sp add`:

```bash
pnpm cli admin sp add --code <UNIQ_CODE> --name <NAME>
```

> NOTE: The command takes required and optional arguments. To view them, run it with `-h` or `--help`.

```bash
pnpm cli admin sp add -h
```

## Commands

### Identity

Create an identity and store it as NFT. It identifies the NFT holder as the Albus holder and stores its state:

```bash
pnpm cli identity create
```

### Verifiable credentials (VC)

Show all VCs:

```bash
pnpm cli vc all
```

Issue a VC and store it as NFT. The VC is encrypted with the NFT holder's pubkey:

```bash
pnpm cli vc issue --encrypt
```

### Proving

Generate a ZK proof based on a corresponding circuit, and store it as NFT:

```bash
pnpm cli prove create --circuit <ADDR>
```

Generate a ZK proof for a specific ZKP request, and store it as NFT:

```bash
pnpm cli prove request <ADDR>
```

### Verification

Verify a ZK proof:

```bash
pnpm cli verify proof --circuit <ADDR> --prof <ADDR>
```

Verify a ZKP request, and change the status to "verified" or "rejected" depending on the output:

```bash
pnpm cli verify request <ADDR>
```

### Circuit management

Register a new circuit:

```bash
pnpm cli admin circuit create <CIRCUIT_CODE>
```

### DeFi service management

Register a DeFi service:

```bash
pnpm cli admin sp add --code <UNIQ_CODE> --name <NAME>
```

Remove a DeFi service:

```bash
pnpm cli admin sp remove <UNIQ_CODE>
```

Show DeFi service info:

```bash
pnpm cli admin sp show <UNIQ_CODE>
```

Show all DeFi services with optional filters:

```bash
pnpm cli admin sp all --authority <ADDR>
```

### ZKP request management

Create a ZKP request:

```bash
pnpm cli request create --sp <CODE> --circuit <ADDR>
```

Delete a ZKP request:

```bash
pnpm cli request remove <ADDR>
```

Show a ZKP request based on its program derived address (PDA):

```bash
pnpm cli request show <ADDR>
```

Find and show a ZKP request based on a DeFi service's PDA, circuit NFT's mint address, and/or ZKP request owner's address:

```bash
pnpm cli request find --sp <CODE> --owner <ADDR> --circuit <ADDR> 
```

Show all ZKP requests with optional filters by service provider's PDA, circuit NFT's mint address, and/or ZKP NFT's mint address:

```bash
pnpm cli request all --sp <CODE> --circuit <ADDR> --proof <ADDR>
```

# Reference list

This section lists the sources of all standards, cryptographic
primitives, tools, and frameworks used to create Albus.

1.  Bernstein, D. J., Duif, N., Lange, T., Schwabe, P., & Yang, B.-Y.
    (n.d.). Ed25519: high-speed high-security signatures.
    <https://ed25519.cr.yp.to/>

2.  Baghery, K., Kohlweiss, M., Siim, J., & Volkhov, M. (2021). Another
    Look at Extraction and Randomization of Groth's zk-SNARK.
    <https://www.researchgate.net/publication/355492738>

3.  Circom. (n.d.). Circom: Efficient circuit framework for programmable
    zero-knowledge. <https://iden3.io/circom>

4.  Circom. (n.d.). Proving circuits with ZK.
    <https://docs.circom.io/getting-started/proving-circuits/>

5.  Dock. (n.d.). Decentralized Identifiers (DIDs): The Ultimate
    Beginner\'s Guide.
    <https://www.dock.io/post/decentralized-identifiers>

6.  Dock. (n.d.). Verifiable Credentials: The Ultimate Guide.
    <https://www.dock.io/post/verifiable-credentials>

7.  Khovratovich, D. Dusk Network. (2019). Encryption with Poseidon.
    <https://dusk.network/uploads/Encryption-with-Poseidon.pdf>

8.  WhiteHat, B., Bellés, M., & Baylina, J. (2020). EIP-2494: Baby
    Jubjub Elliptic Curve. <https://eips.ethereum.org/EIPS/eip-2494>

9.  Electron Labs. (n.d.). Circom ed25519.
    <https://github.com/Electron-Labs/ed25519-circom>

10. Ethereum Foundation. (2023). What are zero-knowledge proofs?
    <https://ethereum.org/en/zero-knowledge-proofs/>

11. Novakovic, A., & Gurkan, K. Geometry.xyz. (2022). Groth16
    Malleability. <https://geometry.xyz/notebook/groth16-malleability>

12. Grassi, L., Khovratovich, D., Rechberger, C., Roy, A., &
    Schofnegger, M. (2019). Poseidon: A New Hash Function for
    Zero-Knowledge Proof Systems. <https://eprint.iacr.org/2019/458.pdf>

13. Shoemaker, P. Identity.com. (2022). What are Decentralized
    Identifiers (DIDs)?
    <https://www.identity.com/what-are-decentralized-identifiers-dids/>

14. InAccel. (n.d.). Zero knowledge proof. <https://inaccel.com/zkp/>

15. PersonaeLabs. (n.d.). Spartan-ECDSA.
    <https://github.com/personaelabs/spartan-ecdsa>

16. Polygon. (n.d.). Polygon zkEVM.
    <https://polygon.technology/solutions/polygon-zkevm>

17. Dahlberg, R., Pulls, T., & Peeters, R. (2016). Efficient Sparse
    Merkle Trees. <https://eprint.iacr.org/2016/683.pdf>

18. VerifiableCredentials.dev. (n.d.). Verifiable Credentials.
    <https://verifiablecredentials.dev/>

19. Sporny, M. (Digital Bazaar), Longley, D. (Digital Bazaar),
    Sabadello, M. (Danube Tech), Reed, D. (Evernym/Avast), Steele, O.
    (Transmute), & Allen, C. (Blockchain Commons). W3C. (2022).
    Decentralized Identifiers (DIDs) v1.0: Core architecture, data
    model, and representations. <https://www.w3.org/TR/did-core>

20. Sporny, M. (Digital Bazaar), Longley, D. (Digital Bazaar), &
    Chadwick, D. (University of Kent). W3C. (2022). Verifiable
    Credentials Data Model v1.1. <https://www.w3.org/TR/vc-data-model/>

21. Zcash. (n.d.). What is Jubjub? <https://z.cash/technology/jubjub/>

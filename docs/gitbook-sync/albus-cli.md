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

# Albus CLI

Command-line interface (CLI) v.0.0.1 for interacting with Albus program endpoints.

## Usage

```bash
pnpm cli [option(s)] [command]
```

`-V`, `--version`: outputs the current version number

`-c`, `--cluster <CLUSTER>`: sets a Solana cluster (`mainnet-beta`, `testnet` or `devnet`; default: `devnet`)

`-k`, `--keypair <PATH_TO_KEYPAIR>`: sets a file path or URL to a keypair (default: `~/.config/solana/id.json`)

`-1`, `--log-level <LOGGING_LEVEL>`: sets sets a logging level (`info`, `error`, or `warn`; default: `info`)

`-h`, `--help`: displays information about the command

### Default values

Default values can be set or changed in an `.env` file via the following environmental variables:

* `CLI_SOLANA_CLUSTER=[value]`
* `CLI_SOLANA_KEYPAIR=[value]`
* `CLI_LOG_LEVEL=[value]`

### Usage example

* Running `admin sp add`:

```bash
pnpm cli admin sp add --code <UNIQUE_CODE> --name <NAME>
```

* Running `admin sp add` with `-h` to view arguments:

```bash
pnpm cli admin sp add -h
```

## Commands

### Identity

* Create an identity and store it as NFT. It identifies the NFT holder as the Albus holder and stores its state:

```bash
pnpm cli identity create
```

### Verifiable Credentials (VC)

* Show all VCs:

```bash
pnpm cli vc all
```

* Issue a VC and store it as NFT. The VC is encrypted with the NFT holder's pubkey:

```bash
pnpm cli vc issue --encrypt
```

### Proof generation

* Generate a ZK proof based on a corresponding circuit, and store it as NFT:

```bash
pnpm cli prove create --circuit <ADDRESS>
```

* Generate a ZK proof for a specific proof request, and store it as NFT:

```bash
pnpm cli request prove <ADDRESS>
```

### Verification

* Verify a ZK proof:

```bash
pnpm cli verify proof --circuit <ADDRESS> --proof <ADDRESS>
```

* Verify a proof request, and change the status to "verified" or "rejected" depending on the output:

```bash
pnpm cli request verify <ADDRESS>
```

### Circuit management

* Register a new circuit:

```bash
pnpm cli admin circuit create <CIRCUIT_CODE>
```

### Web3 protocol management

* Register a Web3 protocol:

```bash
pnpm cli admin sp add --code <UNIQUE_CODE> --name <NAME>
```

* Remove a Web3 protocol:

```bash
pnpm cli admin sp remove <UNIQUE_CODE>
```

* Show Web3 protocol info:

```bash
pnpm cli admin sp show <UNIQUE_CODE>
```

* Show all Web3 protocols with optional filters:

```bash
pnpm cli admin sp all --authority <ADDRESS>
```

### Proof request management

* Create a proof request:

```bash
pnpm cli request create --sp <CODE> --circuit <ADDRESS>
```

* Delete a proof request:

```bash
pnpm cli request remove <ADDRESS>
```

* Show a proof request based on its program derived address (PDA):

```bash
pnpm cli request show <ADDRESS>
```

* Find and show a proof request based on a Web3 protocol's PDA, circuit NFT's mint address, and/or proof request owner's address:

```bash
pnpm cli request find --sp <CODE> --owner <ADDRESS> --circuit <ADDRESS>
```

* Show all proof requests with optional filters by service provider's PDA, circuit NFT's mint address, and/or ZKP NFT's mint address:

```bash
pnpm cli request all --sp <CODE> --circuit <ADDRESS> --proof <ADDRESS>
```

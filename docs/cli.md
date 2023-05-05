# Albus CLI v.0.0.1

Command-line interface (CLI) for interacting with Albus program endpoints.

## Usage

```bash
pnpm cli -c <CLUSTER> -k <PATH_TO_PRIVATE_KEY> -l <LOG_LEVEL> <COMMAND>
```

`CLUSTER`: `mainnet-beta`, `testnet` or `devnet`; `devnet` is the default value

`PATH_TO_PRIVATE_KEY`: the default value is `~/.config/solana/id.json`

`LOG_LEVEL`: `info`, `error`, or `warn`

`COMMAND`: the main command name

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

Create an identity and store it as NFT. 
It identifies the NFT holder as the Albus holder and stores its state:

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

Generate a proof on a corresponding circuit, and store it as NFT:

```bash
pnpm cli prove create --circuit <ADDR>
```

Generate a proof for selected ZKP Request, and store it as NFT:

```bash
pnpm cli prove request <ADDR>
```

## Verification

Verify a proof:

```bash
pnpm cli verify proof --circuit <ADDR> --prof <ADDR>
```

Verify ZKP Request, and change the status to "Verified" or "Rejected" depending on the output:

```bash
pnpm cli verify request <ADDR>
```

### Circuit Management

Register new Circuit:

```bash
pnpm cli admin circuit create <CIRCUIT_CODE>
```

## DeFi Service Management

Register a DeFi service:

```bash
pnpm cli admin sp add --code <UNIQ_CODE> --name <NAME>
```

Remove a DeFi service:

```bash
pnpm cli admin sp remove <UNIQ_CODE>
```

Show a DeFi service info:

```bash
pnpm cli admin sp show <UNIQ_CODE>
```

Show all DeFi services with an optional filters:

```bash
pnpm cli admin sp all --authority <ADDR>
```

## ZKP Request Management

Create new ZKP request:

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

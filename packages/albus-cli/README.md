# Albus CLI v.0.0.1

CLI with albus program endpoints.

# Commands

```bash
pnpm cli -c <CLUSTER> -k <PATH_TO_PRIVATE_KEY> -l <LOG_LEVEL> <COMMAND>
```

CLUSTER: mainnet-beta, testnet or devnet; devnet is the default value

PATH_TO_PRIVATE_KEY: the default value is ${process.env.HOME}/.config/solana/id.json

LOG_LEVEL: info, error or warn

COMMAND: the main command that determines the request that will be sent to the smart-converter contract

### Example

Running the command (sp add) for the Testnet cluster:

```bash
pnpm cli -c testnet sp add
```

Running the command (sp add) for the default Devnet cluster:

```bash
pnpm cli sp add
```

> NOTE: The command takes required and optional arguments. To view them, run it with -h or --help.

```bash
pnpm cli sp add -h
```

-------------------------------------------------------
Identity
-------------------------------------------------------

### Создает НФТ - идентификатор , описывающий участие в альбусе с хранением состояния холдера

Create new identity:

```bash
pnpm cli identity new
```

-------------------------------------------------------
Verifiable Credentials
-------------------------------------------------------

Show all VCs:

```bash
pnpm cli vc all
```

### Генерация - выдаем в виде нфт (VC шифрованый публичником холдера нфт)
### this function is used to generate and mint an NFT for a given VC

Issue new VC:

```bash
pnpm cli vc issue
```

-------------------------------------------------------
Circuit
-------------------------------------------------------

Create new circuit NFT:
### this function is used to generate and mint an NFT for a given circuit (эти циркуты прописаны в определенных файлах этого проекта)
### circuit нфт генерируется по названию (название передается в параметрах)

```bash
pnpm cli circuit create
```

-------------------------------------------------------
Prove
-------------------------------------------------------

Create new proof NFT:
### Создает пруф нфт по предварительно созданному циркуту (нфт циркут)

```bash
pnpm cli prove create
```

Create new proof NFT and save to albus program:
### Делает то же самое, что и метод выше, только сохраняет данные в контракт Альбус

```bash
pnpm cli prove request
```

-------------------------------------------------------
Verification
-------------------------------------------------------

Verify proof:
### Берет пруф нфт и циркут нфт и верифицирует их по определенному алгоритму (groth16)

```bash
pnpm cli verify create
```

Verify ZKP Request:
### То же самое, но с записью в Альбус (в зависимости от результата меняется статус zkp реквеста на - верифицирован/отклонен)

```bash
pnpm cli verify create
```

-------------------------------------------------------
Service Provider
-------------------------------------------------------

Add service provider:

```bash
pnpm cli sp add
```

Remove service provider:

```bash
pnpm cli sp remove
```

Show service provider's info by PDA address:

```bash
pnpm cli sp show
```

Find and show service provider's info by unique code:

```bash
pnpm cli sp find
```

Show all service providers with optional filter by authority:

```bash
pnpm cli sp show-all
```

-------------------------------------------------------
Zero Knowledge Proof Request
-------------------------------------------------------

Create ZKP request:

```bash
pnpm cli zkp create
```

Delete ZKP request:

```bash
pnpm cli zkp delete
```

Show ZKP request's info by PDA address:

```bash
pnpm cli zkp show
```

Find and show ZKP request's info by service provider PDA's address, circuit NFT's mint address and ZKP request's owner address:

```bash
pnpm cli zkp find
```

Show all ZKP requests with optional filters by service provider PDA's address, circuit NFT's mint address or proof NFT's mint address:

```bash
pnpm cli zkp show-all
```

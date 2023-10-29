# Albus Protocol Integration

### Rust integration

First of all, install the `albus-solana-verifier` crate.

```toml
[dependencies]
albus-solana-verifier = "0.1.2"
```

Check compliance
```rust
use albus_solana_verifier::AlbusCompliant;

AlbusCompliant::new(&ctx.accounts.proof_request)
  // Optional verify policy
  .with_policy(ctx.accounts.policy.key())
  // Optional verify proof request owner
  .with_user(ctx.accounts.sender.key())
  .check()?;
```

Find proof request address
```rust
let policy = Pubkey::new();
let user = Pubkey::new();
let (proof_request, _) = albus_solana_verifier::find_proof_request_address(&policy, &user);
```

Find policy address
```rust
let service = Pubkey::new();
let (proof_request, _) = albus_solana_verifier::find_policy_address(&service, "<CODE>");
```

Find service address
```rust
let (service_provider, _) = albus_solana_verifier::find_service_provider_address("<CODE>");
```

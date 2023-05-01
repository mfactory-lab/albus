# Creating VC NFT

The process of creating a VC NFT involves the following steps:

1. The user submits a request through the `issuer` service and receives a `signed_vc`.
2. The user generates a random key called the `shared_key`.
3. The user encrypts the VC using `poseidon_encryption` with the `shared_key`.
4. The user creates a `proof` that the data they are sending is correct.
   Proof input:
   - Private: `raw_vc`, `shared_key`
   - Public: `issuer_pubkey`, `signature`, `encrypted_vc`
5. The user sends the `encrypted_vc`, `signature`, and `proof` to the server.
  - The server verifies the proof by substituting public input `issuer_pubkey` + `encrypted_vc` + `signature`.
  - If the proof is valid, a `vc_nft` is created with the `encrypted_vc` inside json metadata.

# Terms

`issuer` - Albus Issuer Service
`vc` - Verifiable Credential
`signed_vc` - Signed Verifiable Credential
`shared_key` - The key which used for VC encryption
`poseidon_encryption` - SNARK-friendly encryption
`vc_nft` - The NFT that represents Verifiable Credential of the user

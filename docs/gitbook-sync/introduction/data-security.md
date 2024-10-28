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

# User Data Security

Albus Protocol handles three types of user data:

- Digital credentials.
- Retained user data. 
- Data for due diligence (DD) checks.

## Digital Credentials

Digital credentials are encrypted and securely stored on-chain as metadata associated with a Non-Fungible Token (NFT) owned by an end user:

- **User Control**: users control their digital credentials and decide when and how to share them, without compromising their integrity or revealing private information. Users can also delete their credentials at any time.
- **Decentralized Ownership**: the NFT-based storage means that control over digital credentials is decentralized and rests solely with users. This mitigates risks associated with centralized data storage, where a single breach can compromise user data.
- **Encryption**: the encryption of digital credentials ensures that the claims contained in them remain secure and unreadable to unauthorized entities.
- **Blockchain Security**: the inherent security features of blockchain technology, specifically immutability, add an additional layer of protection.

## Retained User Data

Retained user data is stored on-chain in encrypted form:

- **Encryption**: the data is encrypted using Shamir's Secret Sharing. This cryptographic scheme splits the decryption key into multiple shares that are distributed to Trustees. The key can only be reconstructed from a threshold number of these shares upon a legitimate request from an authorised entity. This ensures that no single unauthorised entity has access to the entire dataset.
- **View-Only Access for Users**: users can view their retained data but cannot delete it, as required by data retention laws. This ensures that while users can access their retained data for viewing, Web3 businesses remain compliant with necessary data retention requirements.

## Data for Due Diligence Checks

The user data submitted by an end user for a DD check consists of a Verifiable Presentation that includes Verifiable Credential(s) with the claims indicated in the DD spec. These claims are visible to the assigned AML Officer. After the DD check, this data is encrypted with the AML Officer's key and stored on IPFS.

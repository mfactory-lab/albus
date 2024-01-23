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

# Glossary

## Entities and modules

### Adapter

A dedicated service that runs on the Issuer node. It fetches user data (claims) from an Issuer and converts it to the W3C Verifiable Credential format. Each adapter is dedicated to a specific Issuer.

### Issuer node

A Node.js node deployed outside the Albus framework. It runs Adapters and issues digital credentials for users in the W3C Verifiable Credential format in case an Issuer cannot provide user data (claims) in this format.

### Issuer

A trusted third-party entity that verifies end users and, in case of successful verification, issues digital credentials for them. One of the common types is a KYC (Know-Your-Customer) provider, which specifically deals with KYC verification.

### Trustee

A Trustee is a trusted compliance partner that holds a share of the key required to decrypt retained user data in case it is required by an authorised entity with a legitimate request, for example a government agency or an audit firm. A Trustee can be an organization with a focus on compliance or regulatory affairs.

### User (end user)

An individual or an entity that wants to transact with a Web3 protocol and uses Albus to prove compliance with its policy in a privacy-preserving manner through Zero-Knowledge Proofs (ZKP). Users pass verification with an Issuer and obtain digital credentials from it. These credentials are stored in a user's wallet and are controlled by the user. In the SSI model, a user plays the role of a Holder.

### Web3 protocol (business user)

A blockchain-based business that uses Albus to verify that users who want to use its service comply with the policy that the business set for this service. Albus provides a tool for Web3 protocols to conduct this verification without accessing user data (claims), and to make the portion of user data required under applicable data retention regulations accessible to authorised entities with legitimate request. In the SSI model, a Web3 protocol plays the role of a Verifier.

## General terms

### Circuit

A cryptographic circuit built with circom for generating Zero-Knowledge Proofs. It takes two types of input: private and public. In the context of Albus, a circuit takes a user's private data (e.g., a birthdate) as private input, and a Web3 protocol's policy as public input. For example, if a Web3 protocol needs its users to be over 18 years old, an age circuit will be used that will take a user' birthdate as private input and the Web3 protocol's age requirement as public input.

### Claim

A piece of information about a user that is asserted to be true. This information can range from basic personal details, like a birthdate, to more complex attributes. Claims are fundamental elements of digital credentials and are essential for identity verification and compliance processes in Web3 applications.

### Compliance Certificate

A Compliance Certificate is issued for a user for a certain period of time as proof that the user complies with a Web3 protocol's policy.

### Digital credential (Verifiable Credential)

A digital document in the W3C Verifiable Credential format that contains user data (claims). Digital credentials are issued for users by Issuers or the Issuer node, and are used to prove user compliance with a Web3 protocol's policy through Zero-Knowledge Proofs. Digital credentials are controlled by users and can be revoked by their Issuers upon request, for example when a credential expires or a user's status changes.

### Policy

A requirement or a set of requirements defined by a Web3 protocol for its specific service using Albus. These requirements are based on internal rules and/or external regulations. Their combination may broadly vary: age + jurisdiction, age + banking account, age + jurisdiction + banking account, etc. In order to provide AML-compliant services to users on public chains, Web3 protocols must verify that the users who want to use their services comply with the requirement(s) set for these services.

### Private input

User data (claims) from a digital credential used as input to a cryptographic circuit to generate a Zero-Knowledge Proof.

### Proof request

A blockchain account created when an end user requests a Compliance Certificate in the Albus application. Proof requests contain retained user data and encrypted key shares of Trustees. In the Albus application, proof requests are represented by Compliance Certificates that end users receive once a ZK Proof is generated and verified.

### Public input

A publicly known policy set by a Web3 protocol for its service and used as input to a cryptographic circuit to generate and/or verify a Zero-Knowledge Proof.

### Retained user data

User data that must be retained by Web3 protocols under applicable data retention regulations. This dataset includes essential user data (claims) required to generate a Zero-Knowledge Proof and additional user data specified by a Web3 protocol as the information that may be requested by authorised entities with legitimate request (e.g., a government agency or an audit firm).

### Secret sharing scheme (Shamir's Secret Sharing, SSS)

Retained user data is encrypted using a secret sharing scheme, which involves splitting the key required to decrypt this data into multiple shares and passing each share to a Trustee. After the split, the key can be reconstructed using a specific number of these shares, for example two out of three. 

This cryptographic scheme ensures that retained user data cannot be accessed arbitrarily by any single party, but are always accessible to users for viewing and can be made accessible to authorised parties with legitimate request if necessary. Each key share is encrypted with a public key of the Trustee it belongs to, and stored in a proof request.

### Zero-Knowledge Proof (ZK Proof)

A Groth16 zk-SNARK (Zero-Knowledge Succinct Non-Interactive Arguments of Knowledge) proof generated by a circuit based on public and private input. This proof enables one party to prove to another that a statement is true without revealing any information beyond the validity of the statement itself. 

This type of ZK Proof is small in size and quick to verify, and non-interactive, requiring no back-and-forth communication between the prover and verifier. Groth16 is particularly notable for its efficiency and is widely used in blockchain applications, such as in Zcash, to ensure privacy and scalability by enabling the verification of transactions without disclosing the transactions' details.

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

# Privacy Tool Based On Zero-Knowledge Proofs (ZKP)

Zero-Knowledge Proofs are a cryptographic method that allows one party to prove to another party that a certain claim is true without revealing any information beyond the validity of the claim itself. This cryptotech is crucial in verification scenarios where information privacy is critical.

## ZKP in Albus Protocol

Albus utilizes Zero-Knowledge Proofs to ensure privacy of user data throughout verification in KYC/KYB use cases. Users can prove compliance with certain policies set by a Web3 business without revealing the underlying data. For instance, a user can prove their eligibility for a service based on age, without disclosing their birthdate.

## Groth16 zk-SNARKs

The specific type of Zero-Knowledge Proofs implemented in Albus is Groth16 zk-SNARKs. zk-SNARKs, which stands for "Zero-Knowledge Succinct Non-Interactive Argument of Knowledge," are known for their efficiency and succinctness, which makes them a suitable choice for blockchain applications where speed and minimal data usage are essential. Groth16 is a specific construction of zk-SNARKs that offers a streamlined approach to generating proofs, ensuring that the process is both quick and secure.

Zero-Knowledge Proofs in Albus Protocol are generated based on cryptographic circuits, which serve as a blueprint for how the proofs are constructed and verified.

## Circuits and Circom

Cryptographic circuits function similarly to logical circuits in computing, where they process inputs and produce an output based on predefined logical rules. In the context of Zero-Knowledge Proofs, these circuits take user's private data (claims) as private input and a Web3 business's policies (requirements) as public input. The circuit then performs a series of logical operations on these inputs, generating a Zero-Knowledge Proof. This proof confirms that the user's claim meets the Web3 business's policy without revealing the actual data.

Circuits are built using circom, a specialized circuit programming language. With circom, developers can define the exact logic and conditions that the circuit must follow to validate claims against business policies.

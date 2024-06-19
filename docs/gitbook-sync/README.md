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

# What is Albus Protocol?

Albus Protocol provides on-chain Zero-Knowledge-based verification infrastructure for Web3 businesses and their users. Building on Self-Sovereign Identity (SSI) model, Albus harnesses the power of blockchain and Zero-Knowledge Proofs (ZKP) to create a **privacy-oriented environment** where Web3 businesses can **verify users**, and users can **prove claims** about themselves to Web3 businesses. Albus also adds an **extra layer of compliance** by ensuring that user data can be safely retained under data retention law and made available to authorised entities with legitimate requests.

## Problem

There is no effective way for Web3 businesses to verify their users on blockchain without compromising the privacy of user data. Without proper verification practices in place, Web3 businesses are unable to capitalize on a number of important benefits that could give them a **competitive edge** or unlock **new revenue streams**. Such verification practices could also be part of a broader AML compliance solution that would allow businesses to bring **institutional capital on-chain** and/or tap into **security token trading**.

## Solution

Albus enables Web3 businesses to verify their users on-chain, while preserving user privacy and ensuring compliance with data retention laws. The Protocol relies on:

* [**Self-Sovereign Identity (SSI)**](self-sovereign-identity.md) and [**digital credentials**](digital-cred.md) to enable users to prove claims about themselves and to allow Web3 businesses to verify these claims in an environment where parties can trust each other and users are in control of their data.
* [**Shamir's Secret Sharing (SSS)**](data-retention-compliance.md) and a network of [**Trustees**](data-retention-compliance.md) to securely retain user data under data retention laws and ensure that authorised entities can access it upon a legitimate request.
* [**Zero-Knowledge Proofs**](zero-knowledge-proofs.md) to preserve the privacy of a user's claims during the verification.

{% hint style="info" %}
* Albus Protocol is designed as a **blockchain-agnostic** solution, which means it can be deployed on any public blockchain, regardless of whether it's EVM-compatible or not. Currently, it's deployed on Solana.
* The architecture of Albus has been designed to guarantee **service continuity**, even beyond the lifespan of the initial company that coded and deployed Albus.
{% endhint %}

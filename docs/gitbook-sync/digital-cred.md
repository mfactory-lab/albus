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

# Digital credentials

A digital credential is a digital document in the W3C Verifiable Credential format. This format is a standard in the digital identity domain, designed to ensure that credentials are interoperable across different systems and platforms. 

Digital credentials contain specific claims about a user. A claim could be any piece of information related to the user, such as a birthdate or other personal identifiers. Users need these claims to prove compliance with certain requirements of a Web3 business, with Zero-Knowledge cryptography allowing them to do it in a privacy-preserving manner.

Digital credentials are issued by either **Issuers** or the **Issuer node**:

- [**Issuers**](glossary.md#issuer) are trusted entities that either issue signed digital credentials or provide user data (claims) in some other format.
- In the latter case, the [**Issuer node**](glossary.md#issuer-node) converts the user data to the W3C Verifiable Credential format via a dedicated [**Adapter**](glossary.md#adapter) and issues the credential for a user.

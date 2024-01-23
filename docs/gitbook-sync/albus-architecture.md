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

# Albus architecture

<figure><img src="/docs/gitbook-sync/.gitbook/assets/albus-architecture.png" alt="Albus architecture diagram"><figcaption></figcaption></figure>

{% hint style="info" %}
* AML – Anti-Money Laundering&#x20;
* KYC – Know Your Customer&#x20;
* VC – Verifiable Credential
{% endhint %}

## Internal components

Albus Protocol includes 3 layers: frontend, blockchain, and backend.

### Frontend layer

The frontend layer includes 4 accounts that provide their users with access to the following functionality:

* **End user account**:
  * obtain Verifiable Credentials (VC);
  * delete Verifiable Credentials (VC);
  * create ZK Proof Requests (Certificates);
  * delete ZK Proof Requests (Certificates);
* **Business user account**:
  * create policies;
  * delete policies;
  * view ZK Proof Requests (Certificates) of end users;
* **Trustee account**:
  * store key shares for retained user data;
  * provide key shares in response to disclosure requests from authorised entities;
* **Authorised entity account**:
  * submit a retained data disclosure request to Trustees;
  * obtain a decryption key for decrypting retained user data.

### Blockchain layer

The blockchain layer includes:

* **encrypted VC (NFT)**: W3C Verifiable Credentials stored in encrypted form as NFT and controlled by end users;
* **policy**: a requirement or a set of requirements defined by a business user;
* **circuit**: a cryptographic circuit compiled with circom;
* **ZK Proof request**: a request for a ZK Proof created by an end user. A ZK Proof is linked to retained user data and to a set of key shares that are used to reconstruct the decryption key for decrypting the retained user data;
* **disclosure request**: a request created by an authorised entity for Trustees.

{% hint style="info" %}
For detailed definitions, please refer to the [Glossary](/docs/gitbook-sync/glossary.md).
{% endhint %}

### Backend layer

The backend layer includes the following methods:

* VC methods;
* ZK Proof methods;
* ZK Proof request methods;
* policy methods;
* circuit methods.

{% hint style="info" %}
For details, please refer to the [Integration](/docs/gitbook-sync/integration.md) and [CLI](/docs/gitbook-sync/albus-cli.md) sections.
{% endhint %}

## External components

Albus interacts with the following external entities:

- **End user**: an individual or an entity that obtains digital credentials by undergoing verification with an Issuer, and uses them to generate Zero-Knowledge Proofs (obtain Compliance Certificates) in order to prove compliance with a business user's policy.
- **Business user**: a Web3 business that sets policies incorporating one or several requirements to verify that its end users comply with them.
- **Issuer**: a trusted third-party entity that verifies end users and, in case of successful verification, issues Verifiable Credentials for them (e.g., KYC provider).
- **Issuer node**: a Node.js node that issues Verifiable Credentials for users in case an Issuer cannot provide user data (claims) in the W3C Verifiable Credential format. It runs **Adapters** that fetch user data from an Issuer and convert it to the W3C Verifiable Credential format. Each Adapter is dedicated to a specific Issuer.
- **Trustee**: a trusted compliance partner that holds a share of the key required to decrypt retained user data in case it is required by an authorised entity with a legitimate request.
- **Authorised entity**: an individual or an entity authorised to access retained user data for a legitimate purpose (e.g., conduct an investigation or an audit). 

{% hint style="info" %}
For detailed definitions, please refer to the [Glossary](/docs/gitbook-sync/glossary.md).
{% endhint %}

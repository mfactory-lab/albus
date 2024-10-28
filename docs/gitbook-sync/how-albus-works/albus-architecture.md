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

# Architecture

<figure><img src="/docs/gitbook-sync/.gitbook/assets/albus-architecture.png" alt="Albus architecture diagram"><figcaption></figcaption></figure>

{% hint style="info" %}
* AML – Anti-Money Laundering
* KYC – Know Your Customer
* VC – Verifiable Credential
* ZKP – Zero-Knowledge Proof
{% endhint %}

## Internal Components

Albus Protocol includes 3 layers: frontend, blockchain, and backend.

### Frontend Layer

The frontend layer includes user interfaces that provide the following functionality for different user roles:

* **End user**:
  * Manages VCs.
  * Manage Compliance Certificates.
  * Manage due diligence (DD) requests and proofs.
* **Business user**:
  * Manage policies.
  * Assign and remove Trustees.
  * View Compliance Certificates of end users.
* **AML Officer**:
  * Define due diligence (DD) specifications.
  * Issue proofs of due diligence (DD) for compliant users.
* **Trustee**:
  * Store key shares for retained user data.
  * Provide key shares to verified authorised entities based on their disclosure requests.
* **Authorised entity**:
  * Submit disclosure requests to a predefined list of Trustees.
  * Use key shares of Trustees to reconstruct a key for decrypting retained user data.

### Blockchain Layer

The blockchain layer includes the following data and smart contract entities:

* **Encrypted VCs (NFT)**: W3C Verifiable Credentials stored in encrypted form as NFT and controlled by end users.
* **Policy**: a requirement or a set of requirements defined by a business user for end users who want to use its service.
* **Circuit**: a cryptographic circuit that generates a Zero-Knowledge Proof, which proves that an end user complies with a business user's policy without revealing the end user's personal data.
* **Compliance Certificate**: a Certificate issued by Albus to confirm that an end user complies with a business user's policy.
* **DD requests**: due diligence (DD) requests submitted by end users to an AML Officer.
* **Disclosure request**: requests for the disclosure of retained user data submitted by an authorised entity to a predefined list of Trustees.

{% hint style="info" %}
For detailed definitions, please refer to the [Glossary](/docs/gitbook-sync/resources/glossary.md).
{% endhint %}

### Backend Layer

The backend layer includes the following methods that support operation of Albus Protocol:

* VC methods.
* VP methods.
* ZK Proof methods.
* Certificate methods.
* Policy methods.
* Circuit methods.

{% hint style="info" %}
For details, please refer to the [Integration](/docs/gitbook-sync/for-developers/integration.md) and [CLI](/docs/gitbook-sync/for-developers/albus-cli.md) sections.
{% endhint %}

## External Components

Albus interacts with the following external entities:

- **End user**: an individual or an entity that obtains digital credentials by undergoing verification with an Issuer, and uses them to obtain Compliance Certificates in order to prove compliance with a business user's policy.
- **Business user**: a Web3 business that sets policies incorporating one or several requirements to verify that its end users comply with them.
- **AML Officer**: a type of Issuer that conducts due diligence checks and issues proofs of due diligence (DD) for compliant users. It can be an in-house employee of a Web3 business or some other trusted entity.
- **Issuer**: a trusted third-party entity that verifies end users and, in case of successful verification, issues Verifiable Credentials for them (e.g., KYC provider).
- **Issuer node**: a Node.js node that issues Verifiable Credentials for users in case an Issuer cannot provide user data (claims) in the W3C Verifiable Credential format. It runs **Adapters** that fetch user data from an Issuer and convert it to the W3C Verifiable Credential format. Each Adapter is dedicated to a specific Issuer.
- **Trustee**: a trusted compliance partner that holds a share of the key required to decrypt retained user data in case it is required by an authorised entity with a legitimate request.
- **Authorised entity**: an individual or an entity authorised to access retained user data for a legitimate purpose (e.g., conduct an investigation or an audit). 

{% hint style="info" %}
For detailed definitions, please refer to the [Glossary](/docs/gitbook-sync/resources/glossary.md).
{% endhint %}

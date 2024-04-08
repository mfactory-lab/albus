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
* AML – Anti-Money Laundering
* KYC – Know Your Customer
* VC – Verifiable Credential
* ZKP – Zero-Knowledge Proof
{% endhint %}

## Internal components

Albus Protocol includes 3 layers: frontend, blockchain, and backend.

### Frontend layer

The frontend layer includes five accounts that provide their users with the following functionality:

* **End user account**:
  * Obtain VCs
  * Delete VCs
  * Create ZK Proof Requests (Compliance Certificates)
  * Delete ZK Proof Requests (Compliance Certificates)
* **AML Officer account**:
  * Define custom specifications for AML VCs
  * Perform AML checks
  * Issue AML VCs for users
* **Business user account**:
  * Create policies
  * Delete policies
  * View ZK Proof Requests (Compliance Certificates) of end users
* **Trustee account**:
  * Store key shares for retained user data
  * Provide key shares to verified authorised entities based on their disclosure requests 
* **Authorised entity account**:
  * Submit requests to disclose retained data to Trustees
  * Use key shares of Trustees to reconstruct a decryption key for decrypting retained user data

### Blockchain layer

The blockchain layer includes:

* **Encrypted VC (NFT)**: W3C Verifiable Credentials stored in encrypted form as NFT and controlled by end users.
* **Policy**: a requirement or a set of requirements defined by a business user.
* **Circuit**: cryptographic circuits compiled with circom.
* **ZK Proof request (Compliance Certificate)**: requests for ZK Proofs submitted by an end user. A ZK Proof is linked to retained user data and to a set of key shares that are used to reconstruct the decryption key for decrypting the retained user data.
* **AML VC requests**: requests for AML VCs submitted by end users to an AML Officer.
* **Disclosure request**: requests for retained user data disclosure submitted by an authorised entity to corresponding Trustees.

{% hint style="info" %}
For detailed definitions, please refer to the [Glossary](/docs/gitbook-sync/glossary.md).
{% endhint %}

### Backend layer

The backend layer includes the following methods:

* VC methods
* VP methods
* ZK Proof methods
* ZK Proof request methods
* Policy methods
* Circuit methods

{% hint style="info" %}
For details, please refer to the [Integration](/docs/gitbook-sync/integration.md) and [CLI](/docs/gitbook-sync/albus-cli.md) sections.
{% endhint %}

## External components

Albus interacts with the following external entities:

- **End user**: an individual or an entity that obtains digital credentials by undergoing verification with an Issuer, and uses them to generate Zero-Knowledge Proofs (obtain Compliance Certificates) in order to prove compliance with a business user's policy.
- **Business user**: a Web3 business that sets policies incorporating one or several requirements to verify that its end users comply with them.
- **AML Officer**: a type of Issuer that conducts AML checks and issues Verifiable Credentials for AML-compliant users. It can be an in-house employee of a Web3 business or some other trusted entity.
- **Issuer**: a trusted third-party entity that verifies end users and, in case of successful verification, issues Verifiable Credentials for them (e.g., KYC provider).
- **Issuer node**: a Node.js node that issues Verifiable Credentials for users in case an Issuer cannot provide user data (claims) in the W3C Verifiable Credential format. It runs **Adapters** that fetch user data from an Issuer and convert it to the W3C Verifiable Credential format. Each Adapter is dedicated to a specific Issuer.
- **Trustee**: a trusted compliance partner that holds a share of the key required to decrypt retained user data in case it is required by an authorised entity with a legitimate request.
- **Authorised entity**: an individual or an entity authorised to access retained user data for a legitimate purpose (e.g., conduct an investigation or an audit). 

{% hint style="info" %}
For detailed definitions, please refer to the [Glossary](/docs/gitbook-sync/glossary.md).
{% endhint %}

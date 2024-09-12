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

# Self-Sovereign Identity (SSI)

## Conventional SSI Model

In conventional setups, individuals' personal data is often controlled by third-party entities, such as Facebook or Google, which leads to concerns over privacy, data security, and misuse. SSI emerged as a response to these challenges, with a focus on giving individuals full control over their digital identities through blockchain-enabled decentralization. This approach empowers users to manage their own identity data, share it selectively, and ensures that they are the central authority over their personal information.

The SSI model comprises three main actors: the Issuer, the Holder, and the Verifier. In what is often called the "Triangle of Trust," these three actors work together in a system of mutual assurance to securely validate digital identities of users:

- **Issuers** are entities that issue digital credentials containing specific claims about Holders. Claims are assertions or attributes about a Holder, for example birthdate or degree. Issuers are typically an organization or authority trusted by Verifiers, like a university issuing a degree certificate.

- **Holders** are the users who control digital credentials and decide how and when to share the associated claims, like a graduate holding and presenting a degree certificate.

- **Verifiers** are those who request to verify the credentials' validity and the truthfulness of the claims they contain. Verifiers are like employers or government agencies that ask a person to present a document before providing a service.

## Constraints of Conventional SSI

While the SSI model efficiently addresses Know-Your-Customer (KYC) compliance, it falls short in other regulatory aspects. Its conventional implementation fails to ensure compliance with data retention requirements incorporated in Anti-Money Laundering (AML) regulations, and with the General Data Protection Regulation (GDPR). Both are critical in building a compliant infrastructure for public blockchains.

As mentioned above, traditional SSI grants users (Holders) full control over their digital identity. This means that a user can choose to delete their personal data whenever they wish. This conflicts with AML regulations, as they may require that this data be retained for a certain period of time in order to be provided to authorised entities as legitimately required, for example in case of an investigation.

The conventional SSI model also fails to guarantee privacy and confidentiality of personal data, as users openly present their credentials to Verifiers without decryption. GDPR compliance calls for a framework designed in a way that excludes access of any untrusted third parties to a user’s personal data.

## Albus SSI Model

Albus Protocol addresses these challenges innovatively by integrating Shamir's Secret Sharing and a network of Trustees into its SSI model. This approach ensures compliance with both data retention requirements and GDPR while maintaining the decentralized ethos of SSI.

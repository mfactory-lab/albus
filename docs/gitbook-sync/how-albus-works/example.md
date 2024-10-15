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

# Example of a KYC + Data Retention Use Case

## Business

ACME DeFi is a DeFi protocol that operates in a regulated market. It can lend crypto only to users over 18 years old. ACME DeFi integrates Albus to verify that the users who want to borrow crypto from it are over 18 old.

A business user from ACME DeFi connects a crypto wallet to Albus and sets an age policy using a corresponding cryptographic circuit. From now on, all users who initiate borrowing transactions with ACME DeFi are verified for compliance with the age policy via Albus.

## End User

Bob is a regular user who wants to borrow crypto from ACME DeFi. He visits its website, chooses the service, and gets redirected to Albus. Once he connects his wallet to Albus, he has to obtain a digital credential that will contain the required claim—his birthdate. He passes KYC verification with a trusted third-party KYC provider and obtains the credential from it. The digital document is then stored on-chain as NFT and controlled by Bob.

Now, Bob needs to prove his age to ACME DeFi without disclosing his birthdate. He proceeds to request a Compliance Certificate on the website, and his birthdate is passed to the age circuit chosen by ACME DeFi above. This initiates the generation of a Zero-Knowledge Proof, which cryptographically proves that Bob is over 18 without revealing the birthdate. Once it's done, Bob obtains the Compliance Certificate, which means that his age is confirmed through Zero-Knowledge Proof and ACME DeFi can conduct a regulation-compliant borrowing transaction with him.

## Data Retention

In order to ensure compliance with applicable data retention laws, Albus retains a certain set of Bob's private data. The dataset includes Bob's birthdate used for the age verification, and additional regulatory data. ACME DeFi specifies the regulatory data it needs to be retained in addition to Bob's birthdate in order to comply with the data retention law of the jurisdiction where it operates.

The Shamir's Secret Sharing (SSS) scheme encrypts Bob's birthdate and additional regulatory data, generating a specific number of shares of the decryption key. Albus distributes the key shares to the corresponding number of Trustees.

If a fiscal or any other authorised entity submits a request for access to Bob's retained data, the Trustees will verify the request. If it's legitimate, they will provide their key shares to this entity. After that, it can combine a pre-defined threshold number of these key share, reconstruct the decryption key, and use it to access Bob's retained data.

## Data Security

Bob's personal data remains private and accessible to Bob throughout the whole time he interacts with Albus:

* Bob controls his **digital credentials** and can delete them at any time.
* Bob's **retained data** is encrypted with the SSS scheme and can be accessed only by Bob or an authorised entity with a legitimate request.

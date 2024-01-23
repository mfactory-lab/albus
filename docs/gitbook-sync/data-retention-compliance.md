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

# Data retention compliance

## Shamir's Secret Sharing

The Shamir's Secret Sharing scheme encrypts a user's data to be retained, and splits the key required to decrypt this data into a specific number of shares. Each of these shares is then passed on to the corresponding number of Trustees. The decryption key can only be reconstructed from a threshold number of these shares—for example, two out of three.

## Network of Trustees

Trustees are compliance partners of Albus that are responsible for securely managing the key shares, and for handling compliance-related inquiries and requests from authorities of the jurisdiction where they operate. While no single Trustee can access the retained data, they collectively ensure that it remains accessible to the user for viewing purposes and can be made available to authorised entities upon a legitimate request.

When an authorised entity submits a request to access retained user data, the Trustees holding the key shares for this data verify the legitimacy of the request. After confirming it, they decrypt and pass their key shares to the authorised entity. Upon receiving a specific threshold number of the key shares, the authorised entity can reconstruct the decryption key and decrypt the retained user data.

## Retained user data

Retained data of a user contain the claim(s) passed to a circuit to generate a Zero-Knowledge Proof. This dataset also includes other personal data that a Web3 business needs to ensure compliance with local data retention requirements.

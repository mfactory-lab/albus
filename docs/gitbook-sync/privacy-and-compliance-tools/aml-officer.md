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

# AML Compliance Tool

The Anti-Money Laundering (AML) Compliance tool helps ensure that end users of Web3 businesses comply with AML regulations. An AML Officer is essentially a type of Issuer that conducts due diligence (DD) checks and issues DD proofs for users who pass these checks. This role can be filled by an in-house employee of a Web3 business or by some other trusted entity.

## How It Works

AML Officer defines a DD specification, where they indicate which data (or claims) is required from an end user for a DD check. When an end user needs to undergo such a check, they submit a request for it and obtain a digital credential with the required data, if they don't already have one.

After receiving the credential from the user, the AML Officer runs the DD check. If it is successful, the AML Officer issues a DD proof for the user. This proof can then be used to obtain a Compliance Certificate that will confirm that this user has passed the DD check with the AML Officer. Due to regulatory requirements and the likelyhood of changes in a user's status, AML Compliance Certificates may have a short validity period to ensure that they are reissued on a regular basis.

{% hint style="info" %}
An assigned AML Officer can see personal data of users submitted for a DD check. After the DD check, Albus protects this data by encrypting it with the AML Officer's key.
{% endhint %}

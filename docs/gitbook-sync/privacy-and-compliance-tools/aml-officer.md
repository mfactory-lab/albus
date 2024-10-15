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

# AML Compliance Functionality for AML Officers

The Anti-Money Laundering (AML) Compliance feature ensures that end users of Web3 businesses comply with AML regulations. An AML Officer is essentially a type of Issuer that conducts AML checks and issues AML credentials for users who pass these checks. This role can be filled by an in-house employee of a Web3 business or by some other trusted entity.

In their Albus workspace, AML Officers define AML credential specifications, in which they set the claims that the AML credentials must include. These claims are the user data from one or multiple credentials of a user that they obtain from a KYC or other provider. This data serves as input for AML checks, which AML Officers can perform via the user interface in Albus or via their own backend using Albus SDK. Certain claims, for example liveness checks, can be mandatory for all credentials. 

Once an AML Officer creates a spec for an AML credential, users can submit a request for this AML credential. If a user already has the required claim(s) in their existing credentials, this data is passed to the AML Officer for AML verification. If not, the user has to obtain credentials with the missing claims from a KYC or other provider.

After receiving the required claims, the AML Officer performs the AML check. If it is successful, the AML Officer issues the AML credential for the user, who can then obtain a Compliance Certificate from Albus. This Certificate will prove that this user has passed the AML check with the AML Officer. Due to regulatory requirements and the potential for changes in the user's status, AML Compliance Certificates can have a short validity period to ensure that they are reissued on a frequent basis.

{% hint style="info" %}
The user data passed as input for AML verification is accessible to the assigned AML Officer. After the AML check, this data is encrypted with the AML Officer's key.
{% endhint %}

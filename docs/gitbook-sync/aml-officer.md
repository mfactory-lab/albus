# AML Officer

The Anti-Money Laundering (AML) Officer feature ensures that end users of Web3 businesses comply with AML regulations. An AML Officer is essentially a type of Issuer that conducts AML checks and issues AML credentials for users who pass these checks. This role can be filled by an in-house employee of a Web3 business or by some other trusted entity.

In their Albus workspace, AML Officers define AML credential specifications, in which they set the claims that the AML credentials must include. These claims are the user data from one or multiple credentials of a user. This user data serves as input for AML checks, which AML Officers can perform via the user interface in Albus or via their own backend using Albus SDK. Certain claims, for example liveness checks, can be mandatory for all credentials. 

Once an AML Officer creates a spec for an AML credential, users can choose it in their workspace and request this AML credential from the AML Officer. If a user already has the required claim(s) in their existing credentials, this data is passed to the AML Officer for AML verification. If not, the user has to obtain credentials with the missing claims from other Issuers first.

After receiving the required claims, the AML Officer performs the AML check. If it is successful, the AML Officer issues the AML credential for the user, who can then obtain a Compliance Certificate from Albus. This Certificate will prove that this user has passed the AML check with the AML Officer. Due to regulatory requirements and the potential for changes in the user's status, AML Compliance Certificates can have a short validity period to ensure that they are reissued on a frequent basis.

{% hint style="info" %}
The user data passed as input for AML verification is accessible to the designated AML Officer. After the AML check, this data is encrypted with the AML Officer's key and stored on IPFS.
{% endhint %}

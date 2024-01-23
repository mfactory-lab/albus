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

# User workflows

## Business user workflow

To use Albus to verify its end users, a business user (Web3 protocol) has to set a policy that incorporates the requirements for them, and assign Trustees that will participate in a secret sharing scheme (for definitions, please refer to the [Glossary](/docs/gitbook-sync/glossary.md)).

<figure><img src="/docs/gitbook-sync/.gitbook/assets/business-user-flow.png" alt="Business user flow"><figcaption></figcaption></figure>

The business user visits the [Albus application website](https://app.albus.finance/), connects a wallet, and enters as a business.

_If it's not onboarded_, Albus displays a form that the business user needs to fill out to request onboarding. Once onboarded, the business user defines a policy and assigns Trustees.

After that, an end user who wants to use the service this policy applies to will have to prove compliance with it. To do this, this user has to pass verification with an Issuer, obtain a digital credential from it, and receive a Compliance Certificate that will confirm their eligibility to use the service.

## End user workflows

End users can use Albus to obtain and manage Compliance Certificates for services of business users they want to transact with. They can also use Albus to digitise physical documents and store them in the form of digital credentials that they can use later.

There are 3 scenarios for end users in Albus:

* **Wizard**: obtaining a Compliance Certificate through a wizard after requesting a service on a business user's website and getting redirected to Albus.
* **Request for Certificate**: manually requesting a Compliance Certificate on the dashboard.
* **Document digitisation**: digitising a physical document and storing it as a credential for later use.

### Wizard

When an end user visits a business user's website and requests its service, for example a token swap from a DeFi protocol, the business user redirects the user to the [Albus application website](https://app.albus.finance/). At the website, the user has to complete a quick wizard to prove compliance with the policy this business user has set for the requested service. After proving it, the user will receive a Compliance Certificate confirming their eligibility for the service.

<figure><img src="/docs/gitbook-sync/.gitbook/assets/end-user-flow1.png" alt="End user flow: Wizard"><figcaption></figcaption></figure>

After getting redirected to the Albus application website, the user connects a wallet, enters as a user, and starts interacting with the quick wizard.

_If the user already has a valid Certificate for the service_, they proceed to use it.

_If the Certificate has expired or is missing but the user has a digital credential containing the required data_, this data is automatically used to conduct compliance verification and issue a Certificate for the user.

_If the user doesn't have a required digital credential_, they undergo verification with a chosen Issuer. After the verification, the Issuer issues the digital credential that is stored as NFT on-chain and controlled by the user. Then this credential is used to verify the user's compliance and issue a Certificate.

### Request for Certificate

An end user can request a Compliance Certificate for a service of a business user directly on the Albus dashboard to save the effort of visiting its website and requesting the service there only to be redirected back to Albus.

<figure><img src="/docs/gitbook-sync/.gitbook/assets/end-user-flow2.png" alt="End user flow: Certificate request"><figcaption></figcaption></figure>

An end user enters Albus as a user, and pushes the **New Certificate** button on the **Dashboard** tab to request a Compliance Certificate manually. The user selects a business user and its policy that applies to the service the user wants to use. Then the user chooses a digital credential with the data required for compliance verification.

_If the user already has a valid Certificate for the service_, they proceed to use it.

_If the Certificate has expired or is missing but the user has a digital credential containing the required data_, this data is automatically used to conduct compliance verification and issue a Certificate for the user.

_If the user doesn't have a required digital credential_, they undergo verification with a chosen Issuer. After the verification, the Issuer issues the digital credential that is stored as NFT on-chain and controlled by the user. Then this credential is used to verify the user's compliance and issue a Certificate.

### Document digitisation

An end user can use Albus to digitise their physical documents and use their digital forms within the Albus ecosystem as needed.

<figure><img src="/docs/gitbook-sync/.gitbook/assets/end-user-flow3.png" alt="End user flow: document digitisation"><figcaption></figcaption></figure>

An end user enters Albus as a user, and pushes the **New Credential** button on the **Dashboard** tab. The user chooses an Issuer, passes verification, and obtains a digital credential that is stored as NFT on-chain and controlled by the user.

After that, the user can use data from the digital credential to prove compliance with policies of different business users.

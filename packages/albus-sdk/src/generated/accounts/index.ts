import { Issuer } from './Issuer'
import { Circuit } from './Circuit'
import { Policy } from './Policy'
import { ServiceProvider } from './ServiceProvider'
import { Trustee } from './Trustee'
import { InvestigationRequest } from './InvestigationRequest'
import { InvestigationRequestShare } from './InvestigationRequestShare'
import { ProofRequest } from './ProofRequest'
import { CredentialRequest } from './CredentialRequest'
import { CredentialSpec } from './CredentialSpec'

export * from './Circuit'
export * from './CredentialRequest'
export * from './CredentialSpec'
export * from './InvestigationRequest'
export * from './InvestigationRequestShare'
export * from './Issuer'
export * from './Policy'
export * from './ProofRequest'
export * from './ServiceProvider'
export * from './Trustee'

export const accountProviders = {
  Issuer,
  Circuit,
  Policy,
  ServiceProvider,
  Trustee,
  InvestigationRequest,
  InvestigationRequestShare,
  ProofRequest,
  CredentialRequest,
  CredentialSpec,
}

import { Circuit } from './Circuit'
import { CredentialRequest } from './CredentialRequest'
import { CredentialSpec } from './CredentialSpec'
import { InvestigationRequest } from './InvestigationRequest'
import { InvestigationRequestShare } from './InvestigationRequestShare'
import { Issuer } from './Issuer'
import { Policy } from './Policy'
import { ProofRequest } from './ProofRequest'
import { ServiceProvider } from './ServiceProvider'
import { Trustee } from './Trustee'

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
  Circuit,
  CredentialRequest,
  CredentialSpec,
  InvestigationRequest,
  InvestigationRequestShare,
  Issuer,
  Policy,
  ProofRequest,
  ServiceProvider,
  Trustee,
}

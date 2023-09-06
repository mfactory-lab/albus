import { Circuit } from './Circuit'
import { Policy } from './Policy'
import { ServiceProvider } from './ServiceProvider'
import { Trustee } from './Trustee'
import { InvestigationRequest } from './InvestigationRequest'
import { ProofRequest } from './ProofRequest'

export * from './Circuit'
export * from './InvestigationRequest'
export * from './Policy'
export * from './ProofRequest'
export * from './ServiceProvider'
export * from './Trustee'

export const accountProviders = {
  Circuit,
  Policy,
  ServiceProvider,
  Trustee,
  InvestigationRequest,
  ProofRequest,
}

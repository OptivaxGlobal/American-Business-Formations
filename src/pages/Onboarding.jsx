import SEO from '../components/SEO'
import useOnboardingWizard from './onboarding/useOnboardingWizard'
import OnboardingShellChrome from './onboarding/OnboardingShellChrome'
import BusinessNameStep from './onboarding/steps/BusinessNameStep'
import BusinessBasicsStep from './onboarding/steps/BusinessBasicsStep'
import ContactInfoStep from './onboarding/steps/ContactInfoStep'
import BusinessAddressStep from './onboarding/steps/BusinessAddressStep'
import OwnershipStep from './onboarding/steps/OwnershipStep'
import RegisteredAgentStep from './onboarding/steps/RegisteredAgentStep'
import OrganizerStep from './onboarding/steps/OrganizerStep'
import EffectiveDateStep from './onboarding/steps/EffectiveDateStep'
import EinAssistanceStep from './onboarding/steps/EinAssistanceStep'
import AddOnsStep from './onboarding/steps/AddOnsStep'
import PackageStep from './onboarding/steps/PackageStep'
import AccountStep from './onboarding/steps/AccountStep'
import ReviewStep from './onboarding/steps/ReviewStep'
import PaymentStep from './onboarding/steps/PaymentStep'
import ConfirmationStep from './onboarding/steps/ConfirmationStep'

const STEP_COMPONENTS = [
  BusinessNameStep, BusinessBasicsStep, ContactInfoStep, BusinessAddressStep,
  OwnershipStep, RegisteredAgentStep, OrganizerStep, EffectiveDateStep,
  EinAssistanceStep, AddOnsStep, PackageStep, AccountStep,
  ReviewStep, PaymentStep, ConfirmationStep
]

export default function Onboarding() {
  const wizard = useOnboardingWizard()
  const StepComponent = STEP_COMPONENTS[wizard.step]

  return (
    <>
      <SEO title="Form Your LLC" description="Complete your LLC formation details. Currently available for Texas LLC formations." path="/formation-details" noindex />
      <OnboardingShellChrome wizard={wizard}>
        <StepComponent key={wizard.step} wizard={wizard} />
      </OnboardingShellChrome>
    </>
  )
}

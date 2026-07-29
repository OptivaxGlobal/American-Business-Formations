import PageHero from '../components/PageHero'
import Breadcrumbs from '../components/Breadcrumbs'
import FAQ from '../components/FAQ'
import SEO from '../components/SEO'
import { breadcrumbSchema, faqSchema } from '../data/seo'

const faqs = [
  ['What does the Texas Secretary of State charge to file a Certificate of Formation?', 'The current filing fee is shown during onboarding and checkout, always separate from our service fee. Confirm the current amount on the Texas Secretary of State website if you’d like to verify it independently.'],
  ['What is a registered agent, and do I need one?', 'Texas law requires every LLC to maintain a registered agent with a Texas street address to receive legal notices and state correspondence. You can use our registered agent service or appoint your own eligible agent.'],
  ['Is my business name guaranteed to be available?', 'No. We perform a preliminary review, but only the Texas Secretary of State determines final availability when your Certificate of Formation is filed.'],
  ['What is the Texas Public Information Report?', 'An annual report filed alongside your franchise tax report that confirms your registered agent, registered office, and governing persons on file with the Comptroller.'],
  ['Do I have to pay for an EIN?', 'No the IRS issues EINs for free. Any fee we charge is an optional convenience charge for preparation and guidance, never required.'],
  ['Can I change my registered agent later?', 'Yes. You can switch registered agents at any time; we’ll help you file the required update with the state.'],
  ['Do you offer services outside Texas?', 'LLC formation is currently available in Texas only. The platform is built to add more states later, and we’d rather do one state well than many states shallowly.'],
  ['How do I cancel or pause a recurring service?', 'You can manage active services, including cancellation requests, from the Services tab in your dashboard at any time.'],
  ['Is American Business Formations a law firm?', 'No. We are a business filing and document-preparation service. We are not a law firm and do not provide legal, tax, or accounting advice.'],
  ['How is my payment information protected?', 'Checkout uses a secure, server-verified payment flow. We never store raw card details on our servers, and orders are only marked paid after our payment provider confirms the transaction.']
]

export default function FAQPage() {
  return <>
    <SEO title="Frequently Asked Questions" description="Answers to common questions about Texas LLC formation, registered agents, EINs, compliance, and your account." path="/faq" jsonLd={faqSchema(faqs)} />
    <PageHero
      crumbs={<Breadcrumbs items={[{ label: 'FAQ' }]} />}
      eyebrow="FAQ"
      title="Frequently asked questions"
      description="Search or browse answers about Texas LLC formation, compliance, and your account."
    />
    <FAQ items={faqs} searchable/>
  </>
}

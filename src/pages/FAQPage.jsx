import PageHero from '../components/PageHero'
import Breadcrumbs from '../components/Breadcrumbs'
import FAQ from '../components/FAQ'
import SEO from '../components/SEO'
import { breadcrumbSchema, faqSchema } from '../data/seo'

const faqs = [
  ['What does the state charge to file a Certificate of Formation?', 'The current filing fee for your selected state is shown during onboarding and checkout, always separate from our service fee. Filing fees vary by state confirm the current amount on your state’s official filing authority website if you’d like to verify it independently.'],
  ['What is a registered agent, and do I need one?', 'State law requires every LLC to maintain a registered agent with a physical street address in the formation state, to receive legal notices and state correspondence. You can use our registered agent service or appoint your own eligible agent.'],
  ['Is my business name guaranteed to be available?', 'No. We perform a preliminary review, but only your state’s Secretary of State (or equivalent filing authority) determines final availability when your formation document is filed.'],
  ['What is the Texas Public Information Report?', 'An annual report filed alongside a Texas LLC’s franchise tax report that confirms your registered agent, registered office, and governing persons on file with the Comptroller. Ongoing requirements like this vary by state your dashboard reflects the actual requirements for your formation state.'],
  ['Do I have to pay for an EIN?', 'No the IRS issues EINs for free. Any fee we charge is an optional convenience charge for preparation and guidance, never required.'],
  ['Can I change my registered agent later?', 'Yes. You can switch registered agents at any time; we’ll help you file the required update with the state.'],
  ['Which states do you support?', 'LLC Formation and Registered Agent are available across all 50 states, Washington, D.C., and Puerto Rico. Select your state or jurisdiction during onboarding and the government filing fee updates automatically. Virtual Office remains available in 21 supported states.'],
  ['How do I cancel or pause a recurring service?', 'You can manage active services, including cancellation requests, from the Services tab in your dashboard at any time.'],
  ['Is American Business Formations a law firm?', 'No. We are a business filing and document-preparation service. We are not a law firm and do not provide legal, tax, or accounting advice.'],
  ['How is my payment information protected?', 'Checkout uses a secure, server-verified payment flow. We never store raw card details on our servers, and orders are only marked paid after our payment provider confirms the transaction.'],
  ['How much does a registered agent cost?', 'Our registered agent service is $80 per year, per entity, and includes a monitored registered office address, same-day scanning of official notices, and compliance reminders.'],
  ['Can foreign founders without a U.S. Social Security Number get an EIN?', 'Yes. Foreign applicants can obtain an EIN through the IRS’s alternate, non-online application process. Our fee for foreign applicant filings is $130, reflecting the additional work this requires.'],
  ['What is an S-Corp election, and do you handle it?', 'An S-Corp election is a tax status an eligible LLC or corporation can choose by filing IRS Form 2553, without changing its legal structure. We prepare and file this election as part of our EIN & S-Corp Elections service.'],
  ['Do you offer a business mailing address separate from a registered agent?', 'Yes, two options. Mail Forwarding provides a professional business address with a unique suite number, separate from the legal registered agent requirement, for $35 per month per entity. Virtual Office adds a signed lease agreement to that same service for $49 per month.'],
  ['What is the difference between Compliance Support and Compliance Filings?', 'Compliance Support tracks your deadlines and sends reminders at no additional filing action. Compliance Filings is the paid service that actually prepares and submits filings like annual reports, amendments, and registered agent changes.'],
  ['What formation packages do you offer, and what do they cost?', 'Foundation ($150), Accelerated ($200, our most popular), and Complete ($250). Each is a one-time service fee plus the state filing fee, and each tier adds more of our standalone services, like registered agent and EIN filing, at a lower combined cost.'],
  ['Can I get an apostille for my business documents?', 'Yes. Our Apostille Services authenticate documents like your Certificate of Formation or Certificate of Good Standing for use in another country, for $450 plus any underlying government fee.'],
  ['How do I order a Certificate of Good Standing?', 'Through our Certificate of Good Standing service $70 plus the state’s own fee for the certificate or certified copy itself.']
]

export default function FAQPage() {
  return <>
    <SEO title="Frequently Asked Questions" description="Answers to common questions about LLC formation nationwide, registered agents, EINs, compliance, and your account." path="/faq" jsonLd={faqSchema(faqs)} />
    <PageHero
      crumbs={<Breadcrumbs items={[{ label: 'FAQ' }]} />}
      eyebrow="FAQ"
      title="Frequently asked questions"
      description="Search or browse answers about LLC formation across all 50 states, Washington, D.C. & Puerto Rico, compliance, and your account."
    />
    <FAQ items={faqs} searchable/>
  </>
}

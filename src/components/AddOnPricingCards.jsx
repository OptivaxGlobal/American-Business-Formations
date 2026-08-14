import { Link } from 'react-router-dom'
import Reveal from './Reveal'

// A-la-carte service pricing, reusing the exact .pricing-grid/.price-card
// styling from PricingCards.jsx (no dedicated CSS for this component the
// price-card theme classes there have no visual effect of their own, so
// omitting a theme here still matches perfectly). Kept as its own small data
// array rather than derived from src/data/pricing.js so the card copy/order
// shown here can be curated independently of the raw add-on catalog.
export const addOnPricingItems = [
  { name: 'Registered Agent', price: '$80', note: 'per year, per entity', description: 'A registered agent and registered office for official state and legal notices.', to: '/registered-agent' },
  { name: 'Business Formation Filings', price: '$95', note: '+ state fees', description: 'Articles of Organization, Incorporation, or nonprofit formation documents, prepared and filed.', to: '/business-formation-filings' },
  { name: 'Compliance Filings', price: '$95', note: '+ state fees', description: 'Annual reports, amendments, and other compliance filings prepared and submitted for you.', to: '/compliance-filings' },
  { name: 'Domestic EIN Filing', price: '$35', note: 'U.S. applicants', description: 'EIN application preparation and filing for U.S.-based responsible parties.', to: '/ein' },
  { name: 'Foreign EIN Filing', price: '$130', note: 'foreign applicants', description: 'EIN application preparation and filing for founders without a U.S. SSN or ITIN.', to: '/ein' },
  { name: 'S-Corp Election', price: '$130', note: 'IRS Form 2553', description: 'Elect S-Corp tax status for an already-formed, eligible LLC or corporation.', to: '/s-corp-election' },
  { name: 'Apostille Services', price: '$450', note: '+ authentication fees', description: 'Authenticate formation documents and certificates for use in another country.', to: '/apostille-services' },
  { name: 'Certificate of Good Standing', price: '$70', note: '+ state fees', description: 'Order an official Certificate of Good Standing or certified copies of your formation documents.', to: '/certificate-of-good-standing' },
  { name: 'Virtual Office', price: '$49', note: 'per month, per entity', description: 'A professional business address with a unique suite number and a signed lease agreement.', to: '/virtual-office' },
  { name: 'Mail Forwarding', price: '$35', note: 'per month, per entity', description: 'A professional business address with a unique suite number no lease agreement.', to: '/mail-forwarding' }
]

export default function AddOnPricingCards() {
  return <div className="pricing-grid">{addOnPricingItems.map((item, i) => (
    <Reveal as="article" delay={i % 6} className="price-card" key={item.name}>
      <div className="price-card-head">
        <h3>{item.name}</h3>
        <div className="price"><strong>{item.price}</strong><span>{item.note}</span></div>
      </div>
      <div className="price-card-body">
        <p>{item.description}</p>
        <Link className="btn btn-outline btn-block" to={item.to}>Explore service</Link>
      </div>
    </Reveal>
  ))}</div>
}

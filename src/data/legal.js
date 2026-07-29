// Real, substantive legal-page content. This is template language covering
// the practices this platform actually implements (see README and server/
// for the corresponding technical controls) have it reviewed by a
// licensed attorney for your jurisdiction before relying on it in
// production. It intentionally avoids claims the codebase doesn't back up
// (e.g. no promises about data we don't collect).
const UPDATED = 'July 25, 2026'

export const legalPages = {
  '/privacy': {
    title: 'Privacy Policy',
    updated: UPDATED,
    intro: 'This policy explains what information American Business Formations collects, how it is used, and the choices available to you.',
    sections: [
      ['Information we collect', 'Account information (name, email, hashed password), business formation details you submit (business name, addresses, ownership, registered agent selections), payment records (never raw card numbers those are handled directly by our payment processor), support messages, and technical information such as IP address and browser type used for security and rate limiting.'],
      ['Information we do not collect through this website', 'We do not collect Social Security Numbers, ITINs, or other sensitive tax identifiers through our standard web forms. If that information is ever required, it is gathered through a separate, more tightly controlled process never stored in your browser, our analytics, or application logs.'],
      ['How we use information', 'To provide the services you request (LLC formation preparation, registered agent service, compliance reminders, and similar), operate your account, respond to support requests, send transactional emails (confirmations, reminders, status updates), detect and prevent fraud or abuse, and meet our own legal and recordkeeping obligations.'],
      ['Legal basis and consent', 'Marketing communications are opt-in only the marketing consent checkbox in our forms is never pre-checked. You may withdraw consent at any time from your account settings or by contacting us.'],
      ['Sharing information', 'We share information with service providers who help us operate the platform payment processing, cloud hosting, email delivery, and (only where you request them) registered agent, compliance, banking, or insurance partners. We do not sell your personal information.'],
      ['Data retention', 'We retain account and formation records for as long as your account is active and as needed to meet legal, tax, and recordkeeping obligations. You may request deletion of your account subject to records we are required to keep.'],
      ['Security', 'We use hashed passwords, HTTP-only session cookies, rate limiting, and role-based access controls. No system is perfectly secure, but we design with these protections as a baseline, not an afterthought.'],
      ['Your rights', 'Depending on your state of residence, you may have rights to access, correct, delete, or receive a copy of your personal information, and to opt out of the sale or sharing of personal information (see our Do Not Sell or Share page). Contact us to exercise these rights.'],
      ['Children', 'Our services are intended for business owners age 18 and older. We do not knowingly collect information from children.'],
      ['Changes to this policy', 'We will update the "last updated" date above when this policy changes and, for material changes, provide additional notice.']
    ]
  },
  '/terms': {
    title: 'Terms of Service',
    updated: UPDATED,
    intro: 'These terms govern your use of the American Business Formations website and services. By creating an account or using our services, you agree to these terms.',
    sections: [
      ['Who we are', 'American Business Formations is a business filing and document-preparation service. We are not a law firm, accounting firm, or government agency, and we do not provide legal, tax, or accounting advice.'],
      ['Accounts', 'You are responsible for maintaining the confidentiality of your account credentials and for all activity under your account. Notify us immediately of any unauthorized use.'],
      ['Our services', 'We help you prepare and organize information for Texas LLC formation and related services (registered agent, EIN assistance, operating agreements, compliance tracking, and more). Optional services are never required to purchase you may complete many of them (like obtaining an EIN) directly with the relevant government agency at no cost.'],
      ['Fees and payment', 'Our service fees are separate from any government filing fee. Both are itemized before you pay. Recurring services (such as registered agent renewal) will be clearly marked as recurring before you subscribe, and you may cancel future renewals from your dashboard.'],
      ['No guarantee of state approval', 'We prepare and submit filings on your behalf, but approval, rejection, and processing time are determined solely by the Texas Secretary of State (or other applicable agency) and are outside our control. We do not guarantee approval, a specific processing time, or that any business name is available.'],
      ['Your responsibilities', 'You are responsible for the accuracy of the information you submit. We rely on what you tell us when preparing filings and documents.'],
      ['Intellectual property', 'The website design, brand, and original content are owned by American Business Formations. Documents we prepare for you are yours to use for your business.'],
      ['Limitation of liability', 'To the fullest extent permitted by law, American Business Formations is not liable for indirect, incidental, or consequential damages arising from use of our services. Our total liability for any claim is limited to the amount you paid us for the service giving rise to the claim.'],
      ['Termination', 'You may close your account at any time. We may suspend or terminate accounts that violate these terms or misuse the platform.'],
      ['Governing law', 'These terms are governed by the laws of the State of Texas, without regard to conflict-of-law principles.'],
      ['Changes', 'We may update these terms from time to time. Continued use of our services after a change means you accept the updated terms.']
    ]
  },
  '/refund-policy': {
    title: 'Refund Policy',
    updated: UPDATED,
    intro: 'This policy explains how refund requests for our service fees are handled. It does not apply to government filing fees.',
    sections: [
      ['Service fees vs. government fees', 'Every order separates our service fee from the Texas state filing fee. Government filing fees are generally non-refundable once a filing has been submitted to the state, because the state itself does not refund them to us.'],
      ['Before we submit your filing', 'If you request a refund before we have submitted your Certificate of Formation (or other filing) to the state, we will refund our service fee in full.'],
      ['After submission', 'Once a filing has been submitted to the state, our service fee becomes non-refundable, because the work of preparing and submitting has been completed. Any state filing fee already paid to the Texas Secretary of State is not refundable by us under any circumstance.'],
      ['Add-on and recurring services', 'One-time add-ons (such as an operating agreement draft) follow the same before/after-delivery rule above. Recurring services (such as registered agent renewal) can be cancelled from your dashboard before the next renewal date to avoid future charges; the current period is not prorated.'],
      ['How to request a refund', 'Contact our support team from your dashboard or by email with your order number. We aim to respond within one business day and process approved refunds within 5–10 business days.']
    ]
  },
  '/disclaimer': {
    title: 'Legal Disclaimer',
    updated: UPDATED,
    intro: 'Please read this disclaimer carefully before using American Business Formations.',
    sections: [
      ['Not a law firm', 'American Business Formations is a business filing and document-preparation service. We are not a law firm, and no part of this website or our services constitutes legal advice or creates an attorney-client relationship.'],
      ['Not a government agency', 'We are an independent, privately owned company. We are not the Texas Secretary of State, the Texas Comptroller of Public Accounts, the IRS, or any other government agency, and we are not affiliated with or endorsed by any of them.'],
      ['Not tax or accounting advice', 'Nothing on this site is tax or accounting advice. Bookkeeping and tax-related content is general educational information. Consult a licensed CPA or tax professional about your specific situation.'],
      ['No guaranteed outcomes', 'We do not guarantee that any business name will be approved, that any filing will be accepted, or any specific processing time. State agencies make these determinations independently.'],
      ['Optional services', 'Services like EIN assistance are optional conveniences. You can always complete the underlying government process yourself, directly and at no government cost.'],
      ['When to seek professional advice', 'For questions involving complex ownership structures, disputes, regulatory compliance outside general formation, or tax strategy, consult a licensed attorney or accountant.']
    ]
  },
  '/cookie-policy': {
    title: 'Cookie Policy',
    updated: UPDATED,
    intro: 'This policy describes the cookies and similar technologies used on this website.',
    sections: [
      ['Essential cookies', 'We use an HTTP-only session cookie to keep you signed in securely. This cookie is required for the site to function and cannot be turned off without losing the ability to log in.'],
      ['Preference storage', 'Some non-account preferences (like your in-progress formation draft) are stored in your browser session storage so you don’t lose progress on refresh. This data stays on your device and clears when you close your browser tab, unless you’re signed in and it has been saved to your account.'],
      ['Analytics', 'If analytics are enabled, we use privacy-conscious, aggregated event tracking (such as which page led to a signup) and never send personally identifiable formation data, passwords, or payment details to analytics tools.'],
      ['Your choices', 'Most browsers let you block or delete cookies through their settings. Blocking essential cookies will prevent you from staying signed in.']
    ]
  },
  '/accessibility': {
    title: 'Accessibility Statement',
    updated: UPDATED,
    intro: 'American Business Formations is committed to making this platform usable by everyone, including people with disabilities.',
    sections: [
      ['Our approach', 'We build toward WCAG 2.2 AA guidance: semantic HTML, labeled form fields, visible keyboard focus states, sufficient color contrast, and support for screen readers and reduced-motion preferences.'],
      ['Ongoing work', 'Accessibility is an ongoing effort, not a one-time checklist. We review new features against these guidelines as we build them.'],
      ['Let us know', 'If you encounter an accessibility barrier anywhere on this site, please contact our support team with the page and a description of the issue. We take these reports seriously and will work to address them.']
    ]
  },
  '/do-not-sell': {
    title: 'Do Not Sell or Share My Personal Information',
    updated: UPDATED,
    intro: 'We do not sell your personal information. This page explains your choices under applicable state privacy laws (such as the California Consumer Privacy Act).',
    sections: [
      ['Our practice', 'American Business Formations does not sell personal information to third parties for money. We share information only with service providers who help us operate the platform (payment processing, hosting, email delivery) and, only at your request, with service partners like registered agent, banking, or insurance providers you choose to engage.'],
      ['Your rights', 'Depending on your state of residence, you may have the right to opt out of the "sharing" of personal information for cross-context behavioral advertising, even where no sale occurs. We do not currently engage in cross-context behavioral advertising.'],
      ['How to submit a request', 'Contact us from your account settings or by email to ask questions about how your information is handled or to exercise applicable privacy rights.']
    ]
  }
}

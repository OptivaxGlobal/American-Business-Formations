import {
  BadgeCheck, Banknote, BookOpenCheck, BriefcaseBusiness, Building2,
  Calculator, CircleDollarSign, FileCheck2, FileKey2, FileText, Globe2,
  IdCard, Landmark, Mail, Megaphone, PackageCheck, ReceiptText, Scale,
  ShieldCheck, Sparkles, Stamp, Store, TrendingUp, Users, WalletCards
} from 'lucide-react'

export const serviceGroups = [
  {
    title: 'Start your business',
    items: [
      ['llc-formation', 'LLC Formation'], ['registered-agent', 'Registered Agent'],
      ['ein', 'EIN'], ['licenses-permits', 'Licenses & Permits'],
      ['sales-tax-permit', 'Sales Tax Permit'], ['trademark', 'Trademark'],
      ['formation-kit', 'Formation Kit'], ['s-corporation', 'S Corporation'],
      ['c-corporation', 'C Corporation'], ['virtual-address', 'Virtual Address']
    ]
  },
  {
    title: 'Finance & operations',
    items: [
      ['bookkeeping', 'Invoices & Bookkeeping'], ['business-banking', 'Business Banking'],
      ['business-insurance', 'Business Insurance'], ['legal-documents', 'Legal Documents'],
      ['funding-search', 'Funding Search'], ['business-coaching', 'Business Coaching']
    ]
  },
  {
    title: 'Branding & growth',
    items: [
      ['logo-maker', 'Logo Maker'], ['website-builder', 'Website Builder'],
      ['domain', 'Domain'], ['business-email', 'Business Email'],
      ['digital-business-card', 'Digital Business Card'], ['business-cards', 'Business Cards']
    ]
  }
]

const commonFaq = [
  ['How long does the process take?', 'Timing depends on the service and the state or agency involved. Your dashboard shows each milestone and any action required from you.'],
  ['Can I use this service if I am new to business?', 'Yes. The experience is designed for first-time founders with plain-language steps and guided forms.'],
  ['Will I receive my documents online?', 'Yes. Completed documents and status updates can be made available in your secure client dashboard.']
]

export const services = {
  'llc-formation': {
    icon: Building2,
    eyebrow: 'Business formation',
    title: 'Start your LLC with a clear, guided process',
    short: 'Prepare your formation details, organize filing information, and track the journey in one place.',
    intro: 'Answer a few simple questions about your business. American Business Formations organizes the information your filing team needs and keeps your next steps visible.',
    image: '/illustrations/hero-business.svg',
    features: ['State selection guidance', 'Business name and ownership questionnaire', 'Formation status timeline', 'Secure document center', 'Optional EIN and compliance add-ons'],
    steps: [['Tell us about your business', 'Choose a state, enter your preferred name, and answer a short ownership questionnaire.'], ['Review your formation plan', 'See your selected package, estimated state costs, and recommended add-ons.'], ['Track every milestone', 'Follow submission, review, and completion from your dashboard.']],
    faq: [['What information do I need to form an LLC?', 'Typically your preferred business name, state, address, management structure, owners, and registered agent details.'], ...commonFaq]
  },
  'registered-agent': {
    icon: ShieldCheck,
    eyebrow: 'Compliance support',
    title: 'A reliable point of contact for official notices',
    short: 'Keep registered-agent information organized and receive clear alerts for important documents.',
    intro: 'A registered agent is designated to receive official correspondence for a business. Our portal is designed to keep notices, deadlines, and records easy to find.',
    image: '/illustrations/registered-agent.svg',
    features: ['Professional contact workflow', 'Document upload and notification center', 'Deadline reminders', 'Multi-state service request form', 'Privacy-focused onboarding'],
    steps: [['Select your state', 'Tell us where your entity is formed or will be formed.'], ['Add your business details', 'Provide entity and contact information.'], ['Manage notices online', 'View uploaded records and reminders from your dashboard.']],
    faq: [['Why does an LLC need a registered agent?', 'State rules generally require an LLC or corporation to maintain a designated recipient for official and legal notices.'], ...commonFaq]
  },
  ein: {
    icon: IdCard,
    eyebrow: 'Federal tax ID support',
    title: 'Organize your EIN application information',
    short: 'A guided intake for the details commonly needed for a federal employer identification number request.',
    intro: 'Collect responsible-party, entity, address, and business activity information in a structured workflow before submission.',
    image: '/illustrations/compliance.svg',
    features: ['Responsible party intake', 'Entity detail checklist', 'Business activity questionnaire', 'Status tracking', 'Downloadable summary'],
    steps: [['Complete the intake', 'Answer questions about ownership and business activity.'], ['Review for accuracy', 'Confirm spelling, addresses, and tax classification choices.'], ['Track completion', 'Follow the request status in your account.']], faq: commonFaq
  },
  'licenses-permits': {
    icon: BadgeCheck,
    eyebrow: 'Local and industry requirements',
    title: 'Find the licenses and permits your business may need',
    short: 'Tell us your location and activity to create a clear research request and compliance checklist.',
    intro: 'Requirements can vary by state, county, city, and industry. The guided flow captures the facts needed to assess your situation.',
    image: '/illustrations/compliance.svg',
    features: ['Location-based intake', 'Industry and activity questionnaire', 'Permit checklist workspace', 'Renewal date tracker', 'Document vault'],
    steps: [['Describe your business', 'Choose an industry and explain what you sell or provide.'], ['Add operating locations', 'Enter the states, counties, and cities where you operate.'], ['Review your checklist', 'See researched requirements and track progress.']], faq: commonFaq
  },
  'sales-tax-permit': {
    icon: ReceiptText,
    eyebrow: 'Sales tax registration',
    title: 'Prepare your sales tax permit request',
    short: 'Collect nexus, product, location, and marketplace details in one guided application flow.',
    intro: 'The portal helps your team understand where you sell, what you sell, and how transactions are processed.',
    image: '/illustrations/compliance.svg',
    features: ['State-by-state request flow', 'Product and service classification', 'Marketplace seller questions', 'Registration status tracking', 'Renewal reminders'],
    steps: [['Select states', 'Choose every state where you want a permit review.'], ['Add sales details', 'Describe products, channels, and expected volume.'], ['Manage registrations', 'Track open requests and completed records.']], faq: commonFaq
  },
  trademark: {
    icon: Stamp,
    eyebrow: 'Brand protection',
    title: 'Start a trademark intake for your name, logo, or slogan',
    short: 'A structured questionnaire for ownership, usage, goods, services, and specimen details.',
    intro: 'Build an organized trademark request and keep related files, notes, and milestones together.',
    image: '/illustrations/hero-business.svg',
    features: ['Name, logo, and slogan intake', 'Goods and services questionnaire', 'Usage and specimen upload', 'Search request workspace', 'Application milestone tracker'],
    steps: [['Choose what to protect', 'Select a word mark, logo, slogan, or combined mark.'], ['Explain how it is used', 'Describe products, services, and first-use details.'], ['Upload supporting files', 'Add logo files, examples, and ownership documents.']], faq: commonFaq
  },
  'formation-kit': {
    icon: PackageCheck,
    eyebrow: 'Business records',
    title: 'Keep your formation documents organized',
    short: 'A digital record center for certificates, agreements, resolutions, ownership records, and key dates.',
    intro: 'Organize the documents founders often need for banking, tax, contracts, and internal governance.',
    image: '/illustrations/compliance.svg',
    features: ['Company document vault', 'Custom checklist', 'Ownership record section', 'Resolution templates', 'Exportable company profile'],
    steps: [['Create your company profile', 'Enter entity information and ownership details.'], ['Upload or generate records', 'Store files and complete template-based records.'], ['Keep everything current', 'Update addresses, owners, and key dates.']], faq: commonFaq
  },
  's-corporation': {
    icon: Scale,
    eyebrow: 'Tax election support',
    title: 'Prepare an S corporation election request',
    short: 'Collect entity, ownership, tax-year, and consent details in one reviewable workflow.',
    intro: 'Use a guided questionnaire to assemble the information commonly reviewed before an S corporation election filing.',
    image: '/illustrations/compliance.svg',
    features: ['Eligibility intake', 'Shareholder detail collection', 'Tax-year selection', 'Consent checklist', 'Filing milestone tracker'],
    steps: [['Review eligibility questions', 'Answer entity and ownership questions.'], ['Add shareholder information', 'Enter names, addresses, and ownership percentages.'], ['Confirm and track', 'Review the summary and follow the request status.']], faq: commonFaq
  },
  'c-corporation': {
    icon: Landmark,
    eyebrow: 'Corporation formation',
    title: 'Build a guided C corporation formation plan',
    short: 'Organize corporate name, shares, directors, officers, addresses, and filing details.',
    intro: 'A dedicated formation intake for founders who want a corporation structure and a clear document workflow.',
    image: '/illustrations/hero-business.svg',
    features: ['Authorized share setup', 'Director and officer intake', 'Registered agent details', 'Corporate record checklist', 'Formation timeline'],
    steps: [['Choose a state and name', 'Start with jurisdiction and preferred corporate name.'], ['Define your structure', 'Add shares, directors, officers, and addresses.'], ['Review your filing plan', 'Confirm selections and track progress.']], faq: commonFaq
  },
  'virtual-address': {
    icon: Mail,
    eyebrow: 'Business address',
    title: 'Request a professional business address solution',
    short: 'Collect location, mail handling, privacy, and forwarding preferences.',
    intro: 'Create a request for a business address and define how you want mail scanned, stored, or forwarded.',
    image: '/illustrations/registered-agent.svg',
    features: ['Location request form', 'Mail handling preferences', 'Notification settings', 'Forwarding address controls', 'Document history'],
    steps: [['Pick a preferred market', 'Select a state or city preference.'], ['Choose mail handling', 'Set scanning, notification, and forwarding options.'], ['Manage requests online', 'Review mail records from the portal.']], faq: commonFaq
  },
  bookkeeping: {
    icon: Calculator,
    eyebrow: 'Financial organization',
    title: 'Keep bookkeeping requests and records in one workspace',
    short: 'A clean client portal for business profile details, monthly uploads, questions, and reports.',
    intro: 'Designed to connect smoothly with a future Flask backend and accounting integrations.',
    image: '/illustrations/banking.svg',
    features: ['Monthly document checklist', 'Transaction question queue', 'Report upload center', 'Year-end readiness tracker', 'Secure notes'],
    steps: [['Connect your profile', 'Add business and tax-year information.'], ['Upload monthly records', 'Provide statements, receipts, and supporting files.'], ['Review reports', 'Access completed summaries and open questions.']], faq: commonFaq
  },
  'business-banking': {
    icon: Landmark,
    eyebrow: 'Business finances',
    title: 'Prepare for a dedicated business bank account',
    short: 'Use a checklist for entity records, EIN, ownership, addresses, and banking preferences.',
    intro: 'The page helps founders understand and organize the information a banking partner may request.',
    image: '/illustrations/banking.svg',
    features: ['Banking readiness checklist', 'Ownership information intake', 'Document vault', 'Partner handoff placeholder', 'Status tracking'],
    steps: [['Complete your company profile', 'Add entity, address, ownership, and contact information.'], ['Upload supporting documents', 'Provide formation and tax ID records when available.'], ['Continue with a banking partner', 'Use a secure handoff when an integration is connected.']], faq: commonFaq
  },
  'business-insurance': {
    icon: ShieldCheck,
    eyebrow: 'Risk protection',
    title: 'Request insurance options tailored to your business',
    short: 'Capture industry, revenue, employees, property, and coverage preferences.',
    intro: 'A guided insurance inquiry that can later connect to your preferred carrier or broker API.',
    image: '/illustrations/registered-agent.svg',
    features: ['Industry risk questionnaire', 'Coverage preference selection', 'Location and payroll details', 'Document upload', 'Partner integration ready'],
    steps: [['Tell us about operations', 'Describe services, locations, staff, and assets.'], ['Choose coverage interests', 'Select liability, property, cyber, or other options.'], ['Receive next steps', 'Your portal can show quotes or broker follow-up status.']], faq: commonFaq
  },
  'legal-documents': {
    icon: FileText,
    eyebrow: 'Business templates',
    title: 'Create a request for essential business documents',
    short: 'Organize agreements, policies, resolutions, and internal records in one document center.',
    intro: 'Choose a document type, answer a guided questionnaire, and generate a structured request for review.',
    image: '/illustrations/compliance.svg',
    features: ['Document request catalog', 'Guided questionnaires', 'Draft status workspace', 'Version history placeholder', 'Secure downloads'],
    steps: [['Choose a document', 'Select the agreement, policy, notice, or resolution you need.'], ['Answer relevant questions', 'Provide parties, dates, terms, and business details.'], ['Review and download', 'Access completed files from your portal.']], faq: commonFaq
  },
  'funding-search': {
    icon: TrendingUp,
    eyebrow: 'Capital discovery',
    title: 'Build a funding profile for grants, loans, and programs',
    short: 'Collect location, industry, stage, revenue, ownership, and funding-use information.',
    intro: 'Create a reusable business funding profile that can power matching and partner integrations.',
    image: '/illustrations/banking.svg',
    features: ['Funding readiness profile', 'Use-of-funds questionnaire', 'Opportunity shortlist UI', 'Saved opportunities', 'Application tracker'],
    steps: [['Build your profile', 'Add stage, industry, revenue, location, and goals.'], ['Review potential matches', 'See sample opportunities and eligibility notes.'], ['Track your applications', 'Save deadlines and progress in one place.']], faq: commonFaq
  },
  'business-coaching': {
    icon: Users,
    eyebrow: 'Founder guidance',
    title: 'Turn business goals into an actionable coaching plan',
    short: 'Capture priorities, challenges, metrics, and meeting preferences.',
    intro: 'A coaching portal starter with goal cards, session scheduling placeholders, notes, and action items.',
    image: '/illustrations/hero-business.svg',
    features: ['Goal-setting workflow', 'Session request form', 'Action item tracker', 'Progress metrics', 'Resource library'],
    steps: [['Choose your goals', 'Select launch, sales, operations, marketing, or finance priorities.'], ['Describe your current challenge', 'Share context and desired outcomes.'], ['Track action items', 'Review assignments and progress from the dashboard.']], faq: commonFaq
  },
  'logo-maker': {
    icon: Sparkles,
    eyebrow: 'Brand identity',
    title: 'Start a guided logo concept brief',
    short: 'Collect business name, industry, style, color, symbol, and usage preferences.',
    intro: 'This frontend includes a logo brief builder ready for a future generation or design-service backend.',
    image: '/illustrations/hero-business.svg',
    features: ['Brand name and tagline fields', 'Style preference cards', 'Color selection UI', 'Industry and symbol prompts', 'Saved concept brief'],
    steps: [['Enter your brand details', 'Add your name, tagline, audience, and industry.'], ['Choose a direction', 'Select styles, colors, and symbol preferences.'], ['Save your brief', 'Send it to a designer or future generation service.']], faq: commonFaq
  },
  'website-builder': {
    icon: Globe2,
    eyebrow: 'Online presence',
    title: 'Plan a professional website for your new business',
    short: 'Create a website brief with pages, features, content, branding, and launch preferences.',
    intro: 'A structured project intake designed for easy Flask storage and future CMS or builder integrations.',
    image: '/illustrations/hero-business.svg',
    features: ['Website goal selector', 'Page and feature checklist', 'Brand asset upload placeholder', 'Content readiness tracker', 'Project dashboard'],
    steps: [['Choose your website type', 'Select service, portfolio, store, booking, or informational.'], ['Build the page plan', 'Choose pages and functionality.'], ['Submit the brief', 'Store the project and track next steps.']], faq: commonFaq
  },
  domain: {
    icon: Globe2,
    eyebrow: 'Web address',
    title: 'Search and save domain name ideas',
    short: 'A domain discovery interface ready to connect to a registrar API.',
    intro: 'Enter a name, view example suggestions, and save favorites before integrating live availability data.',
    image: '/illustrations/hero-business.svg',
    features: ['Domain search UI', 'Extension preference filters', 'Saved favorites', 'Registrar API-ready service layer', 'Brand naming tips'],
    steps: [['Search your business name', 'Enter keywords or an exact brand.'], ['Compare options', 'Review extension and naming alternatives.'], ['Save or continue', 'Store selections and connect checkout later.']], faq: commonFaq
  },
  'business-email': {
    icon: Mail,
    eyebrow: 'Professional communication',
    title: 'Set up a branded business email request',
    short: 'Choose a domain, mailbox names, team size, and preferred provider.',
    intro: 'A polished onboarding interface for future Google Workspace, Microsoft 365, or custom provider integration.',
    image: '/illustrations/compliance.svg',
    features: ['Mailbox name builder', 'Team member intake', 'Domain connection checklist', 'Provider preference', 'Setup status tracker'],
    steps: [['Choose a domain', 'Use an existing domain or add one later.'], ['Create mailboxes', 'Add names such as hello, support, sales, or individual staff.'], ['Track setup', 'Follow DNS and activation milestones.']], faq: commonFaq
  },
  'digital-business-card': {
    icon: WalletCards,
    eyebrow: 'Shareable profile',
    title: 'Create a smart digital business card profile',
    short: 'Add contact details, links, social profiles, branding, and a call to action.',
    intro: 'A digital profile builder starter that can later save public pages through Flask.',
    image: '/illustrations/hero-business.svg',
    features: ['Profile information form', 'Link and social fields', 'Theme selection', 'Live preview card', 'Share-page ready data model'],
    steps: [['Add your details', 'Enter name, role, company, phone, email, and links.'], ['Choose your look', 'Select a layout, accent, and call to action.'], ['Publish later', 'Connect the form to your Flask public-profile endpoint.']], faq: commonFaq
  },
  'business-cards': {
    icon: BriefcaseBusiness,
    eyebrow: 'Printed brand materials',
    title: 'Prepare a professional business card order brief',
    short: 'Collect names, roles, contact details, quantity, paper, and finish preferences.',
    intro: 'A product-style order intake ready for pricing, preview, and fulfillment integrations.',
    image: '/illustrations/hero-business.svg',
    features: ['Front and back content fields', 'Print preference selection', 'Quantity options', 'Artwork upload placeholder', 'Order summary UI'],
    steps: [['Add card information', 'Enter contact details and branding preferences.'], ['Choose print options', 'Select quantity, stock, corners, and finish.'], ['Review your order', 'Confirm specifications before a future checkout integration.']], faq: commonFaq
  }
}

export const iconMap = {
  Building2, ShieldCheck, IdCard, BadgeCheck, ReceiptText, Stamp, PackageCheck,
  Scale, Landmark, Mail, Calculator, FileText, TrendingUp, Users, Sparkles,
  Globe2, WalletCards, BriefcaseBusiness, Banknote, BookOpenCheck, CircleDollarSign,
  FileCheck2, FileKey2, Megaphone, Store
}

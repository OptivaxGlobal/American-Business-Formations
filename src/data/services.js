import {
  BadgeCheck, Building2, Calculator, CalendarClock, FileSignature, FileText,
  Globe2, IdCard, Landmark, Link2, Mail, MapPinned, NotebookPen,
  PackageCheck, Palette, ReceiptText, Scale, ShieldCheck, Stamp, TrendingUp,
  Umbrella, Users, BriefcaseBusiness
} from 'lucide-react'

// Mega-menu structure. Only active services appear here this list drives
// the header dropdown, footer columns, and homepage service sections. To
// launch a currently-inactive service, flip its `isActive` flag in the
// `services` object below and add it to a group here.
export const serviceGroups = [
  {
    title: 'Start your business',
    items: [
      ['llc-formation', 'LLC Formation'],
      ['registered-agent', 'Registered Agent'],
      ['ein', 'EIN Assistance'],
      ['operating-agreement', 'Operating Agreement'],
      ['texas-dba', 'DBA / Assumed Name']
    ]
  },
  {
    title: 'Manage your business',
    items: [
      ['texas-compliance', 'Compliance Support'],
      ['formation-kit', 'Formation Documents']
    ]
  }
]

const disclaimer = 'American Business Formations is a business filing and document-preparation service. We are not a law firm, accounting firm, or government agency, and this page is not legal, tax, or financial advice.'

export const services = {
  'llc-formation': {
    icon: Building2,
    category: 'Start your business',
    eyebrow: 'LLC Formation',
    automated: true,
    isActive: true,
    title: 'Form your LLC with a clear, guided process',
    short: 'Complete a guided application and prepare the information required to form your LLC.',
    intro: 'Forming an LLC means filing a Certificate of Formation with the Texas Secretary of State. We organize every piece of information that filing requires, keep your registered agent and ownership details straight, and give you one dashboard to track the whole process from your first answer to state approval.',
    image: '/illustrations/hero-business.svg',
    features: [
      'Guided formation questionnaire covering every required detail',
      'Preliminary business name review with restricted-word checks',
      'Registered agent selection with consent tracking',
      'Formation status timeline from submission to approval',
      'Secure document center for your Certificate of Formation'
    ],
    benefits: [
      'One guided flow instead of a blank state form',
      'Registered agent, EIN, and operating agreement options in the same place',
      'A dashboard that shows exactly what stage your filing is at',
      'Transparent pricing that separates our fee from the state filing fee'
    ],
    whoNeeds: 'Anyone starting a new LLC first-time founders, freelancers formalizing a business, and existing sole proprietors ready to add liability protection.',
    included: [
      'Formation questionnaire covering entity name, purpose, management, and registered agent',
      'Preliminary name review against basic formatting and restricted-word rules',
      'Preparation of your Certificate of Formation for internal review before filing',
      'Status tracking and document delivery in your client dashboard'
    ],
    limitations: [
      'Final name availability is determined only by the Texas Secretary of State at the time of filing we cannot guarantee any name',
      'State processing times vary and are outside our control',
      'This service does not include legal advice about which entity type or structure is right for you'
    ],
    steps: [
      ['Tell us about your business', 'Enter your proposed name, industry, and a short description of what your business does.'],
      ['Review your formation plan', 'See your selected package, the state filing fee, and any add-ons clearly separated.'],
      ['Track every milestone', 'Follow submission, internal review, state filing, and approval from your dashboard.']
    ],
    faq: [
      ['What does the state charge to file a Certificate of Formation?', 'The current Texas filing fee is shown during checkout and is always displayed separately from our service fee. Confirm the current amount on the Texas Secretary of State website before filing if you want to verify it independently.'],
      ['Is my business name guaranteed to be available?', 'No. We perform a preliminary review of your proposed name, but only the Texas Secretary of State makes the final determination on availability at the time your Certificate of Formation is filed.'],
      ['How long does approval take?', 'Processing time depends on the Secretary of State’s current workload and whether you choose standard or expedited processing. Your dashboard shows the current estimate and real status once filed.'],
      ['Do I need a registered agent?', 'Yes. State law requires every LLC to maintain a registered agent with a Texas street address. You can use our registered agent service or appoint your own eligible agent during the questionnaire.']
    ],
    related: ['registered-agent', 'ein', 'operating-agreement']
  },
  'registered-agent': {
    icon: ShieldCheck,
    category: 'Start your business',
    eyebrow: 'Registered Agent',
    automated: true,
    isActive: true,
    title: 'A dependable registered agent for your LLC',
    short: 'Choose a reliable registered agent and registered office for official business notices.',
    intro: 'Texas law requires every LLC to maintain a registered agent with a physical street address in the state a P.O. box alone is not enough. Our registered agent service gives your business a reliable, monitored address for service of process and official notices, with scanned documents and deadline reminders delivered straight to your dashboard.',
    image: '/illustrations/registered-agent.svg',
    features: [
      'Registered office address that meets state requirements',
      'Same-day scanning of service of process and official notices',
      'Compliance deadline reminders tied to your entity',
      'Consent and appointment tracked with a timestamped record',
      'Easy switch if you already have an agent and want to change'
    ],
    benefits: [
      'Keeps your home address off the public record',
      'Reduces the risk of missing a lawsuit notice or filing deadline',
      'One less thing to manage yourself as a first-time founder',
      'Works whether you’re forming a new LLC or already have one'
    ],
    whoNeeds: 'Any LLC or corporation required by law, not optional. Especially useful for home-based businesses and owners who travel or don’t want a home address on public filings.',
    included: [
      'A monitored registered office address',
      'Digital delivery of scanned documents to your dashboard',
      'Renewal reminders before your service term ends',
      'Update filings if your registered agent information changes'
    ],
    limitations: [
      'We cannot act as your registered agent until you’ve reviewed and confirmed the consent agreement',
      'A P.O. box cannot be used as the registered office address under Texas law',
      'This service does not include legal representation or advice about any documents you receive'
    ],
    steps: [
      ['Confirm your entity', 'Tell us about the LLC or corporation this service will cover.'],
      ['Add your business details', 'Provide entity and contact information and confirm registered agent consent.'],
      ['Manage notices online', 'View scanned documents and deadline reminders from your dashboard.']
    ],
    faq: [
      ['Why does an LLC need a registered agent?', 'State law requires every LLC and corporation to maintain a designated recipient for legal notices and official correspondence at a physical street address.'],
      ['Can I be my own registered agent?', 'Yes, if you have a physical street address in the state (not a P.O. box) and are available during normal business hours to receive documents.'],
      ['What happens if I miss a notice?', 'Missing service of process or an official notice can result in default judgments or loss of good standing. That’s the core problem a registered agent service solves.']
    ],
    related: ['llc-formation', 'texas-compliance', 'formation-kit']
  },
  ein: {
    icon: IdCard,
    category: 'Start your business',
    eyebrow: 'EIN Assistance',
    automated: true,
    isActive: true,
    title: 'Get organized help requesting your EIN',
    short: 'Get help preparing the information needed to request an Employer Identification Number.',
    intro: 'An Employer Identification Number (EIN) is issued directly by the IRS, free of charge, and most businesses need one to open a bank account, hire employees, or file taxes. Our EIN assistance service organizes the responsible-party, entity, and business-activity information the IRS asks for so your request is accurate and ready.',
    image: '/illustrations/compliance.svg',
    features: [
      'Responsible-party and entity detail intake',
      'Business activity questionnaire matched to IRS categories',
      'Status tracking from request to delivery',
      'Downloadable confirmation summary for your records',
      'No requirement to purchase you can apply directly with the IRS at no cost'
    ],
    benefits: [
      'Avoids common application mistakes that cause delays',
      'One place to store your EIN alongside your other formation documents',
      'Useful if you’d rather not navigate the IRS system yourself',
      'Clear, judgment-free guidance through the required questions'
    ],
    whoNeeds: 'New LLCs opening a business bank account, hiring employees, or filing federal taxes under the business rather than a personal SSN.',
    included: [
      'Guided intake for responsible party, entity type, and activity details',
      'Accuracy review before submission',
      'Status updates in your dashboard',
      'A summary document once your EIN is issued'
    ],
    limitations: [
      'The IRS issues EINs directly and does not charge a government fee our fee covers preparation and assistance only, and is entirely optional',
      'We do not collect Social Security Numbers or other sensitive tax identifiers through this website; that information is gathered through a secure, separate process',
      'This is not tax advice about your entity’s classification or filing obligations'
    ],
    steps: [
      ['Complete the intake', 'Answer questions about ownership and business activity no sensitive ID numbers are collected here.'],
      ['Review for accuracy', 'Confirm spelling, addresses, and entity classification before anything is submitted.'],
      ['Track completion', 'Follow the request status and download your EIN confirmation once issued.']
    ],
    faq: [
      ['Do I have to pay for an EIN?', 'No. The IRS issues EINs for free. Our fee is an optional convenience charge for preparation and guidance you’re never required to purchase it.'],
      ['Can I apply for an EIN myself?', 'Yes, directly through the IRS website at no cost. We recommend this service only if you’d prefer a guided process.'],
      ['Is my Social Security Number collected on this site?', 'No. Sensitive identifiers like an SSN or ITIN are collected through a secure, separate process never stored in your browser or this website’s standard forms.']
    ],
    related: ['llc-formation', 'operating-agreement', 'formation-kit']
  },
  'operating-agreement': {
    icon: FileSignature,
    category: 'Start your business',
    eyebrow: 'Operating Agreement',
    automated: true,
    isActive: true,
    title: 'Put your LLC’s ownership and rules in writing',
    short: 'Create a single-member or multi-member operating agreement based on your business structure.',
    intro: 'State law doesn’t require an LLC to file its operating agreement, but having one in writing is one of the most important things a new LLC can do it documents ownership percentages, management structure, and what happens if a member leaves. We prepare a draft based on the answers you already gave us during formation, ready for your review.',
    image: '/illustrations/compliance.svg',
    features: [
      'Single-member and multi-member templates',
      'Built from your existing formation answers no re-entering data',
      'Covers ownership, management, voting, and distributions',
      'Editable draft delivered to your document center',
      'Optional add-on never required to complete your order'
    ],
    benefits: [
      'Helps prevent disputes between members later',
      'Often requested by banks when opening a business account',
      'Reinforces your LLC’s liability protection by showing formal governance',
      'Keeps a clear record of ownership percentages and roles'
    ],
    whoNeeds: 'Every LLC, but especially multi-member LLCs and any business planning to open a bank account or bring on investors.',
    included: [
      'A drafted agreement matched to member-managed or manager-managed structure',
      'Ownership and distribution terms based on your intake answers',
      'A reviewable draft in your document center',
      'Guidance on what to do if you need to amend it later'
    ],
    limitations: [
      'This is a document-preparation service, not legal advice for complex ownership arrangements, consider having an attorney review the draft',
      'The agreement is not filed with the state; it’s an internal governance document you keep on record'
    ],
    steps: [
      ['Choose your structure', 'Single-member or multi-member, based on your formation questionnaire.'],
      ['Review the draft', 'Check ownership percentages, management terms, and voting rules.'],
      ['Store it with your records', 'Your signed agreement lives in your secure document center.']
    ],
    faq: [
      ['Is an operating agreement required?', 'No, filing one with the state isn’t required, but it’s strongly recommended as an internal governance document.'],
      ['Can I write my own instead?', 'Yes. This is an optional service you’re free to draft your own or have an attorney prepare one.'],
      ['Can I change it later?', 'Yes, an operating agreement can be amended any time all members agree to the changes.']
    ],
    related: ['llc-formation', 'formation-kit', 'registered-agent']
  },
  'texas-dba': {
    icon: Stamp,
    category: 'Start your business',
    eyebrow: 'DBA / Assumed Name',
    automated: true,
    isActive: true,
    title: 'Register an assumed name for your business',
    short: 'Get assistance registering an additional business name when required.',
    intro: 'If you want to operate or advertise under a name different from your LLC’s legal name, an Assumed Name Certificate filed with the state (and sometimes the county) is required. We prepare your filing information and keep the certificate in your document center once it’s on file.',
    image: '/illustrations/hero-business.svg',
    features: [
      'Guided intake for your assumed name and business details',
      'Filing preparation for the state assumed-name record',
      'County-level filing guidance where applicable',
      'Renewal reminders before your certificate expires',
      'Document storage for your completed certificate'
    ],
    benefits: [
      'Lets you brand and market under a different name than your legal entity name',
      'Often required before a bank will open an account under a trade name',
      'Keeps your assumed-name filings organized alongside your other formation records'
    ],
    whoNeeds: 'LLCs or sole proprietors operating under a trade name, running multiple brands under one legal entity, or rebranding without forming a new entity.',
    included: [
      'Assumed name intake and formatting review',
      'Filing preparation for state (and county, where applicable) records',
      'Certificate storage and renewal reminders'
    ],
    limitations: [
      'An assumed name does not create a new legal entity or provide liability protection on its own',
      'Some counties have separate filing requirements outside the Secretary of State’s system we’ll flag this during intake but local rules can vary'
    ],
    steps: [
      ['Enter your assumed name', 'Tell us the name you want to operate under and your legal entity details.'],
      ['We prepare your filing', 'Your Assumed Name Certificate is prepared for state (and county, if needed) filing.'],
      ['Receive your certificate', 'Your completed filing is stored in your document center with a renewal reminder.']
    ],
    faq: [
      ['Is a DBA the same as forming a new business?', 'No. An assumed name lets an existing entity operate under a different name it does not create a new legal entity or change your liability protection.'],
      ['Do I need a DBA if I already have an LLC name I like?', 'No, only if you plan to operate under a name different from your LLC’s legal name on file with the state.']
    ],
    related: ['llc-formation', 'formation-kit', 'registered-agent']
  },
  'texas-compliance': {
    icon: CalendarClock,
    category: 'Manage your business',
    eyebrow: 'Compliance Support',
    automated: true,
    isActive: true,
    title: 'Stay current with your LLC’s ongoing requirements',
    short: 'Stay informed about important filing, reporting, and renewal responsibilities.',
    intro: 'Forming your LLC is the beginning, not the end Texas LLCs have ongoing obligations like the annual Public Information Report and franchise tax report, both due May 15. This hub tracks what’s due, when, and gives you plain-language explanations for each requirement so nothing falls through the cracks.',
    image: '/illustrations/compliance.svg',
    features: [
      'Public Information Report tracking and reminders',
      'Franchise tax report due-date tracking',
      'Registered agent renewal reminders',
      'Sales tax filing reminders for permit holders',
      'A yearly internal review checklist'
    ],
    benefits: [
      'Reduces the risk of losing good standing with the state',
      'Plain-language explanations instead of government legalese',
      'One place to see every upcoming compliance date across your business'
    ],
    whoNeeds: 'Every active LLC compliance tracking is included for all formation customers and available as a standalone service for existing businesses.',
    included: [
      'A personalized compliance calendar based on your entity’s formation date',
      'Email and dashboard reminders ahead of each due date',
      'Plain-language guides for the Public Information Report, franchise tax, and registered agent renewal',
      'A place to mark tasks complete and store confirmations'
    ],
    limitations: [
      'We track and remind we do not file your franchise tax report or determine your tax liability; that requires the Texas Comptroller’s systems or a tax professional',
      'Not every business owes franchise tax, but most are still required to file a report; confirm your specific obligation with the Comptroller or your accountant'
    ],
    steps: [
      ['We build your calendar', 'Based on your formation date, we map out your Public Information Report, franchise tax, and renewal dates.'],
      ['You get reminded', 'Email and dashboard alerts arrive ahead of each deadline, not on the day it’s due.'],
      ['You stay in good standing', 'Mark tasks complete and keep confirmations in your document center.']
    ],
    faq: [
      ['What is the Public Information Report?', 'An annual report filed with your franchise tax report that confirms your LLC’s registered agent, registered office, and governing persons on file with the Texas Comptroller.'],
      ['Does every LLC owe franchise tax?', 'Many small entities owe no tax under the no-tax-due threshold, but most are still required to file a report. Confirm your specific situation with the Comptroller or a tax professional.'],
      ['What happens if I miss a compliance deadline?', 'Consequences range from penalties to loss of good standing or involuntary termination, depending on which requirement is missed. That’s exactly what this service is designed to help you avoid.']
    ],
    related: ['registered-agent', 'formation-kit', 'llc-formation']
  },
  'formation-kit': {
    icon: PackageCheck,
    category: 'Manage your business',
    eyebrow: 'Formation Documents',
    automated: true,
    isActive: true,
    title: 'Keep every formation document organized in one place',
    short: 'Access your formation records, agreements, receipts, and other important business documents.',
    intro: 'Between your Certificate of Formation, operating agreement, EIN confirmation, and registered agent paperwork, a new LLC accumulates a lot of important documents fast. Your document center organizes all of it plus receipts and ownership records into one secure, searchable place.',
    image: '/illustrations/compliance.svg',
    features: [
      'Company document vault with version history',
      'Ownership and governance record section',
      'Resolution templates for common company actions',
      'Exportable company profile for banks or partners'
    ],
    benefits: [
      'One login instead of scattered PDFs and email attachments',
      'Faster to hand documents to a bank, accountant, or investor',
      'Keeps a clean paper trail as your company grows'
    ],
    whoNeeds: 'Any LLC that wants organized, bank- and audit-ready records from day one.',
    included: [
      'Secure document vault tied to your business profile',
      'Editable company record templates',
      'A single exportable summary of your company’s key facts'
    ],
    limitations: [
      'This is a document organization tool, not a substitute for legal recordkeeping advice specific to your industry'
    ],
    steps: [
      ['Create your company profile', 'Enter entity information and ownership details.'],
      ['Add your documents', 'Upload files or use generated templates as they become available.'],
      ['Keep everything current', 'Update addresses, owners, and key dates as your business changes.']
    ],
    faq: [
      ['Is this the same as the document center in my dashboard?', 'Formation Documents adds organization templates and an exportable company profile on top of the standard document center included with every account.']
    ],
    related: ['llc-formation', 'operating-agreement', 'registered-agent']
  },

  // ---- Inactive services (hidden from public nav/footer/homepage/sitemap) ----
  // Content is preserved so any of these can be launched later by setting
  // isActive: true and adding a [slug, label] entry to a group above.
  'sales-tax-permit': {
    icon: ReceiptText, category: 'Stay compliant', eyebrow: 'Sales Tax Permit', automated: true, isActive: false,
    title: 'Prepare your Sales and Use Tax Permit request',
    short: 'A guided intake for nexus, product type, and sales channel details ahead of registering with the Comptroller.',
    intro: 'If you sell taxable goods or services in Texas, you generally need a Sales and Use Tax Permit from the Texas Comptroller of Public Accounts before making your first sale.',
    image: '/illustrations/compliance.svg',
    features: ['Guided intake for products, services, and sales channels', 'Marketplace and online-seller questions included', 'Registration status tracking in your dashboard', 'Filing frequency and renewal reminders once registered'],
    benefits: ['Clarifies whether your specific products or services are taxable', 'Keeps sales tax obligations from becoming a surprise at tax time'],
    whoNeeds: 'Businesses selling physical goods, certain taxable services, or operating an online store or marketplace.',
    included: ['Nexus and taxability intake questionnaire', 'Registration information prepared for Comptroller filing'],
    limitations: ['Whether your specific goods or services are taxable can be nuanced this service organizes your filing, it does not replace tax advice for edge cases'],
    steps: [['Tell us what you sell', 'Describe your products, services, and where your customers are located.'], ['We check the basics', 'We flag likely taxability and the filing frequency that fits your sales volume.'], ['Track your registration', 'Follow your permit status and upcoming filing due dates.']],
    faq: [['Do all businesses need a sales tax permit?', 'No only businesses that sell taxable goods or services. Many service-only businesses may not need one.']],
    related: ['texas-compliance', 'formation-kit']
  },
  'licenses-permits': {
    icon: BadgeCheck, category: 'Stay compliant', eyebrow: 'Business Licenses & Permits', automated: true, isActive: false,
    title: 'Find the licenses and permits your business may need',
    short: 'A location- and industry-based questionnaire that builds a preliminary permit checklist.',
    intro: 'Permit requirements vary by state, county, city, and industry. We ask about your industry, activity, and locations to build a preliminary checklist.',
    image: '/illustrations/compliance.svg',
    features: ['Location-based intake covering county and city', 'Industry and activity questionnaire', 'Preliminary permit checklist workspace'],
    benefits: ['Reduces the risk of missing a local requirement before you open'],
    whoNeeds: 'New businesses, especially in regulated industries or operating from a physical location.',
    included: ['A preliminary checklist based on your industry and location'],
    limitations: ['Permit recommendations are preliminary and may depend on state, county, city, and industry requirements we cannot fully verify from an online questionnaire'],
    steps: [['Describe your business', 'Choose an industry and explain what you sell or provide.'], ['Add your locations', 'Enter the city and county where you’ll operate.'], ['Review your checklist', 'See a preliminary list of likely requirements.']],
    faq: [['Is this checklist guaranteed to be complete?', 'No. Treat the checklist as a starting point and confirm with the relevant city, county, or state agency.']],
    related: ['texas-compliance', 'formation-kit']
  },
  bookkeeping: {
    icon: Calculator, category: 'Stay compliant', eyebrow: 'Bookkeeping & Tax Support', automated: false, isActive: false,
    title: 'Keep your books and tax prep organized in one workspace',
    short: 'A client portal for monthly document uploads, questions, and connecting with bookkeeping and tax professionals.',
    intro: 'A structured workspace to upload monthly records and route questions, with a path to connect with a bookkeeping or tax professional.',
    image: '/illustrations/banking.svg',
    features: ['Monthly document checklist and upload center', 'Transaction question queue', 'Year-end readiness tracker'],
    benefits: ['Keeps financial records organized instead of scattered across email'],
    whoNeeds: 'New LLCs that want organized books from day one.',
    included: ['A monthly upload checklist for statements and receipts'],
    limitations: ['Professional bookkeeping and tax preparation are provided through partner referral where available'],
    steps: [['Set up your profile', 'Add your business and tax-year information.'], ['Upload monthly records', 'Provide statements, receipts, and supporting files.'], ['Review and plan ahead', 'Track open questions and get ready for filing season.']],
    faq: [['Do you offer full-service bookkeeping?', 'Full-service bookkeeping and tax preparation are provided through partner professionals as that network becomes available.']],
    related: ['texas-compliance', 'formation-kit']
  },
  'business-banking': {
    icon: Landmark, category: 'Stay compliant', eyebrow: 'Business Banking', automated: false, isActive: false,
    title: 'Get ready for a dedicated business bank account',
    short: 'A readiness checklist for the documents banks typically ask for when you open a business account.',
    intro: 'Most banks ask for the same core documents before opening a business account. This page helps you organize what you’ll need.',
    image: '/illustrations/banking.svg',
    features: ['Banking readiness checklist', 'Ownership information intake', 'Document vault pulling from your formation records'],
    benefits: ['Avoids a wasted trip to the bank missing a required document'],
    whoNeeds: 'Any new LLC that hasn’t opened a dedicated business bank account yet.',
    included: ['A checklist of documents most banks request'],
    limitations: ['We do not currently operate as a bank this service organizes your readiness for a third-party bank account'],
    steps: [['Complete your company profile', 'Add entity, address, ownership, and contact information.'], ['Gather your documents', 'Pulled from your formation and EIN records where available.'], ['Open your account', 'Use a partner referral when available.']],
    faq: [['What documents do banks usually ask for?', 'Typically your Certificate of Formation, EIN confirmation, government ID for owners, and sometimes an operating agreement.']],
    related: ['ein', 'operating-agreement']
  },
  'business-insurance': {
    icon: Umbrella, category: 'Stay compliant', eyebrow: 'Business Insurance', automated: false, isActive: false,
    title: 'Request insurance options built around your business',
    short: 'A guided questionnaire covering industry, revenue, employees, and coverage preferences.',
    intro: 'This intake captures the details a carrier or broker needs, so when you’re ready to talk coverage, the conversation starts from real information.',
    image: '/illustrations/registered-agent.svg',
    features: ['Industry risk questionnaire', 'Coverage preference selection', 'Location and payroll detail intake'],
    benefits: ['Clarifies what type of coverage typically fits your business type'],
    whoNeeds: 'LLCs with employees, physical locations, client-facing services, or contractual insurance requirements.',
    included: ['A guided coverage-interest questionnaire'],
    limitations: ['We are not a licensed insurance agency and do not sell policies directly'],
    steps: [['Tell us about operations', 'Describe services, locations, staff, and assets.'], ['Choose coverage interests', 'Select liability, property, cyber, or other coverage types.'], ['Get connected', 'Receive next steps or a broker referral once available.']],
    faq: [['Do you sell insurance policies directly?', 'No. We are not a licensed insurance agency. This service organizes your information and connects you with a licensed broker or carrier partner.']],
    related: ['business-banking', 'formation-kit']
  },
  'virtual-address': {
    icon: MapPinned, category: 'Stay compliant', eyebrow: 'Virtual Business Address', automated: false, isActive: false,
    title: 'Request a professional business address solution',
    short: 'A mail-handling service for founders who don’t want to use a home address on public records.',
    intro: 'A virtual business address gives your company a professional mailing address separate from your registered agent address.',
    image: '/illustrations/registered-agent.svg',
    features: ['Location preference selection', 'Mail scanning and notification preferences'],
    benefits: ['Keeps your home address off business cards and public-facing materials'],
    whoNeeds: 'Home-based businesses and remote founders.',
    included: ['A location request form for your preferred market'],
    limitations: ['A virtual address is not automatically a valid registered agent address those have separate legal requirements'],
    steps: [['Pick a preferred market', 'Select a location preference.'], ['Choose mail handling', 'Set scanning and forwarding preferences.'], ['Manage requests online', 'Review incoming mail records.']],
    faq: [['Can I use a virtual address as my registered agent address?', 'No, not automatically registered agent addresses have specific legal requirements.']],
    related: ['registered-agent']
  },
  'legal-documents': {
    icon: FileText, category: 'Stay compliant', eyebrow: 'Legal Document Templates', automated: false, isActive: false,
    title: 'Create essential business documents from guided templates',
    short: 'A catalog of agreements, policies, and resolutions built through a guided questionnaire.',
    intro: 'Choose a document type, answer a short guided questionnaire, and get a structured draft ready for your review.',
    image: '/illustrations/compliance.svg',
    features: ['Document request catalog', 'Guided questionnaires for each document type'],
    benefits: ['Faster than starting from a blank page or generic internet template'],
    whoNeeds: 'LLCs that need client agreements, internal resolutions, or policies without hiring an attorney for every document.',
    included: ['A catalog of common business document types'],
    limitations: ['These are template-based documents, not customized legal advice'],
    steps: [['Choose a document', 'Select the agreement, policy, notice, or resolution you need.'], ['Answer relevant questions', 'Provide parties, dates, terms, and business details.'], ['Review and download', 'Access your completed draft from your document center.']],
    faq: [['Are these documents legally reviewed for my specific situation?', 'No. These are guided templates, not personalized legal advice.']],
    related: ['operating-agreement', 'formation-kit']
  },
  'funding-search': {
    icon: TrendingUp, category: 'Stay compliant', eyebrow: 'Business Funding Resources', automated: false, isActive: false,
    title: 'Build a funding profile for grants, loans, and programs',
    short: 'Organize the details that funding programs and lenders typically ask about your business.',
    intro: 'Build a reusable funding-readiness profile once, and use it to explore opportunities as they become available.',
    image: '/illustrations/banking.svg',
    features: ['Funding readiness profile', 'Use-of-funds questionnaire'],
    benefits: ['Saves time re-explaining your business for every application'],
    whoNeeds: 'Businesses exploring loans, grants, or funding programs.',
    included: ['A reusable funding-readiness profile'],
    limitations: ['We are not a lender or grant provider'],
    steps: [['Build your profile', 'Add stage, industry, revenue, location, and goals.'], ['Review potential programs', 'See example opportunities and general eligibility notes.'], ['Track your applications', 'Save deadlines and progress in one place.']],
    faq: [['Do you provide loans or grants directly?', 'No, we are not a lender or grant provider.']],
    related: ['business-plan', 'business-banking']
  },
  'business-coaching': {
    icon: Users, category: 'Brand & grow', eyebrow: 'Business Coaching', automated: false, isActive: false,
    title: 'Turn your goals into an actionable plan',
    short: 'A structured intake covering priorities, challenges, and metrics to guide a coaching conversation.',
    intro: 'This intake captures your goals, current challenges, and metrics, and connects you with a coaching resource matched to your stage.',
    image: '/illustrations/hero-business.svg',
    features: ['Goal-setting workflow', 'Session request form'],
    benefits: ['Focuses limited time on your highest-impact priorities'],
    whoNeeds: 'Founders who want outside perspective on launch, sales, operations, or finance decisions.',
    included: ['A goal and challenge intake questionnaire'],
    limitations: ['Coaching guidance is general business education, not personalized legal, tax, or investment advice'],
    steps: [['Choose your focus', 'Select launch, sales, operations, marketing, or finance priorities.'], ['Describe your challenge', 'Share context and the outcome you’re working toward.'], ['Track your progress', 'Review action items and follow-ups.']],
    faq: [['Is this financial or legal advice?', 'No. Coaching is general business guidance and education.']],
    related: ['business-plan']
  },
  'business-plan': {
    icon: NotebookPen, category: 'Brand & grow', eyebrow: 'Business Plan', automated: false, isActive: false,
    title: 'Build a clear, one-page business plan',
    short: 'A guided outline covering your customer, offer, go-to-market, and first 90 days.',
    intro: 'A focused plan you can actually use, and refine as your business grows.',
    image: '/illustrations/hero-business.svg',
    features: ['Guided plan-building questionnaire', 'Customer and offer clarity worksheet'],
    benefits: ['Faster and more useful than a generic template'],
    whoNeeds: 'New founders clarifying their business model, and existing owners preparing to pursue funding.',
    included: ['A structured one-page plan builder'],
    limitations: ['This is a planning tool, not a guarantee of business success or funding approval'],
    steps: [['Define your customer and offer', 'Clarify who you serve and the core problem you solve.'], ['Outline your go-to-market', 'Choose the channels you’ll use to reach your first customers.'], ['Set 90-day milestones', 'Turn the plan into concrete next steps.']],
    faq: [['Can I use this plan to apply for funding?', 'Many lenders and programs accept a clear, well-organized plan like this as a starting point.']],
    related: ['business-coaching', 'funding-search']
  },
  'logo-design': {
    icon: Palette, category: 'Brand & grow', eyebrow: 'Logo Design', automated: false, isActive: false,
    title: 'Start a guided logo concept brief',
    short: 'Capture your name, industry, style, and color preferences to brief a designer.',
    intro: 'This tool walks you through the details a designer needs and saves it as a brief ready for design work.',
    image: '/illustrations/hero-business.svg',
    features: ['Brand name and tagline fields', 'Style preference cards'],
    benefits: ['Clarifies your brand direction before design work starts'],
    whoNeeds: 'New businesses that need a logo and want a clear starting brief.',
    included: ['A guided brand brief questionnaire'],
    limitations: ['This tool prepares a design brief; it does not currently include automated logo generation'],
    steps: [['Enter your brand details', 'Add your name, tagline, audience, and industry.'], ['Choose a direction', 'Select styles, colors, and symbol preferences.'], ['Save your brief', 'Export it or send it to a designer when you’re ready.']],
    faq: [['Will my logo be generated automatically?', 'Not currently this tool builds a detailed brief for a design process.']],
    related: ['business-website']
  },
  'business-website': {
    icon: Globe2, category: 'Brand & grow', eyebrow: 'Business Website', automated: false, isActive: false,
    title: 'Plan a professional website for your new business',
    short: 'Build a website brief covering pages, features, and content before launch.',
    intro: 'This intake builds a structured project brief so your website project starts organized.',
    image: '/illustrations/hero-business.svg',
    features: ['Website goal selector', 'Page and feature checklist'],
    benefits: ['Prevents scope creep by defining pages and features up front'],
    whoNeeds: 'New businesses planning their first website, or existing businesses rebuilding an outdated one.',
    included: ['A website goal and structure questionnaire'],
    limitations: ['This service builds a project brief; it does not currently include website design or hosting'],
    steps: [['Choose your website type', 'Select service, portfolio, store, booking, or informational.'], ['Build your page plan', 'Choose the pages and functionality you need.'], ['Save your brief', 'Store your project plan and revisit it as you move to build.']],
    faq: [['Do you build the website for me?', 'This tool currently prepares a detailed project brief.']],
    related: ['domain', 'business-email']
  },
  domain: {
    icon: Link2, category: 'Brand & grow', eyebrow: 'Domain Registration', automated: false, isActive: false,
    title: 'Search and save domain name ideas',
    short: 'Explore naming options and save favorites before connecting a registrar.',
    intro: 'This tool helps you brainstorm and save options for your business name and extension preferences.',
    image: '/illustrations/hero-business.svg',
    features: ['Domain search interface', 'Extension preference filters'],
    benefits: ['Keeps your naming shortlist organized in one place'],
    whoNeeds: 'Any new business that needs a domain name.',
    included: ['A domain naming and extension preference tool'],
    limitations: ['Live domain availability and purchase checkout require a registrar integration that is not yet connected'],
    steps: [['Search your business name', 'Enter keywords or an exact brand name.'], ['Compare extensions', 'Review naming and extension alternatives.'], ['Save your favorites', 'Store your shortlist and connect checkout once available.']],
    faq: [['Can I buy a domain directly through this page?', 'Not yet this tool helps you brainstorm and save options.']],
    related: ['business-website', 'business-email']
  },
  'business-email': {
    icon: Mail, category: 'Brand & grow', eyebrow: 'Business Email', automated: false, isActive: false,
    title: 'Set up a branded business email request',
    short: 'Choose a domain, mailbox names, and provider preference ahead of setup.',
    intro: 'This intake gathers your domain, mailbox names, and provider preference so setup with a partner provider is fast once you’re ready.',
    image: '/illustrations/compliance.svg',
    features: ['Mailbox name builder', 'Team member intake'],
    benefits: ['More professional and trustworthy than a free personal email'],
    whoNeeds: 'Any business that wants a branded email address instead of a personal or free-provider account.',
    included: ['A mailbox naming and domain intake'],
    limitations: ['Live mailbox provisioning requires a provider integration that is not yet connected'],
    steps: [['Choose a domain', 'Use an existing domain or plan to add one.'], ['Create mailboxes', 'Add names such as hello, support, sales, or individual staff.'], ['Track setup', 'Follow DNS and activation steps once your provider is connected.']],
    faq: [['Do you host the email yourself?', 'No this service prepares your setup request for a provider like Google Workspace or Microsoft 365.']],
    related: ['domain', 'business-website']
  },
  'business-cards': {
    icon: BriefcaseBusiness, category: 'Brand & grow', eyebrow: 'Business Cards', automated: false, isActive: false,
    title: 'Prepare a professional business card order',
    short: 'Collect names, roles, contact details, and print preferences in one order brief.',
    intro: 'This intake captures your contact details and print preferences in one place, ready for pricing and fulfillment once a print partner is connected.',
    image: '/illustrations/hero-business.svg',
    features: ['Front and back content fields', 'Print preference selection'],
    benefits: ['Keeps card details consistent across your team'],
    whoNeeds: 'Any business that wants professional printed business cards.',
    included: ['A contact and content intake form'],
    limitations: ['Live printing and fulfillment require a print partner integration that is not yet connected'],
    steps: [['Add your details', 'Enter contact information and branding preferences.'], ['Choose print options', 'Select quantity, stock, corners, and finish.'], ['Review your order', 'Confirm specifications ahead of a future checkout integration.']],
    faq: [['Can I order cards directly through this page today?', 'This tool currently prepares your order details.']],
    related: ['logo-design', 'business-website']
  },
  trademark: {
    icon: Scale, category: 'Brand & grow', eyebrow: 'Trademark Assistance', automated: false, isActive: false,
    title: 'Start a trademark intake for your name, logo, or slogan',
    short: 'A structured questionnaire covering ownership, usage, goods, and specimen details.',
    intro: 'This intake organizes the ownership, usage, and goods-and-services details a trademark filing needs.',
    image: '/illustrations/hero-business.svg',
    features: ['Name, logo, and slogan intake', 'Goods and services questionnaire'],
    benefits: ['Organizes information a trademark filing requires before you start'],
    whoNeeds: 'Businesses with a distinctive brand name, logo, or slogan they want to protect beyond state entity registration.',
    included: ['A guided ownership and usage questionnaire'],
    limitations: ['This is an intake and organization service, not legal representation before the USPTO'],
    steps: [['Choose what to protect', 'Select a word mark, logo, slogan, or combined mark.'], ['Explain how it’s used', 'Describe products, services, and first-use details.'], ['Upload supporting files', 'Add logo files, examples, and ownership documents.']],
    faq: [['Is forming my LLC the same as trademarking my business name?', 'No. LLC formation registers your entity name with the state; a trademark protects your brand at the federal level through the USPTO.']],
    related: ['texas-dba', 'legal-documents']
  }
}

export const iconMap = Object.fromEntries(
  Object.entries(services).map(([slug, service]) => [slug, service.icon])
)

export function getRelatedServices(slug, limit = 3) {
  const service = services[slug]
  if (!service) return []
  return (service.related || [])
    .map(relSlug => ({ slug: relSlug, ...services[relSlug] }))
    .filter(item => item.title && item.isActive)
    .slice(0, limit)
}

export function getActiveServiceEntries() {
  return Object.entries(services).filter(([, service]) => service.isActive)
}

export { disclaimer as serviceDisclaimer }

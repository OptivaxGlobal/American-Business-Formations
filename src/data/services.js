import {
  Award, BadgeCheck, Building2, Calculator, CalendarClock, ClipboardCheck, FileCheck2, FileSignature, FileText,
  Globe, Globe2, IdCard, Inbox, Landmark, Layers, Link2, Mail, MapPinned, NotebookPen,
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
      ['business-formation-filings', 'Business Formation Filings'],
      ['registered-agent', 'Registered Agent'],
      ['ein', 'EIN & S-Corp Elections'],
      ['s-corp-election', 'S-Corp Election'],
      ['operating-agreement', 'Operating Agreement'],
      ['texas-dba', 'DBA / Assumed Name'],
      ['certificate-of-good-standing', 'Certificate of Good Standing'],
      ['apostille-services', 'Apostille Services']
    ]
  },
  {
    title: 'Manage your business',
    items: [
      ['texas-compliance', 'Compliance Support'],
      ['compliance-filings', 'Compliance Filings'],
      ['formation-kit', 'Formation Documents']
    ]
  },
  {
    title: 'Business address services',
    items: [
      ['virtual-office', 'Virtual Office'],
      ['mail-forwarding', 'Mail Forwarding']
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
    intro: 'Forming an LLC means filing the required formation document with the Secretary of State or appropriate filing authority in your selected state. We organize every piece of information that filing requires, keep your registered agent and ownership details straight, and give you one dashboard to track the whole process from your first answer to state approval.',
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
      'Final name availability is determined only by the appropriate state filing authority for your formation state at the time of filing we cannot guarantee any name',
      'State processing times vary and are outside our control',
      'This service does not include legal advice about which entity type or structure is right for you'
    ],
    steps: [
      ['Tell us about your business', 'Enter your proposed name, industry, and a short description of what your business does.'],
      ['Review your formation plan', 'See your selected package, the state filing fee, and any add-ons clearly separated.'],
      ['Track every milestone', 'Follow submission, internal review, state filing, and approval from your dashboard.']
    ],
    faq: [
      ['What does the state charge to file a Certificate of Formation?', 'The state filing fee for your selected formation state is shown during checkout and is always displayed separately from our service fee. Confirm the current amount on your state’s official filing authority website before filing if you want to verify it independently.'],
      ['Is my business name guaranteed to be available?', 'No. We perform a preliminary review of your proposed name, but only the appropriate state filing authority for your formation state makes the final determination on availability at the time your Certificate of Formation is filed.'],
      ['How long does approval take?', 'Processing time depends on your formation state’s current workload and whether you choose standard or expedited processing. Your dashboard shows the current estimate and real status once filed.'],
      ['Do I need a registered agent?', 'Yes. State law requires every LLC to maintain a registered agent with a physical address that meets the requirements of your formation state. You can use our registered agent service or appoint your own eligible agent during the questionnaire.']
    ],
    related: ['registered-agent', 'ein', 'operating-agreement']
  },
  'business-formation-filings': {
    icon: Layers,
    category: 'Start your business',
    eyebrow: 'Business Formation Filings',
    automated: true,
    isActive: true,
    title: 'Business formation filings, prepared and filed the right way',
    short: 'Formation paperwork for LLCs, corporations, and nonprofits prepared accurately and filed with the state.',
    intro: 'Forming a business means filing a specific document with a state agency: Articles of Organization for an LLC, Articles of Incorporation for a corporation, formation paperwork for a nonprofit, or a Certificate of Authority if you’re expanding an existing entity into a new state through foreign qualification. Each filing has its own requirements, and a rejected or incomplete filing costs you time and money. We prepare and file these documents for $95 plus the applicable state filing fee. Texas LLC formation is available today through our fully guided, automated intake corporation, nonprofit, and foreign qualification filings are prepared by our formation team on a guided basis so every detail is confirmed before it’s submitted.',
    image: '/illustrations/hero-business.svg',
    features: [
      'Guided intake covering entity type, structure, and formation state',
      'Preparation of Articles of Organization, Articles of Incorporation, or nonprofit formation documents',
      'Foreign qualification filings for entities expanding into a new state',
      'Accuracy review before anything is submitted to the state',
      'Status tracking and document delivery in your client dashboard'
    ],
    benefits: [
      'One flat $95 service fee plus the state’s actual filing fee no bundled markups',
      'Reduces the risk of a rejected filing from a missing or incorrect detail',
      'Texas LLC formation is a fully guided, automated process available now',
      'Corporation, nonprofit, and multi-state filings handled by our formation team'
    ],
    whoNeeds: 'Startups and entrepreneurs choosing between an LLC and a corporation, nonprofit founders preparing their formation paperwork, and existing businesses expanding into a new state through foreign qualification.',
    included: [
      'Entity-type and state intake to confirm exactly which filing you need',
      'Preparation of your Articles of Organization, Articles of Incorporation, or nonprofit formation document',
      'Submission to the correct state filing office',
      'Confirmation and a copy of your filed document delivered to your dashboard'
    ],
    limitations: [
      'The $95 service fee does not include the state’s filing fee, which varies by state and entity type the amount shown is the current Texas LLC filing fee',
      'Texas LLC formation is processed through our automated guided flow corporation, nonprofit, and out-of-state filings are prepared by our team and may take longer to complete',
      'We prepare and file formation documents we do not provide legal advice about which entity type or state is right for your business'
    ],
    steps: [
      ['Tell us what you’re forming', 'Answer a short intake about your entity type, industry, and the state where you’re filing.'],
      ['We prepare your filing', 'Your Articles of Organization, Articles of Incorporation, or nonprofit formation document is prepared and reviewed for accuracy.'],
      ['Track approval from your dashboard', 'Follow your filing from submission through state approval, with your confirmed document delivered when it’s done.']
    ],
    faq: [
      ['What’s the difference between this and your LLC Formation service?', 'LLC Formation is our fully automated, guided path for forming a Texas LLC specifically. Business Formation Filings covers that same Texas LLC path plus corporations, nonprofits, and foreign qualification filings for other entity types and states.'],
      ['Is the $95 fee the total cost?', 'No. The $95 is our service fee for preparing and filing your documents. The state’s filing fee is separate and varies by state and entity type it is never bundled into our fee.'],
      ['Can you form a corporation for me?', 'Yes. We prepare and file Articles of Incorporation for corporations. This path is handled on a guided basis by our formation team rather than the fully automated LLC intake.'],
      ['Do you form nonprofits?', 'Yes, we prepare and file nonprofit formation documents. Recognition of tax-exempt status with the IRS is a separate, additional process handled after your entity is formed.'],
      ['What is foreign qualification?', 'It’s the filing required when a business formed in one state wants to legally operate in another. We prepare and file the Certificate of Authority (or equivalent) your new state requires.'],
      ['Which states do you file in?', 'Texas LLC formation is available today through our automated intake. Formation and qualification filings in other states are handled by our team contact us with your state and entity type and we’ll confirm timing and requirements.'],
      ['How long does a formation filing take?', 'Texas LLC filings follow the standard or expedited processing time shown in your dashboard. Corporation, nonprofit, and out-of-state filings depend on that state’s current processing time we’ll give you a specific estimate after intake.'],
      ['What happens after my filing is approved?', 'You’ll receive your confirmed formation document in your client dashboard, along with next steps like your EIN, registered agent, and any compliance filings your entity now needs.']
    ],
    related: ['llc-formation', 'registered-agent', 'compliance-filings']
  },
  'registered-agent': {
    icon: ShieldCheck,
    category: 'Start your business',
    eyebrow: 'Registered Agent',
    automated: true,
    isActive: true,
    title: 'A dependable registered agent for your LLC',
    short: 'Choose a reliable registered agent and registered office for official business notices $80 per year, per entity.',
    intro: 'Every LLC and corporation is legally required to maintain a registered agent a designated recipient for lawsuits, subpoenas, and official state correspondence at a physical street address a P.O. box alone is not enough. Our registered agent service gives your business a reliable, monitored address for service of process and official notices, with scanned documents and compliance reminders delivered straight to your dashboard, for $80 per year, per entity.',
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
      'Professional representation instead of listing yourself personally',
      'One less thing to manage yourself as a first-time founder',
      'Works whether you’re forming a new LLC or already have one'
    ],
    whoNeeds: 'Any LLC or corporation required by law, not optional. Especially useful for home-based businesses, owners who travel, and founders who run more than one entity and want consistent representation across all of them.',
    included: [
      'A monitored registered office address',
      'Digital delivery of scanned documents to your dashboard',
      'Renewal reminders before your annual service term ends',
      'Update filings if your registered agent information changes'
    ],
    limitations: [
      'We cannot act as your registered agent until you’ve reviewed and confirmed the consent agreement',
      'A P.O. box cannot be used as the registered office address under Texas law',
      'Pricing is per entity, per state our Texas registered agent service is available today; coverage for entities registered in other states is arranged on request',
      'This service does not include legal representation or advice about any documents you receive'
    ],
    steps: [
      ['Confirm your entity', 'Tell us about the LLC or corporation this service will cover.'],
      ['Add your business details', 'Provide entity and contact information and confirm registered agent consent.'],
      ['Manage notices online', 'View scanned documents and deadline reminders from your dashboard.']
    ],
    faq: [
      ['Why does an LLC need a registered agent?', 'State law requires every LLC and corporation to maintain a designated recipient for legal notices and official correspondence at a physical street address. It’s a legal requirement, not an optional add-on.'],
      ['Can I be my own registered agent?', 'Yes, if you have a physical street address in the state (not a P.O. box) and are available during normal business hours to receive documents. Many owners choose our service instead to keep that address off the public record.'],
      ['What happens if I miss a notice?', 'Missing service of process or an official notice can result in default judgments or loss of good standing. That’s the core problem a registered agent service solves.'],
      ['What does "$80 per year, per entity" mean?', 'The service is priced per business entity, per year. If you run more than one LLC or corporation, each one is billed separately at $80 per year.'],
      ['Do you provide registered agent service in states other than Texas?', 'Our Texas registered agent service is available today through the standard intake. If you have an entity registered in another state, contact us we can arrange coverage on a case-by-case basis.'],
      ['How do I switch to your registered agent service if I already have one?', 'Tell us your current registered agent information during intake. We handle the update filing with the state so the change is official, then take over from your renewal date.'],
      ['Will my home address stay private?', 'Yes. Using our registered office address instead of your home address keeps your personal address off the state’s public business filings.'],
      ['How and when do I renew?', 'The service renews annually. We send reminders before your term ends, and renewal is billed automatically unless you cancel from your dashboard.'],
      ['What’s the difference between a registered agent and mail forwarding?', 'A registered agent is a legal requirement for receiving service of process and state notices. Mail forwarding is a general business mailing address for everyday correspondence. Many customers use both together see our Mail Forwarding service.']
    ],
    related: ['llc-formation', 'texas-compliance', 'mail-forwarding']
  },
  ein: {
    icon: IdCard,
    category: 'Start your business',
    eyebrow: 'EIN & S-Corp Elections',
    automated: true,
    isActive: true,
    title: 'Get your EIN and S-Corp election handled correctly',
    short: 'EIN filing for U.S. and foreign applicants, plus S-Corp election support for eligible businesses.',
    intro: 'An Employer Identification Number (EIN) is your business’s federal tax ID, issued by the IRS. Most businesses need one to open a bank account, hire employees, or file taxes. We prepare and file your EIN application for $35 for U.S. applicants, or $130 for foreign applicants, who face additional IRS requirements and generally cannot apply through the standard online system. If your business is eligible and would benefit from being taxed as an S-Corporation, we also prepare and file IRS Form 2553 to make that election.',
    image: '/illustrations/compliance.svg',
    features: [
      'EIN application preparation and filing for U.S. applicants $35',
      'EIN application preparation and filing for foreign applicants $130',
      'Responsible-party and entity detail intake matched to IRS requirements',
      'S-Corp election preparation and filing (IRS Form 2553) for eligible entities',
      'Status tracking from request to confirmed EIN or election'
    ],
    benefits: [
      'Avoids common application mistakes that delay your EIN',
      'Foreign applicants get help navigating the IRS’s separate, non-online application process',
      'S-Corp election can reduce self-employment tax for eligible profitable businesses',
      'One place to track your EIN and S-Corp election alongside your other formation documents'
    ],
    whoNeeds: 'New LLCs and corporations needing a federal tax ID, foreign founders and non-U.S. residents forming a U.S. business, and profitable LLCs considering S-Corp tax treatment.',
    included: [
      'Guided intake for responsible party, entity type, and business activity',
      'EIN application preparation for U.S. or foreign applicants',
      'S-Corp eligibility review and Form 2553 preparation, where applicable',
      'Status updates and a confirmation summary delivered to your dashboard'
    ],
    limitations: [
      'The IRS issues EINs directly at no cost our fee covers preparation and filing on your behalf, and is entirely optional for U.S. applicants who can apply themselves',
      'Foreign applicants generally cannot use the IRS’s online EIN system our $130 fee reflects the additional process this requires',
      'S-Corp election has specific IRS eligibility rules and deadlines whether it benefits your business depends on your specific tax situation, and we recommend confirming with a tax professional',
      'We do not collect Social Security Numbers or ITINs through this website that information is gathered through a secure, separate process'
    ],
    steps: [
      ['Complete the intake', 'Tell us about your entity, responsible party, and business activity no sensitive ID numbers are collected here.'],
      ['We prepare your filing', 'We prepare your EIN application, and Form 2553 if you’re electing S-Corp status, and confirm details with you before submission.'],
      ['Receive your confirmation', 'Track status from your dashboard and receive your EIN or S-Corp election confirmation once issued.']
    ],
    faq: [
      ['Do I have to pay for an EIN?', 'No. The IRS issues EINs directly at no cost. Our fee is an optional charge for preparing and filing the application on your behalf.'],
      ['Can I apply for an EIN myself?', 'Yes, U.S. applicants can generally apply directly through the IRS website at no cost. We recommend our service if you’d rather not navigate the process yourself, or if you’re a foreign applicant who cannot use the online system.'],
      ['Is my Social Security Number collected on this site?', 'No. Sensitive identifiers like an SSN or ITIN are collected through a secure, separate process never stored in your browser or this website’s standard forms.'],
      ['Why does a foreign EIN application cost more?', 'The IRS’s online EIN system generally requires a valid U.S. Social Security Number or ITIN. Foreign applicants without one must apply by phone, fax, or mail a longer process that our $130 fee reflects.'],
      ['What is an S-Corp election, and is it different from forming a corporation?', 'An S-Corp is a tax election, not a separate entity type. An eligible LLC or corporation can elect to be taxed as an S-Corporation by filing IRS Form 2553, without changing its legal structure.'],
      ['Is my business eligible to elect S-Corp status?', 'Eligibility depends on factors like number of owners, owner residency, and having only one class of stock. We review basic eligibility during intake final confirmation of tax benefit should come from a tax professional.'],
      ['When do I need to file Form 2553?', 'Generally within two months and 15 days of the start of the tax year the election is to take effect, though relief for late elections is sometimes available. We’ll confirm your specific deadline during intake.'],
      ['Will electing S-Corp status definitely lower my taxes?', 'Not automatically. It can reduce self-employment tax for some profitable businesses, but it also adds payroll and filing requirements. This is a tax decision we recommend confirming with a tax professional based on your numbers.'],
      ['Can a foreign founder with no SSN still get an EIN?', 'Yes. Foreign applicants can obtain an EIN without an SSN or ITIN through the IRS’s alternate application process, which is what our foreign-applicant service is built around.']
    ],
    related: ['llc-formation', 's-corp-election', 'business-formation-filings']
  },
  's-corp-election': {
    icon: FileCheck2,
    category: 'Start your business',
    eyebrow: 'S-Corp Election',
    automated: true,
    isActive: true,
    title: 'Elect S-Corp tax status for your existing business',
    short: 'File IRS Form 2553 to elect S-Corporation tax treatment for an already-formed, eligible LLC or corporation $130.',
    intro: 'If your LLC or corporation already has an EIN and you have decided S-Corp tax treatment could reduce your self-employment tax, you do not need to redo your EIN filing you just need IRS Form 2553 prepared and filed correctly, within the right deadline. We handle the eligibility check, the paperwork, and the filing for $130, whether or not we handled your original EIN application.',
    image: '/illustrations/compliance.svg',
    features: [
      'Eligibility review against IRS S-Corp requirements before you file',
      'IRS Form 2553 preparation using your existing entity and EIN details',
      'Deadline calculation based on your entity’s tax year',
      'Filing submission and confirmation tracking',
      'Works whether or not we prepared your original EIN'
    ],
    benefits: [
      'Can reduce self-employment tax for eligible, profitable businesses',
      'Confirms eligibility before you file, instead of finding out after a rejection',
      'Keeps your election deadline from being missed',
      'One clear flat fee no separate charge for using an EIN we did not originally file'
    ],
    whoNeeds: 'Existing LLCs and corporations with an EIN already in place, profitable businesses exploring ways to reduce self-employment tax, and any eligible entity that missed electing S-Corp status when it first formed.',
    included: [
      'Intake to confirm entity type, ownership, and current EIN',
      'S-Corp eligibility review based on IRS requirements',
      'Preparation and filing of IRS Form 2553',
      'Confirmation and a copy of your filed election in your dashboard'
    ],
    limitations: [
      'S-Corp election has specific IRS eligibility rules, including owner count, residency, and a single class of stock final confirmation should come from a tax professional',
      'Election deadlines are generally tied to your tax year missing the window may require requesting late-election relief, which is not guaranteed',
      'This service does not include ongoing payroll setup or tax filing required once S-Corp status is elected',
      'We do not collect Social Security Numbers or ITINs through this website that information is gathered through a secure, separate process'
    ],
    steps: [
      ['Confirm your entity details', 'Tell us your entity type, current EIN, and tax year no sensitive ID numbers are collected here.'],
      ['We check eligibility and prepare Form 2553', 'We confirm you meet the IRS requirements and prepare your election for your review.'],
      ['Track your confirmed election', 'Follow the filing from submission to confirmation in your dashboard.']
    ],
    faq: [
      ['What is an S-Corp election?', 'It’s a tax status, not a new business entity. An eligible LLC or corporation can elect to be taxed as an S-Corporation by filing IRS Form 2553, without changing its legal structure.'],
      ['Do I need a new EIN to elect S-Corp status?', 'No. If your entity already has an EIN, this service files the S-Corp election against that existing EIN you do not need to reapply.'],
      ['How is this different from the S-Corp option on your EIN service?', 'Our EIN service covers electing S-Corp status at the same time as a brand-new EIN application. This service is for entities that already have an EIN and just need the election filed on its own.'],
      ['Is my business eligible?', 'Eligibility generally depends on owner count, owner residency, and having only one class of stock. We review the basics during intake, and recommend confirming with a tax professional.'],
      ['When is the deadline to file Form 2553?', 'Generally within two months and 15 days of the start of the tax year the election should take effect. We’ll calculate your specific deadline during intake.'],
      ['What if I missed the deadline?', 'The IRS sometimes grants relief for a late S-Corp election under certain conditions. We can still prepare your filing and request relief, though approval is not guaranteed.'],
      ['Will electing S-Corp status definitely lower my taxes?', 'Not automatically. It can reduce self-employment tax for some profitable businesses, but it also adds payroll and filing requirements. We recommend confirming the numbers with a tax professional before electing.'],
      ['Does the IRS charge a fee to file Form 2553?', 'No. The IRS does not charge a filing fee for Form 2553. Our $130 fee covers eligibility review, preparation, and filing on your behalf.'],
      ['Do you handle payroll or tax filing after I elect S-Corp status?', 'No. This service covers the election itself. Ongoing payroll and S-Corp tax filing are handled separately, typically with a bookkeeper or tax professional.']
    ],
    related: ['ein', 'business-formation-filings', 'compliance-filings']
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
    related: ['compliance-filings', 'registered-agent', 'llc-formation']
  },
  'compliance-filings': {
    icon: ClipboardCheck,
    category: 'Manage your business',
    eyebrow: 'Compliance Filings',
    automated: true,
    isActive: true,
    title: 'Compliance filings handled and submitted for you',
    short: 'Annual reports, amendments, and state filings prepared and submitted accurately and on time.',
    intro: 'Staying in good standing means more than remembering a due date it means actually filing the right paperwork correctly. We prepare and file annual reports, state renewals, business amendments, Certificates of Good Standing, and registered agent change filings for $95 plus any state filing fee. This is a hands-on filing service: you tell us what needs to be filed, and we prepare and submit it.',
    image: '/illustrations/compliance.svg',
    features: [
      'Annual report and state renewal preparation and filing',
      'Business amendment filings for changes to your entity',
      'Certificate of Good Standing requests',
      'Registered agent change filings',
      'Status tracking from request to confirmed filing'
    ],
    benefits: [
      'One flat $95 service fee per filing, plus any state fee never bundled or hidden',
      'Avoids late fees and loss of good standing from a missed or incorrect filing',
      'A single place to request any compliance filing your business needs',
      'Works alongside our Compliance Support reminders you know what’s due, and we handle the filing itself'
    ],
    whoNeeds: 'Any active LLC or corporation that needs to file an annual report, update information on file with the state, request a Certificate of Good Standing, or change its registered agent.',
    included: [
      'Intake to confirm exactly which filing you need',
      'Preparation of the filing using your current business information',
      'Submission to the correct state office',
      'Confirmation and a copy of the completed filing in your dashboard'
    ],
    limitations: [
      'The $95 fee covers our filing service any state filing fee is separate and shown before you confirm',
      'We prepare and submit filings based on the information you provide we do not independently verify your tax or legal standing',
      'This service handles filings on request ongoing deadline tracking and reminders are provided separately through Compliance Support'
    ],
    steps: [
      ['Tell us what needs filing', 'Select the filing you need annual report, amendment, Certificate of Good Standing, or registered agent change.'],
      ['We prepare it', 'We draft the filing using your current business details and confirm everything with you before submission.'],
      ['We file and confirm', 'Your filing is submitted to the state, and a confirmed copy is delivered to your dashboard.']
    ],
    faq: [
      ['What’s the difference between this and Compliance Support?', 'Compliance Support tracks your deadlines and sends reminders. Compliance Filings is the filing service itself once you know something is due, we prepare and submit it for you.'],
      ['What counts as a business amendment?', 'Changes to information on file with the state, such as your business name, management structure, or business purpose. We prepare the amendment filing for whichever detail changed.'],
      ['What is a Certificate of Good Standing, and why would I need one?', 'It’s a state-issued document confirming your business is current on its filings and fees. Banks, lenders, and other states often require one before approving a loan, account, or foreign qualification.'],
      ['Can you file my annual report for me?', 'Yes. Tell us your entity details and we’ll prepare and file your annual report in Texas, the Public Information Report filed with your franchise tax report before the deadline.'],
      ['I need to change my registered agent is that a compliance filing?', 'Yes. Changing your registered agent requires a filing with the state, which we prepare and submit as part of this service.'],
      ['Is the state filing fee included in the $95?', 'No. The $95 is our service fee for preparing and filing the paperwork. Any state fee is separate and confirmed with you before we submit.'],
      ['How long does a compliance filing take?', 'Most filings are prepared within a few business days of your request. Processing time after submission depends on the state’s current workload we’ll show you a status update once it’s filed.'],
      ['What happens if I miss a compliance deadline?', 'Consequences vary by state and filing type, and can include penalties or loss of good standing. If you’ve already missed a deadline, contact us we can still prepare and file most overdue filings.'],
      ['I just need a single Certificate of Good Standing, not a full filing request is that still this service?', 'You can request one here, but our Certificate of Good Standing service is a faster, dedicated path for exactly that single request, priced separately at $70 plus the state’s own fee.']
    ],
    related: ['texas-compliance', 'certificate-of-good-standing', 'registered-agent']
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
  'mail-forwarding': {
    icon: Inbox,
    category: 'Business address services',
    eyebrow: 'Mail Forwarding',
    automated: true,
    isActive: true,
    title: 'A professional business mailing address with mail forwarding',
    short: 'A professional business address with a unique suite number, unlimited mail scanning, and online access for $20 per month.',
    intro: 'A home address on public business filings and correspondence can feel exposed, and a P.O. box doesn’t always look professional to banks, vendors, or customers. Mail Forwarding gives your business a real street address with a unique suite number. We receive your mail, scan and upload it for you to view online, and can ship original documents on request for $20 per month, per entity available in every one of our 21 supported LLC formation states. Need a lease agreement for your address as well? See Virtual Office instead.',
    image: '/illustrations/banking.svg',
    features: [
      'A professional business address with a unique suite number not a P.O. box',
      'Unlimited document scanning and uploads',
      'Secure online access to view your mail remotely',
      'Ability to request physical shipment of original documents (separate shipping charges apply)',
      'Suite number typically assigned within 1–2 business days'
    ],
    benefits: [
      'Keeps your home address off public business listings and correspondence',
      'Presents a professional business image to banks, vendors, and customers',
      'One address for government letters, bank mail, and general business correspondence',
      'Lower-cost alternative to Virtual Office when you don’t need a lease agreement'
    ],
    whoNeeds: 'Home-based founders, e-commerce and Amazon sellers, agencies and consultants working remotely, and any business that wants a professional address without a physical office or a lease agreement.',
    included: [
      'A dedicated suite address for your business',
      'Unlimited scanning and online access as mail arrives',
      'Requestable physical shipment of original documents',
      'Secure handling for sensitive documents like bank and government mail'
    ],
    limitations: [
      'This is a mail-handling service, not a registered agent it does not satisfy the state’s registered agent requirement on its own',
      'Does not include a lease agreement see Virtual Office if you need one',
      'Physical shipment of original documents carries separate shipping and handling charges domestic and international rates differ; nothing is shipped for free or unlimited',
      'Pricing is per entity if you operate multiple businesses, each one is billed separately'
    ],
    steps: [
      ['Choose your state', 'Available across all 21 states we support for LLC formation.'],
      ['Complete your order', 'Sign up for Mail Forwarding at $20 per month, per entity.'],
      ['Receive your suite number', 'Typically assigned within 1–2 business days.'],
      ['View your mail online', 'Every piece is scanned and uploaded for secure remote access.']
    ],
    faq: [
      ['Is this the same as a registered agent?', 'No. A registered agent is a legal requirement for receiving service of process and official state notices. Mail forwarding is a general business mailing address for everyday correspondence. Many customers use both together.'],
      ['Does Mail Forwarding include a lease agreement?', 'No. Mail Forwarding does not include a lease agreement. If you need one for your business address, choose Virtual Office instead.'],
      ['How long does it take to get my suite number?', 'A unique suite number is typically assigned within 1–2 business days after your order many are faster, but this isn’t guaranteed.'],
      ['Can I view my mail online?', 'Yes. Every piece of mail is scanned and uploaded for secure remote viewing, with unlimited scanning included.'],
      ['Can physical mail be shipped to me?', 'Yes, on request. Shipping and handling charges apply separately or from the $20/month subscription domestic and international shipments are priced differently.'],
      ['Is the $20 per month price per business or per person?', 'It’s per entity. If you operate more than one business, each one is set up and billed as its own mail forwarding subscription.'],
      ['Which states is this available in?', 'All 21 states we currently support for LLC formation see the full list on this page.'],
      ['What’s the difference between Mail Forwarding and Virtual Office?', 'Both include a professional address, a unique suite number, and unlimited digital mail access. Virtual Office additionally includes a lease agreement, for $29 per month instead of $20.']
    ],
    related: ['virtual-office', 'registered-agent', 'llc-formation']
  },
  'virtual-office': {
    icon: MapPinned,
    category: 'Business address services',
    eyebrow: 'Virtual Office',
    automated: true,
    isActive: true,
    title: 'A professional virtual office address with a lease agreement',
    short: 'A professional business address with a unique suite number, a lease agreement, and unlimited mail scanning for $29 per month.',
    // Full page lives at /virtual-office (src/pages/VirtualOffice.jsx), not
    // the generic ServicePage template — this entry exists so Virtual
    // Office still appears correctly in the mega-menu, /services grid, and
    // other services' "related" links, all of which read from this object.
    intro: 'Virtual Office gives your business a professional street address, a unique suite number, and a real lease agreement the paperwork banks, lenders, and licensing agencies often ask for that a P.O. box or basic mail-handling service can’t provide. Every piece of mail is scanned and available online, with physical shipment available on request, for $29 per month, per entity across all 21 states we support for LLC formation.',
    image: '/illustrations/registered-agent.svg',
    features: [
      'A professional business address with a unique suite number',
      'A signed lease agreement for your business address',
      'Unlimited document scanning and uploads',
      'Secure online access to view your mail remotely',
      'Ability to request physical shipment of original documents (separate shipping charges apply)'
    ],
    benefits: [
      'The lease agreement banks, lenders, and licensing agencies frequently require',
      'Keeps your home address off public business listings and correspondence',
      'Presents a professional, credible business presence',
      'Available in every state we support for LLC formation'
    ],
    whoNeeds: 'Businesses that need a signed lease agreement for their address for banking, licensing, or lender requirements, plus any founder who wants a professional presence without a physical office.',
    included: [
      'A dedicated suite address and lease agreement for your business',
      'Unlimited scanning and online access as mail arrives',
      'Requestable physical shipment of original documents',
      'Secure handling for sensitive documents like bank and government mail'
    ],
    limitations: [
      'This is a mailing address and lease agreement service, not a registered agent it does not satisfy the state’s registered agent requirement on its own',
      'Physical shipment of original documents carries separate shipping and handling charges domestic and international rates differ; nothing is shipped for free or unlimited',
      'Pricing is per entity if you operate multiple businesses, each one is billed separately'
    ],
    steps: [
      ['Choose your state', 'Available across all 21 states we support for LLC formation.'],
      ['Complete your order', 'Sign up for Virtual Office at $29 per month, per entity.'],
      ['Receive your suite number', 'Typically assigned within 1–2 business days.'],
      ['Receive your lease agreement', 'Signed and delivered to your document center.'],
      ['View your mail online', 'Every piece is scanned and uploaded for secure remote access.']
    ],
    faq: [
      ['What is a Virtual Office?', 'A professional business address with a unique suite number, a signed lease agreement, and digital mail handling all for $29 per month.'],
      ['Do I receive a unique suite number?', 'Yes, typically within 1–2 business days after your order this is a typical timeframe, not a guarantee.'],
      ['Is a lease agreement included?', 'Yes. A signed lease agreement for your business address is included and is the main difference between Virtual Office and Mail Forwarding.'],
      ['Can I view my mail online?', 'Yes. Every piece of mail is scanned and uploaded for secure remote viewing, with unlimited scanning included.'],
      ['Can physical documents be shipped to me?', 'Yes, on request. Shipping and handling charges apply separately domestic and international shipments are priced differently, and shipping is never included free or unlimited in the $29/month price.'],
      ['Can documents be shipped internationally?', 'Yes. International shipments outside the United States may incur additional overseas shipping charges beyond standard domestic rates.'],
      ['Which states are supported?', 'All 21 states we currently support for LLC formation see the full list on this page.'],
      ['What’s the difference between Virtual Office and Mail Forwarding?', 'Both include a professional address, a unique suite number, and unlimited digital mail access. Virtual Office additionally includes a signed lease agreement, for $29 per month versus $20 for Mail Forwarding.']
    ],
    related: ['mail-forwarding', 'registered-agent', 'llc-formation']
  },
  'certificate-of-good-standing': {
    icon: Award,
    category: 'Start your business',
    eyebrow: 'Certificate of Good Standing',
    automated: true,
    isActive: true,
    title: 'Order a Certificate of Good Standing or certified copies',
    short: 'Request an official, state-issued Certificate of Good Standing or certified copies of your formation documents state fees plus a $70 filing service fee.',
    intro: 'A Certificate of Good Standing confirms your business is current on its state filings and fees often required by banks, lenders, other states, or a business you are acquiring. Certified copies give you an official, state-authenticated copy of your Certificate of Formation or other filed documents. We prepare and submit the request to the state for a flat $70 filing service fee, plus whatever the state itself charges for the certificate or copy.',
    image: '/illustrations/compliance.svg',
    features: [
      'Request intake for Certificate of Good Standing or certified copies',
      'Preparation and submission to the correct state office',
      'Support for multiple states when your business is registered in more than one',
      'Digital delivery of your certified document, plus a physical copy on request',
      'Status tracking from request to delivery'
    ],
    benefits: [
      'One flat $70 service fee per request, with the state’s own fee itemized separately',
      'Faster turnaround than navigating the state’s ordering system yourself',
      'Useful for banks, lenders, acquisitions, and foreign qualification in another state',
      'Works alongside our Apostille service if the document needs international authentication'
    ],
    whoNeeds: 'Businesses applying for a loan or bank account that requires proof of good standing, companies expanding into another state through foreign qualification, businesses being acquired or entering a merger, and anyone who needs an official certified copy of their formation documents.',
    included: [
      'Intake to confirm which document and how many copies you need',
      'Preparation and submission of your request to the state',
      'Confirmation once your certificate or certified copy is issued',
      'Delivery to your dashboard, with physical mailing available on request'
    ],
    limitations: [
      'The $70 fee covers our filing service the state’s own certificate or copy fee is separate and confirmed before you submit your request',
      'A Certificate of Good Standing reflects your status only at the moment it is issued it is not a guarantee of future compliance',
      'Documents intended for use in another country may also need an apostille see our Apostille Services for that additional step',
      'Processing time depends on the issuing state’s current workload, which is outside our control'
    ],
    steps: [
      ['Tell us what you need', 'Choose a Certificate of Good Standing, a certified copy, or both, and the state involved.'],
      ['We submit your request', 'We prepare and file your request with the correct state office.'],
      ['Receive your document', 'Get your certified document in your dashboard, with physical mailing available on request.']
    ],
    faq: [
      ['What is a Certificate of Good Standing?', 'A state-issued document confirming your business is current on its filings and fees. Banks, lenders, other states, and parties in a business transaction often require one.'],
      ['What is a certified copy, and how is it different?', 'A certified copy is an official, state-authenticated copy of a document you already filed, like your Certificate of Formation. A Certificate of Good Standing is a separate document confirming your current compliance status.'],
      ['Is the $70 fee the total cost?', 'No. The $70 is our filing service fee. The state charges its own fee for the certificate or copy itself, which we confirm with you before submitting your request.'],
      ['How long does it take to get my certificate?', 'Turnaround depends on the issuing state’s current processing time. We’ll give you a specific estimate once we know your state and document type.'],
      ['Can you request documents for a business registered in more than one state?', 'Yes. We can request a Certificate of Good Standing or certified copy from any state where your business is registered.'],
      ['Do I need this if I am just opening a bank account?', 'Some banks ask for a Certificate of Good Standing as part of account opening, especially for older entities or larger accounts. Check with your bank, or ask us to confirm what they typically require.'],
      ['I need this document to use in another country what else do I need?', 'You likely also need an apostille, which authenticates the document for international use. See our Apostille Services page, or ask us to bundle both requests together.'],
      ['What’s the difference between this and your Compliance Filings service?', 'Compliance Filings covers a broader range of ongoing state filings, including this one. This page is a focused, single-purpose service specifically for ordering a Certificate of Good Standing or certified copies.']
    ],
    related: ['compliance-filings', 'apostille-services', 'registered-agent']
  },
  'apostille-services': {
    icon: Globe,
    category: 'Start your business',
    eyebrow: 'Apostille Services',
    automated: true,
    isActive: true,
    title: 'Get your business documents apostilled for international use',
    short: 'Authenticate formation documents, certificates, and corporate paperwork for use in another country $450.',
    intro: 'An apostille is an internationally recognized certification that authenticates a public document like your Certificate of Formation, Certificate of Good Standing, or a notarized corporate document so it can be legally recognized in another country that is a member of the Hague Apostille Convention. Foreign-owned businesses, international banking relationships, and cross-border contracts often require one. We handle the authentication process end to end for $450, plus any underlying government fees for the document itself.',
    image: '/illustrations/hero-business.svg',
    features: [
      'Document review to confirm apostille eligibility',
      'Coordination with the Texas Secretary of State and U.S. Department of State as required',
      'Support for Certificates of Good Standing, formation documents, and notarized corporate paperwork',
      'Status tracking from submission to your apostilled document',
      'Secure return delivery of your original and authenticated documents'
    ],
    benefits: [
      'Meets international document requirements without navigating multiple agencies yourself',
      'Speeds up foreign bank account, contract, or registration processes that require authentication',
      'One flat service fee, with any underlying government fees itemized separately',
      'Works alongside our Certificate of Good Standing service for a complete international document package'
    ],
    whoNeeds: 'Foreign founders and non-U.S. residents, businesses opening international bank accounts, companies signing cross-border contracts, and any business expanding or registering in a Hague Convention member country.',
    included: [
      'Intake to confirm which document needs an apostille and its destination country',
      'Preparation and submission of the apostille request to the appropriate authority',
      'Status updates from submission through completion',
      'Secure delivery of your apostilled document to your dashboard and by mail'
    ],
    limitations: [
      'Apostilles apply only to countries that are members of the Hague Apostille Convention documents bound for non-member countries require a different authentication process, which we can advise on during intake',
      'The $450 service fee does not include the underlying document’s own government or certification fees, which vary and are confirmed during intake',
      'Processing time depends on the issuing state and federal offices involved, which are outside our control',
      'This service authenticates existing documents it does not include translation, which can be arranged separately if your destination country requires it'
    ],
    steps: [
      ['Tell us what needs authenticating', 'Identify the document and the country where it will be used.'],
      ['We confirm eligibility and fees', 'We confirm apostille eligibility for that country and any underlying government fees.'],
      ['Track your document', 'Follow your apostille from submission to secure delivery in your dashboard.']
    ],
    faq: [
      ['What is an apostille?', 'It’s an internationally recognized certification that authenticates a public document, such as a Certificate of Formation or Certificate of Good Standing, so it’s legally recognized in another Hague Convention member country.'],
      ['Which documents can be apostilled?', 'Common examples include Certificates of Formation, Certificates of Good Standing, notarized corporate resolutions, and other state-issued or notarized business documents.'],
      ['Does every country accept an apostille?', 'No, only countries that are members of the Hague Apostille Convention. Documents bound for non-member countries typically require a different authentication or legalization process, which we can advise on.'],
      ['Is the $450 fee the total cost?', 'The $450 is our service fee. Some documents carry their own government or certification fee, separate from the apostille itself, which we’ll confirm during intake.'],
      ['How long does the apostille process take?', 'Timing depends on the issuing state office and, where applicable, federal offices involved. We’ll give you a specific estimate once we know which document and country are involved.'],
      ['Do you also provide the underlying document, like a Certificate of Good Standing?', 'Yes. If you do not already have the document that needs apostille, we can prepare it through our Certificate of Good Standing service first, then apostille it.'],
      ['Can you translate my document as well?', 'Translation is not included in this service, but we can point you toward that step if your destination country requires a certified translation alongside the apostille.'],
      ['Who typically needs an apostille?', 'Foreign founders, businesses opening accounts or signing contracts abroad, and companies registering a U.S. entity’s standing with a foreign government or bank.']
    ],
    related: ['certificate-of-good-standing', 'compliance-filings', 'business-formation-filings']
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

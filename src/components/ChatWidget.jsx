import { useEffect, useRef, useState } from 'react'
import { Bot, MessageCircle, Send, X } from 'lucide-react'

const INITIAL_MESSAGE = {
  from: 'bot',
  text: 'Hi! I’m the ABF Business Guide. I can help with LLC formation, Registered Agent service, EIN assistance, licenses, sales tax permits, trademarks, pricing, and other business setup questions.'
}

const QUICK_QUESTIONS = [
  'How do I start an LLC?',
  'What are your prices?',
  'What is an EIN?',
  'Do I need a Registered Agent?',
  'Contact support'
]

const INTENTS = [
  {
    id: 'greeting',
    keywords: [
      'hi',
      'hello',
      'hey',
      'good morning',
      'good afternoon',
      'good evening',
      'how are you',
      'anyone there',
      'can you help',
      'help me',
      'need help'
    ],
    answer:
      'Hello! Welcome to American Business Formations. I can help you understand LLC formation, pricing, Registered Agent service, EIN assistance, licenses and permits, sales tax permits, trademarks, Formation Kits, and other business setup services.'
  },

  {
    id: 'start-business',
    priority: 8,
    keywords: [
      'start a business',
      'start my business',
      'open a business',
      'create a business',
      'register my business',
      'register a company',
      'form a company',
      'form my company',
      'new business',
      'business setup',
      'business formation',
      'company formation',
      'begin formation',
      'get started',
      'how do i start',
      'where do i start',
      'i want to start',
      'launch my business',
      'set up my company'
    ],
    answer:
      'To get started, choose the state where you want to form your business and enter your preferred business name. The guided formation process will collect your business details, ownership information, Registered Agent selection, and any additional services you need.'
  },

  {
    id: 'llc-formation',
    priority: 7,
    keywords: [
      'form an llc',
      'start an llc',
      'create an llc',
      'open an llc',
      'register an llc',
      'llc registration',
      'llc formation',
      'llc setup',
      'set up llc',
      'new llc',
      'need an llc',
      'want an llc',
      'file an llc',
      'company llc',
      'limited liability company formation',
      'register limited liability company',
      'open my company',
      'business registration service'
    ],
    answer:
      'American Business Formations can guide you through the LLC formation process. You will normally select your formation state, provide a preferred business name, enter owner or member information, choose a Registered Agent, review available add-ons, and submit the order for filing.'
  },

  {
    id: 'what-is-llc',
    priority: 6,
    keywords: [
      'what is an llc',
      'what is llc',
      'llc meaning',
      'meaning of llc',
      'define llc',
      'limited liability company meaning',
      'how does an llc work',
      'tell me about llc',
      'explain llc',
      'llc business structure'
    ],
    answer:
      'LLC stands for Limited Liability Company. It is a business structure created under state law that can provide liability protection and flexible management. Ownership, taxation, reporting, and compliance requirements can vary depending on the state and the number of LLC members.'
  },

  {
    id: 'llc-benefits',
    priority: 5,
    keywords: [
      'llc benefits',
      'benefits of llc',
      'why form an llc',
      'why start an llc',
      'advantages of llc',
      'is llc good',
      'should i form an llc',
      'do i need an llc',
      'llc protection',
      'personal asset protection',
      'liability protection',
      'why choose llc'
    ],
    answer:
      'An LLC may help separate personal and business liabilities, improve business credibility, offer management flexibility, and provide different federal tax classification options. The right structure depends on your business activity, state, ownership, and tax situation.'
  },

  {
    id: 'formation-steps',
    priority: 7,
    keywords: [
      'llc formation steps',
      'steps to form llc',
      'formation process',
      'registration process',
      'how does formation work',
      'how does the process work',
      'what is the process',
      'what happens after ordering',
      'llc filing process',
      'company filing process',
      'business formation process',
      'onboarding process',
      'guided questionnaire',
      'formation questionnaire'
    ],
    answer:
      'The general process is: select your state, enter your desired business name, provide company and ownership details, choose a Registered Agent, select any additional services, review your information, and submit the order. Your documents are then prepared and submitted according to the selected service.'
  },

  {
    id: 'required-information',
    priority: 6,
    keywords: [
      'what information do you need',
      'what details are required',
      'requirements for llc',
      'llc requirements',
      'documents required',
      'information required',
      'what do i need',
      'what should i prepare',
      'formation requirements',
      'registration requirements',
      'owner information',
      'member information',
      'business address required',
      'what paperwork is needed'
    ],
    answer:
      'You will generally need a preferred business name, formation state, business address, owner or member details, management structure, business activity, and Registered Agent information. Additional information may be required depending on the state and selected services.'
  },

  {
    id: 'business-name',
    priority: 8,
    keywords: [
      'business name',
      'company name',
      'llc name',
      'name availability',
      'check business name',
      'check company name',
      'check llc name',
      'is my name available',
      'name search',
      'reserve business name',
      'business name taken',
      'company name taken',
      'duplicate business name',
      'choose llc name',
      'preferred business name',
      'alternative business name',
      'backup business name'
    ],
    answer:
      'Your requested business name must meet the naming rules of the formation state and be distinguishable from existing registered entities. You should provide your preferred name and, when possible, one or two backup names in case the first choice is unavailable.'
  },

  {
    id: 'state-selection',
    priority: 8,
    keywords: [
      'which state should i choose',
      'best state for llc',
      'what state should i form in',
      'choose a state',
      'formation state',
      'llc state',
      'register in another state',
      'delaware llc',
      'wyoming llc',
      'texas llc',
      'florida llc',
      'california llc',
      'new york llc',
      'nevada llc',
      'state requirements',
      'state rules',
      'state comparison'
    ],
    answer:
      'The best formation state depends on where your business operates, where you live, your compliance responsibilities, and your tax situation. Many businesses form in the state where they primarily operate. Consider professional legal or tax advice before choosing a different state only for perceived benefits.'
  },

  {
    id: 'pricing',
    priority: 8,
    keywords: [
      'price',
      'prices',
      'pricing',
      'cost',
      'costs',
      'how much',
      'how much does it cost',
      'llc cost',
      'llc price',
      'formation cost',
      'formation fee',
      'service fee',
      'package price',
      'plans',
      'packages',
      'compare plans',
      'pricing plans',
      'affordable package',
      'cheapest package',
      'total cost',
      'payment amount',
      'service charges'
    ],
    answer:
      'You can review the available service packages on the Plans & Pricing page. The displayed service price covers the selected American Business Formations service. Government or state filing fees are separate and vary by state.'
  },

  {
    id: 'state-fees',
    priority: 10,
    keywords: [
      'state fee',
      'state fees',
      'filing fee',
      'filing fees',
      'government fee',
      'government fees',
      'state filing cost',
      'are state fees included',
      'is filing fee included',
      'additional state fee',
      'extra government charges',
      'secretary of state fee',
      'state charges',
      'fee by state'
    ],
    answer:
      'State filing fees are separate from the American Business Formations service fee. The amount is set by the relevant state and can vary based on the state, entity type, filing speed, and any optional state services.'
  },

  {
    id: 'processing-time',
    priority: 8,
    keywords: [
      'how long',
      'how much time',
      'processing time',
      'formation time',
      'filing time',
      'approval time',
      'llc approval',
      'when will my llc be ready',
      'how fast',
      'rush filing',
      'expedited filing',
      'same day filing',
      'business days',
      'turnaround time',
      'delivery time',
      'state processing'
    ],
    answer:
      'Processing time depends mainly on the formation state and the filing option selected. Standard and expedited timelines can differ, and state processing delays may occur. Review the estimated filing time during checkout or contact the team for the latest estimate.'
  },

  {
    id: 'registered-agent',
    priority: 10,
    keywords: [
      'registered agent',
      'registered-agent',
      'resident agent',
      'statutory agent',
      'agent service',
      'registered office',
      'do i need an agent',
      'need registered agent',
      'who can be registered agent',
      'what is registered agent',
      'registered agent address',
      'legal notices',
      'service of process',
      'official mail',
      'change registered agent'
    ],
    answer:
      'A Registered Agent is the person or service designated to receive official state correspondence and legal notices for a business. Registered Agent requirements vary by state, but the agent normally needs a physical address in the formation state and must be available during regular business hours.'
  },

  {
    id: 'ein',
    priority: 10,
    keywords: [
      'ein',
      'ein number',
      'get an ein',
      'apply for ein',
      'employer identification number',
      'federal tax id',
      'federal tax identification number',
      'tax id',
      'business tax number',
      'irs number',
      'ss4',
      'ss 4',
      'form ss-4',
      'need ein',
      'ein application',
      'ein service',
      'ein assistance',
      'ein without ssn',
      'ein with ssn',
      'responsible party'
    ],
    answer:
      'An EIN is a federal tax identification number issued by the IRS to identify a business or other entity. American Business Formations offers EIN assistance as an optional service. The IRS itself does not charge an EIN application fee, while a formation company may charge for preparation and assistance.'
  },

  {
    id: 'operating-agreement',
    priority: 9,
    keywords: [
      'operating agreement',
      'llc agreement',
      'company agreement',
      'member agreement',
      'ownership agreement',
      'management agreement',
      'do i need operating agreement',
      'operating agreement template',
      'llc rules document',
      'member responsibilities',
      'ownership percentages',
      'profit sharing agreement'
    ],
    answer:
      'An Operating Agreement is an internal LLC document that can describe ownership percentages, management authority, voting rules, distributions, and member responsibilities. Requirements vary by state, but having a clear agreement can be useful even for a single-member LLC.'
  },

  {
    id: 'formation-kit',
    priority: 9,
    keywords: [
      'formation kit',
      'llc kit',
      'company kit',
      'corporate kit',
      'business kit',
      'formation documents kit',
      'company record book',
      'llc binder',
      'business records',
      'ownership certificates',
      'company documents package'
    ],
    answer:
      'The Formation Kit is intended to help organize important company records and formation documents. Check the Formation Kit service page or package details to see exactly which documents and materials are included before ordering.'
  },

  {
    id: 'licenses-permits',
    priority: 10,
    keywords: [
      'business license',
      'business licenses',
      'license',
      'licenses',
      'licence',
      'licences',
      'permit',
      'permits',
      'licenses and permits',
      'license requirements',
      'permit requirements',
      'local license',
      'city license',
      'county license',
      'state license',
      'professional license',
      'industry permit',
      'business permit',
      'what license do i need'
    ],
    answer:
      'Business license and permit requirements depend on your industry, location, and business activities. Requirements may come from federal, state, county, or city authorities. The Licenses & Permits service can help identify requirements relevant to your business.'
  },

  {
    id: 'sales-tax-permit',
    priority: 10,
    keywords: [
      'sales tax permit',
      'sales tax license',
      'seller permit',
      'sellers permit',
      'seller’s permit',
      'resale permit',
      'resale certificate',
      'sales tax certificate',
      'sales tax registration',
      'collect sales tax',
      'sales and use tax',
      'retail permit',
      'ecommerce sales tax',
      'online store sales tax',
      'sales tax number'
    ],
    answer:
      'A Sales Tax Permit may be required when a business sells taxable products or services and has an obligation to collect sales tax in a state. Requirements vary by state and business activity. The Sales Tax Permit service can help with the relevant registration process.'
  },

  {
    id: 'trademark',
    priority: 10,
    keywords: [
      'trademark',
      'trade mark',
      'register trademark',
      'trademark registration',
      'trademark my name',
      'trademark my logo',
      'protect my brand',
      'brand protection',
      'logo protection',
      'business name protection',
      'trademark search',
      'search trademark',
      'uspto',
      'trademark application',
      'trademark status',
      'trademark class',
      'service mark',
      'copyright my name'
    ],
    answer:
      'Trademark registration can help protect a brand name, logo, slogan, or other source identifier used for goods or services. The process can include a trademark search, selection of goods or service classes, application preparation, and USPTO review. Approval is determined by the USPTO and cannot be guaranteed.'
  },

  {
    id: 'logo-maker',
    priority: 9,
    keywords: [
      'logo',
      'logo maker',
      'create logo',
      'make a logo',
      'business logo',
      'company logo',
      'design my logo',
      'brand logo',
      'logo design',
      'need a logo',
      'generate logo',
      'branding tool',
      'business branding'
    ],
    answer:
      'You can use the Logo Maker under Business Tools to begin creating a visual identity for your company. Prepare your business name, industry, preferred style, and any color or icon preferences before starting.'
  },

  {
    id: 'non-us-resident',
    priority: 10,
    keywords: [
      'non us resident',
      'non-us resident',
      'non resident',
      'foreign owner',
      'foreign founder',
      'international founder',
      'outside usa',
      'outside the us',
      'not a us citizen',
      'not american',
      'live abroad',
      'living abroad',
      'form llc from pakistan',
      'form llc from india',
      'form llc overseas',
      'international llc',
      'foreigner llc',
      'without us address',
      'without ssn'
    ],
    answer:
      'Non-U.S. residents may be able to own a U.S. LLC, but formation, address, banking, EIN, tax, and reporting requirements can differ. Select your state and contact the ABF team with your country of residence so they can confirm the available services and required information.'
  },

  {
    id: 'single-member',
    priority: 8,
    keywords: [
      'single member llc',
      'one owner llc',
      'only owner',
      'sole owner',
      'single owner company',
      'llc with one member',
      'can one person form llc',
      'one person llc',
      'individual owner'
    ],
    answer:
      'A single-member LLC has one owner, called a member. It can still be a separate state-law entity, although its default federal tax treatment may differ from a multi-member LLC. Tax treatment should be reviewed with a qualified tax professional.'
  },

  {
    id: 'multi-member',
    priority: 8,
    keywords: [
      'multi member llc',
      'multiple members',
      'multiple owners',
      'two owners',
      'business partners',
      'partner llc',
      'llc with partners',
      'add a member',
      'more than one owner',
      'ownership percentage'
    ],
    answer:
      'A multi-member LLC has two or more owners. You should provide complete member details and decide ownership percentages, management authority, voting rules, and profit distributions. These terms are commonly documented in an Operating Agreement.'
  },

  {
    id: 'tax-question',
    priority: 9,
    keywords: [
      'tax',
      'taxes',
      'llc tax',
      'tax return',
      'tax filing',
      'taxation',
      'how is llc taxed',
      'federal tax',
      'state tax',
      'income tax',
      'tax advice',
      'tax benefits',
      'tax election',
      'pass through tax',
      'double taxation',
      'tax professional',
      'accountant',
      'cpa'
    ],
    answer:
      'LLC tax treatment depends on the number of members and any federal tax elections made by the business. State taxes and filing obligations also vary. American Business Formations can assist with formation services, but personalized tax advice should come from a qualified CPA or tax professional.'
  },

  {
    id: 's-corp',
    priority: 10,
    keywords: [
      's corp',
      's corporation',
      's corp election',
      'elect s corp',
      'llc taxed as s corp',
      'form 2553',
      '2553',
      'c corp',
      'c corporation',
      'llc tax election'
    ],
    answer:
      'An LLC and an S corporation are not the same type of classification. An LLC is formed under state law, while eligible entities may elect S corporation treatment for federal tax purposes. Speak with a qualified tax professional before making a tax election.'
  },

  {
    id: 'bank-account',
    priority: 8,
    keywords: [
      'business bank account',
      'bank account',
      'open bank account',
      'business banking',
      'banking',
      'bank approval',
      'bank documents',
      'open us bank account',
      'merchant account',
      'payment processor',
      'stripe account',
      'paypal business account'
    ],
    answer:
      'Banks commonly request formation documents, an EIN, owner identification, and other compliance information before opening a business account. Forming an LLC or obtaining an EIN does not guarantee approval because each bank and payment provider applies its own requirements.'
  },

  {
    id: 'after-formation',
    priority: 8,
    keywords: [
      'after formation',
      'after llc approval',
      'after starting llc',
      'what happens next',
      'next steps',
      'after registration',
      'after filing',
      'llc approved now what',
      'business formed now what',
      'post formation',
      'maintain my llc'
    ],
    answer:
      'After formation, common next steps may include reviewing your approved documents, obtaining an EIN if needed, preparing an Operating Agreement, opening a business bank account, checking license and sales tax requirements, and tracking ongoing state compliance deadlines.'
  },

  {
    id: 'annual-compliance',
    priority: 9,
    keywords: [
      'annual report',
      'annual filing',
      'yearly filing',
      'franchise tax',
      'compliance',
      'ongoing compliance',
      'keep llc active',
      'good standing',
      'renew llc',
      'llc renewal',
      'state deadline',
      'compliance deadline',
      'business maintenance',
      'maintain llc',
      'late filing'
    ],
    answer:
      'Ongoing requirements can include annual or periodic reports, state fees or taxes, Registered Agent maintenance, licenses, permits, and record updates. Deadlines and requirements vary by state, so review your state notices and maintain a compliance calendar.'
  },

  {
    id: 'documents-delivery',
    priority: 8,
    keywords: [
      'formation documents',
      'llc documents',
      'approved documents',
      'articles of organization',
      'certificate of formation',
      'certificate of organization',
      'document delivery',
      'where are my documents',
      'download documents',
      'receive documents',
      'document copy',
      'filing confirmation'
    ],
    answer:
      'The exact approved documents depend on the formation state. They may include filed formation documents, a state acknowledgment, or a formation certificate. Check your order communications or contact support with your order number if you need help locating a document.'
  },

  {
    id: 'order-status',
    priority: 10,
    keywords: [
      'order status',
      'check my order',
      'track my order',
      'application status',
      'filing status',
      'llc status',
      'where is my order',
      'order pending',
      'still processing',
      'order number',
      'confirmation number',
      'when will it be approved',
      'status update'
    ],
    answer:
      'For an order or filing status update, contact the ABF team and include your full name, business name, formation state, email address, and order or confirmation number. This chatbot cannot access private order records.'
  },

  {
    id: 'change-order',
    priority: 9,
    keywords: [
      'change my order',
      'edit my order',
      'correct my information',
      'wrong information',
      'mistake in application',
      'change business name',
      'change address',
      'change owner',
      'update member',
      'modify filing',
      'application correction',
      'filing correction'
    ],
    answer:
      'Contact support as soon as possible if you need to correct an order. Whether a change can be made depends on whether the documents have already been prepared or submitted to the state. Include your order number and clearly describe the correction.'
  },

  {
    id: 'refund-cancel',
    priority: 10,
    keywords: [
      'refund',
      'cancel',
      'cancellation',
      'cancel my order',
      'refund my order',
      'money back',
      'return payment',
      'charged by mistake',
      'duplicate charge',
      'payment issue',
      'billing issue',
      'dispute charge'
    ],
    answer:
      'Cancellation or refund eligibility depends on the order status, work already completed, state submission status, and applicable terms. Contact support immediately with your order number and payment details. Government filing fees may be subject to separate rules once submitted.'
  },

  {
    id: 'payment',
    priority: 8,
    keywords: [
      'payment',
      'pay',
      'checkout',
      'credit card',
      'debit card',
      'payment method',
      'payment failed',
      'card declined',
      'transaction failed',
      'charged twice',
      'billing information',
      'invoice',
      'receipt'
    ],
    answer:
      'For payment or checkout problems, verify that your card details, billing address, security code, and available balance are correct. If the issue continues, contact support and provide the email used at checkout without sending your complete card number.'
  },

  {
    id: 'dba',
    priority: 8,
    keywords: [
      'dba',
      'doing business as',
      'assumed name',
      'fictitious name',
      'trade name',
      'brand name different from llc',
      'use another business name',
      'alternate business name'
    ],
    answer:
      'A DBA, assumed name, or fictitious name may allow a business to operate under a name different from its legal entity name. Registration requirements vary by state, county, and city. Contact support to confirm whether DBA assistance is currently available for your location.'
  },

  {
    id: 'corporation-nonprofit',
    priority: 8,
    keywords: [
      'corporation',
      'incorporation',
      'form a corporation',
      'start corporation',
      'c corporation formation',
      'nonprofit',
      'non profit',
      'start nonprofit',
      'partnership formation',
      'pllc',
      'professional llc'
    ],
    answer:
      'The current ABF service menu primarily highlights LLC formation and related business setup tools. For corporations, nonprofits, partnerships, professional entities, or other specialized structures, contact the team to confirm whether the requested service is available.'
  },

  {
    id: 'reviews-stories',
    priority: 7,
    keywords: [
      'reviews',
      'customer reviews',
      'testimonials',
      'customer stories',
      'success stories',
      'client feedback',
      'is this company trusted',
      'can i trust you',
      'why choose abf',
      'why choose american business formations'
    ],
    answer:
      'You can visit the Customer Stories and About Us sections to learn more about American Business Formations and the customer experience. For service-specific questions, review the relevant service page and package details before ordering.'
  },

  {
    id: 'resources',
    priority: 7,
    keywords: [
      'resources',
      'guides',
      'articles',
      'business guide',
      'llc guide',
      'learn about llc',
      'business education',
      'help center',
      'faq',
      'frequently asked questions',
      'business information'
    ],
    answer:
      'Visit the Resources section for business formation information and educational guidance. You can also ask me directly about LLC formation, Registered Agents, EINs, licenses, sales tax permits, trademarks, pricing, or post-formation steps.'
  },

  {
    id: 'contact',
    priority: 10,
    keywords: [
      'contact',
      'contact support',
      'contact team',
      'customer support',
      'support team',
      'customer service',
      'speak to someone',
      'talk to someone',
      'talk to human',
      'human agent',
      'live person',
      'representative',
      'agent please',
      'email address',
      'send email',
      'call you',
      'phone number',
      'need assistance'
    ],
    answer:
      'You can contact the American Business Formations team through the Contact page or email info@americanbusinessformations.com. Include your name, business name, formation state, and order number if your question relates to an existing order.'
  },

  {
    id: 'legal-advice',
    priority: 10,
    keywords: [
      'legal advice',
      'lawyer',
      'attorney',
      'legal question',
      'lawsuit',
      'legal problem',
      'legal requirement',
      'is this legal',
      'legal opinion',
      'legal consultation'
    ],
    answer:
      'American Business Formations can provide business filing and formation assistance, but this chatbot does not provide legal advice. For advice about liability, contracts, disputes, ownership, or state-specific legal obligations, consult a qualified attorney.'
  },

  {
    id: 'thank-you',
    keywords: [
      'thanks',
      'thank you',
      'thankyou',
      'great',
      'perfect',
      'helpful',
      'got it',
      'understood',
      'okay thanks',
      'appreciate it'
    ],
    answer:
      'You’re welcome! Let me know whether you need help with LLC formation, pricing, EIN assistance, Registered Agent service, licenses, sales tax permits, trademarks, or contacting the ABF team.'
  },

  {
    id: 'goodbye',
    keywords: [
      'bye',
      'goodbye',
      'see you',
      'talk later',
      'have a good day',
      'close chat'
    ],
    answer:
      'Thank you for visiting American Business Formations. Feel free to return whenever you need help starting or managing your business.'
  }
]

const FALLBACK_REPLY =
  'I’m sorry, I could not confidently match that question. I can help with LLC formation, business names, pricing, state filing fees, Registered Agent service, EIN assistance, licenses and permits, sales tax permits, trademarks, Formation Kits, Logo Maker, order status, or contact support. Please ask one question at a time.'

const normalizeText = (value = '') =>
  value
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[’']/g, '')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/-/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const calculateIntentScore = (normalizedInput, intent) => {
  const inputWords = new Set(normalizedInput.split(' '))

  const keywordScore = intent.keywords.reduce((total, rawKeyword) => {
    const keyword = normalizeText(rawKeyword)

    if (!keyword) return total

    const keywordWords = keyword.split(' ')
    const isMatched =
      keywordWords.length === 1
        ? inputWords.has(keyword)
        : normalizedInput.includes(keyword)

    if (!isMatched) return total

    const phraseBonus = keywordWords.length * 7
    const lengthBonus = Math.min(keyword.length / 4, 6)

    return total + 5 + phraseBonus + lengthBonus
  }, 0)

  return keywordScore + (intent.priority || 0)
}

const getBotReply = input => {
  const normalizedInput = normalizeText(input)

  if (!normalizedInput) {
    return 'Please enter a question so I can help you.'
  }

  const rankedIntents = INTENTS.map(intent => ({
    ...intent,
    score: calculateIntentScore(normalizedInput, intent)
  })).sort((a, b) => b.score - a.score)

  const bestMatch = rankedIntents[0]

  return bestMatch && bestMatch.score >= 12
    ? bestMatch.answer
    : FALLBACK_REPLY
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [typing, setTyping] = useState(false)
  const [messages, setMessages] = useState([INITIAL_MESSAGE])

  const chatBodyRef = useRef(null)
  const replyTimeoutRef = useRef(null)
  const closeButtonRef = useRef(null)
  const toggleButtonRef = useRef(null)

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTo({
        top: chatBodyRef.current.scrollHeight,
        behavior: 'smooth'
      })
    }
  }, [messages, typing, open])

  // Keyboard-open the panel and Tab, without this, would skip straight past
  // it to whatever follows .chat-widget in the DOM (the panel is a sibling
  // rendered before the toggle button, not a descendant). Move focus in on
  // open, and support Escape-to-close with focus restored to the toggle —
  // matching the focus-trap/restoration pattern already used by
  // Modal.jsx/Drawer.jsx, without full focus-trapping since this is a
  // non-blocking widget and the rest of the page should stay reachable.
  useEffect(() => {
    if (!open) return
    closeButtonRef.current?.focus()
    const onKeyDown = e => {
      if (e.key === 'Escape') {
        setOpen(false)
        toggleButtonRef.current?.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open])

  useEffect(() => {
    return () => {
      if (replyTimeoutRef.current) {
        clearTimeout(replyTimeoutRef.current)
      }
    }
  }, [])

  const sendMessage = value => {
    const cleanValue = value.trim()

    if (!cleanValue || typing) return

    setMessages(current => [
      ...current,
      {
        from: 'user',
        text: cleanValue
      }
    ])

    setText('')
    setTyping(true)

    replyTimeoutRef.current = setTimeout(() => {
      setMessages(current => [
        ...current,
        {
          from: 'bot',
          text: getBotReply(cleanValue)
        }
      ])

      setTyping(false)
    }, 450)
  }

  const send = event => {
    event.preventDefault()
    sendMessage(text)
  }

  return (
    <div className="chat-widget">
      {open && (
        <div className="chat-panel" role="dialog" aria-modal="false" aria-label="ABF Business Guide chat">
          <div className="chat-head">
            <div>
              <Bot aria-hidden="true" />

              <span>
                <strong>ABF Business Guide</strong>
                <small>Online</small>
              </span>
            </div>

            <button
              type="button"
              ref={closeButtonRef}
              onClick={() => { setOpen(false); toggleButtonRef.current?.focus() }}
              aria-label="Close chat"
            >
              <X />
            </button>
          </div>

          <div className="chat-body" ref={chatBodyRef} role="log" aria-live="polite" aria-label="Conversation">
            {messages.map((message, index) => (
              <div
                key={`${message.from}-${index}`}
                className={`chat-message ${message.from}`}
              >
                {message.text}
              </div>
            ))}

            {typing && (
              <div className="chat-message bot chat-typing" aria-label="ABF Business Guide is typing">
                <span aria-hidden="true" />
                <span aria-hidden="true" />
                <span aria-hidden="true" />
              </div>
            )}

            {messages.length === 1 && !typing && (
              <div className="chat-quick-questions">
                {QUICK_QUESTIONS.map(question => (
                  <button
                    type="button"
                    key={question}
                    onClick={() => sendMessage(question)}
                  >
                    {question}
                  </button>
                ))}
              </div>
            )}
          </div>

          <form onSubmit={send} className="chat-form">
            <input
              value={text}
              onChange={event => setText(event.target.value)}
              placeholder="Type your question..."
              aria-label="Type your question"
              autoComplete="off"
            />

            <button
              type="submit"
              aria-label="Send message"
              disabled={!text.trim() || typing}
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        ref={toggleButtonRef}
        className="chat-toggle"
        onClick={() => setOpen(current => !current)}
        aria-label={open ? 'Close help chat' : 'Open help chat'}
        aria-expanded={open}
      >
        {open ? <X /> : <MessageCircle />}
      </button>
    </div>
  )
}
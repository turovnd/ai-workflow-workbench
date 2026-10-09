import type { EvidenceDocument, ReviewCase } from '@support-desk/contracts';
export const corpusRevision = 'support-kb-2026-10-10.1';
export const cases: readonly ReviewCase[] = [
  {
    id: 'account-access',
    reference: 'KB ACCESS',
    title: 'Expired sign-in link',
    service: 'Account access',
    category: 'Account',
    query: 'login sign in link expired access email',
    description:
      'Help the customer request a fresh link without promising an account change.',
    time: '',
    priority: 'Review',
  },
  {
    id: 'billing-invoice',
    reference: 'KB BILLING',
    title: 'Download an invoice',
    service: 'Billing',
    category: 'Billing',
    query: 'billing invoice download pdf payment owner',
    description: 'Explain where the account owner can download an invoice.',
    time: '',
    priority: 'Review',
  },
  {
    id: 'retention-gap',
    reference: 'KB GAP',
    title: 'Retention policy question',
    service: 'Policies',
    category: 'Policy',
    query: 'retention personal legal deletion guarantee years',
    description:
      'Ask for clarification and escalate an unverified policy claim.',
    time: '',
    priority: 'Investigate',
  },
];
export const documents: readonly EvidenceDocument[] = [
  {
    id: 'signin-r3',
    title: 'Requesting a new sign-in link',
    revision: 3,
    section: 'Expired links',
    current: true,
    keywords: 'login sign in link expired access email',
    text: 'Sign-in links expire after fifteen minutes and can be used once. Request a new link from the sign-in page using the same email address. Requesting a new link does not delete saved work. Never ask a customer to share the link or a password with support.',
  },
  {
    id: 'email-r2',
    title: 'Sign-in email delivery',
    revision: 2,
    section: 'Missing email',
    current: true,
    keywords: 'login sign in link expired access email',
    text: 'If a new sign-in email does not arrive, check the spam folder and confirm the email address was entered correctly. If the issue persists, ask for the approximate request time and the displayed error. Do not ask for credentials or forward a sign-in link.',
  },
  {
    id: 'signin-r1',
    title: 'Requesting a new sign-in link',
    revision: 1,
    section: 'Superseded guidance',
    current: false,
    keywords: 'login sign in link expired access email',
    text: 'Sign-in links expire after sixty minutes. This revision is superseded; use revision three for current support replies.',
  },
  {
    id: 'invoice-r2',
    title: 'Downloading subscription invoices',
    revision: 2,
    section: 'Billing history',
    current: true,
    keywords: 'billing invoice download pdf payment owner',
    text: 'The account owner can open Settings, then Billing, then Payment history to download a PDF invoice for a completed subscription payment. Other members must ask the account owner for access to billing records.',
  },
  {
    id: 'invoice-missing-r1',
    title: 'When an invoice is missing',
    revision: 1,
    section: 'Clarifying details',
    current: true,
    keywords: 'billing invoice download pdf payment owner',
    text: 'If a completed payment has no invoice in Payment history, ask for the payment date and the account billing email, then create an internal billing review. Do not request a full card number and do not promise a refund.',
  },
  {
    id: 'scope-r1',
    title: 'Knowledge-base coverage',
    revision: 1,
    section: 'Known omissions',
    current: true,
    keywords: 'knowledge scope collection',
    text: 'This synthetic knowledge base covers account access and subscription invoices. It does not contain an approved data-retention schedule. Request the relevant policy from an accountable owner instead of inferring a retention promise.',
  },
];
const words = (value: string) =>
  new Set(value.toLowerCase().match(/[a-z]{3,}/g) ?? []);
export const retrieveLocally = (query: string): EvidenceDocument[] => {
  const terms = words(query);
  return documents
    .filter((doc) => doc.current)
    .map((doc) => ({
      doc,
      score: [...words(doc.keywords)].filter((word) => terms.has(word)).length,
    }))
    .filter((item) => item.score >= 2)
    .sort((a, b) => b.score - a.score || a.doc.id.localeCompare(b.doc.id))
    .slice(0, 4)
    .map((item) => item.doc);
};

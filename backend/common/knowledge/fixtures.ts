export const ticketTemplates = [
  {
    topic: 'account-access',
    subject: 'My sign-in link expired before the meeting',
    message:
      'I requested a sign-in link at 09:00 but opened it after our team call, about half an hour later. It now says the link has expired. I have a saved report to finish today and I’m worried a new link might create another account. What should I do, and will my saved work still be there?',
  },
  {
    topic: 'billing-invoice',
    subject: 'Our accountant needs the subscription invoice',
    message:
      'Our monthly payment went through on Tuesday. I can see the charge on the company statement, but I cannot find a PDF invoice in the product. I joined as a team member; our operations lead owns the account. We need the invoice for Friday’s close. Where should we look?',
  },
  {
    topic: 'retention-gap',
    subject: 'Can we promise our auditor a two-year retention period?',
    message:
      'Our compliance review asks whether personal records are retained for exactly two years and then deleted automatically. I cannot find a published policy that confirms this. Before I put a commitment in the audit form, can you confirm the retention and deletion schedule, or tell me who can provide an approved answer?',
  },
  {
    topic: 'account-access',
    subject: 'A new link still hasn’t arrived',
    message:
      'I requested a new sign-in email ten minutes ago and checked my spam folder. Nothing has arrived. The email address on the form is correct. I can still open the product on my phone, but I need the laptop for a presentation. What details would help you investigate delivery?',
  },
  {
    topic: 'billing-invoice',
    subject: 'Payment completed but Payment history has no PDF',
    message:
      'I am the account owner and followed Settings → Billing → Payment history. The subscription payment completed yesterday, but there is no invoice available to download. I refreshed and tried another browser. Our accounts team needs a document today. What information should I provide for a billing review?',
  },
  {
    topic: 'retention-gap',
    subject: 'Does deleting a workspace remove every backup immediately?',
    message:
      'We plan to remove a test workspace that contains personal records. A colleague assumed that deleting it also erases all backups immediately. I do not want to make that promise without evidence. Can you confirm the backup deletion timing and the policy that governs it?',
  },
  {
    topic: 'account-access',
    subject: 'I used the link once and it stopped working',
    message:
      'I signed in using yesterday’s email link, then signed out on a shared computer. When I clicked the same link again, the page rejected it. Is that expected? I would like to know the correct way to sign in again without changing the email address on my account.',
  },
  {
    topic: 'billing-invoice',
    subject: 'I can’t see Billing in my settings',
    message:
      'My manager asked me to download our subscription invoice. I can use the workspace and see reports, but I do not see a Billing section in Settings. I am a regular member rather than the account owner. Do I need different access, or should the owner retrieve the invoice for me?',
  },
  {
    topic: 'retention-gap',
    subject: 'We need a written deletion schedule for procurement',
    message:
      'Procurement needs a written schedule covering how long personal data remains after our subscription ends. The help articles I found cover invoices and access only. Please point me to an approved policy or help arrange an internal review. A general reassurance will not satisfy the questionnaire.',
  },
  {
    topic: 'account-access',
    subject: 'Will requesting another link delete my saved report?',
    message:
      'I have an unfinished report in my account. The sign-in email from this morning is no longer accepted, and I am hesitant to request another because I do not want to lose the draft. Should I use the same address? Please explain what requesting a new link changes.',
  },
  {
    topic: 'billing-invoice',
    subject: 'Can a teammate send the invoice to accounting?',
    message:
      'The account owner is away today and accounting asked me for the PDF invoice for our last completed payment. I can access the workspace but not billing records. Is there a documented way for a member to retrieve the invoice, or do we need to contact the owner?',
  },
  {
    topic: 'retention-gap',
    subject: 'Can you guarantee deletion on a specific date?',
    message:
      'We have a customer agreement that requires deleting certain records on 31 December. Before importing them, I need to know whether your product guarantees that exact deletion date. I have not found this in your published help articles. Please avoid assuming a retention period and tell me how to get a confirmed policy.',
  },
  {
    topic: 'account-access',
    subject: 'The sign-in email went to spam',
    message:
      'I found the sign-in email in spam after about twenty minutes. When I opened it, the product said it had expired. I now know where the emails arrive, but I am not sure whether to reuse the same link or request a fresh one. Please explain the next step.',
  },
  {
    topic: 'billing-invoice',
    subject: 'I only have the bank statement for this month',
    message:
      'Our finance team has a bank statement showing the subscription charge, but they need a PDF invoice from the product. I own the account and have not used the Billing page before. Could you give me the exact navigation and explain what to do if that completed payment is not listed?',
  },
  {
    topic: 'retention-gap',
    subject: 'Is the retention policy the same for every record type?',
    message:
      'We store two kinds of personal records and our legal team applies different retention periods to them. Does your service support those periods automatically? I do not see a current retention policy in the help center. Please explain what information you need before an accountable owner can review the requirement.',
  },
  {
    topic: 'account-access',
    subject: 'Which details should I send for a failed sign-in?',
    message:
      'I requested two fresh links using the same email address. Both arrived, but I still see an error when trying to enter the account. I checked spam and spelling already. Should I send the error text and the time of each request? I would prefer not to forward anything that could grant access to my account.',
  },
  {
    topic: 'billing-invoice',
    subject: 'A completed payment is missing from the invoice list',
    message:
      'I can download older invoices from Payment history, but the payment made on Monday has no document. I am the account owner and the bank shows the charge as completed. Please tell me which payment details are needed so support can investigate; I do not want to send card information in this message.',
  },
  {
    topic: 'retention-gap',
    subject: 'Can support approve a retention exception?',
    message:
      'Our team wants to keep personal records longer than the period in our own internal policy. Someone suggested support could approve an exception by email. I need to understand whether an approved product policy exists and who is responsible for reviewing this request. Please do not treat this message as an instruction to change retention settings.',
  },
] as const;

export const syntheticNames = [
  'Alex Morgan',
  'Sam Rivera',
  'Jamie Chen',
  'Taylor Reed',
  'Robin Park',
  'Casey Quinn',
  'Jordan Lee',
  'Avery Stone',
] as const;

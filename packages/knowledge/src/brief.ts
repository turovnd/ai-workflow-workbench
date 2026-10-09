import {
  briefSchema,
  type Brief,
  type EvidenceDocument,
  type ReviewCase,
} from '@support-desk/contracts';
export const buildBrief = (
  reviewCase: ReviewCase,
  evidence: readonly EvidenceDocument[],
): Brief => {
  const current = evidence.filter((doc) => doc.current);
  if (!current.length)
    return {
      summary:
        'The knowledge base does not support a retention guarantee. Ask for context and request policy review.',
      reply:
        'Thanks for checking with us. I do not have an approved retention policy that confirms a two-year guarantee. Could you share the type of records and the requirement you need to meet? I can record an internal policy review before we confirm any retention commitment.',
      findings: [],
      caution:
        'Evidence gap: this draft asks for clarification. It does not promise a retention period or deletion schedule.',
      citations: [],
      proposal: null,
    };
  const citations = current.map((doc) => ({
    id: doc.id,
    title: doc.title,
    revision: doc.revision,
    section: doc.section,
    text: doc.text,
    quote:
      doc.text.split('. ')[0] +
      (doc.text.split('. ')[0]?.endsWith('.') ? '' : '.'),
  }));
  const access = reviewCase.id === 'account-access';
  const result = briefSchema.parse({
    summary: access
      ? 'Explain how to request a fresh link, then check email delivery if needed.'
      : 'Direct the account owner to Payment history. Ask for payment details only if the invoice is missing.',
    reply: access
      ? 'Thanks for reaching out. Sign-in links expire after fifteen minutes and can be used once. Please request a new link from the sign-in page using the same email address; requesting a new link does not delete saved work. If the email does not arrive, check your spam folder and confirm the address you entered. If this continues, please share the approximate request time and the error shown. Please do not share your sign-in link or password.'
      : 'Thanks for reaching out. The account owner can go to Settings → Billing → Payment history to download a PDF invoice for a completed subscription payment. If you are not the account owner, please ask them for the invoice. If the invoice is missing, please share the payment date and account billing email so we can record a billing review. Please do not send a full card number.',
    findings: citations.map((citation) => ({
      text: citation.quote,
      citationId: citation.id,
    })),
    caution:
      'Draft only. Review and edit the response before saving it. No email is sent by this demo.',
    citations,
    proposal: {
      title: access
        ? 'Review unresolved account access'
        : 'Review a missing subscription invoice',
      owner: access ? 'Account support' : 'Billing support',
      steps: [
        'Record the customer’s clarifying details.',
        'Review the current knowledge-base articles.',
        'Follow up through the normal support process.',
      ],
      version: 1,
    },
  });
  validateEvidence(result, current);
  return result;
};
export const validateEvidence = (
  brief: Brief,
  evidence: readonly EvidenceDocument[],
): void => {
  for (const citation of brief.citations) {
    const source = evidence.find(
      (doc) =>
        doc.id === citation.id &&
        doc.revision === citation.revision &&
        doc.current,
    );
    if (
      !source ||
      source.text !== citation.text ||
      !source.text.includes(citation.quote)
    )
      throw new Error('Citation does not match retrieved current evidence.');
  }
  for (const finding of brief.findings) {
    const citation = brief.citations.find(
      (item) => item.id === finding.citationId,
    );
    if (!citation || finding.text !== citation.quote)
      throw new Error('Deterministic findings must be exact evidence quotes.');
  }
};

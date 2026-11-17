# Product workflows

## Prepare and review

Open a request and read what the customer has already tried. **Prepare reply** starts a persisted job and immediately shows a waiting/preparing state. The page updates automatically. A successful result contains a customer-specific draft, a short summary and source citations. Open a citation to inspect the article text and revision.

If current articles do not answer the question, the draft asks for clarification. It must not invent a policy. A failed provider call or invalid citation leaves a visible failure; **Prepare another reply** creates a new attempt. Cancellation prevents an in-flight result from becoming the saved draft.

## Edit and approve

Edit the response and **Save edits**. Unsaved edits disable approval. **Review & approve** opens the exact saved text and proposed internal outcome. Confirmation records the response and resolves the request. Choosing **Reply + escalation** also records an internal escalation task. No email, external ticket update or customer-system action occurs.

Approval is versioned and idempotent. A repeated confirmation replays its existing result; a changed intent or stale draft version conflicts. Reload the saved draft before proceeding after a conflict.

## Revisit

Resolved requests remain accessible through navigation. Ticket history retains preparations, approved responses and escalation entries. Open a saved preparation to review an earlier draft and its sources. Inbox and history load additional pages using cursors and explicit limits; refresh starts a new traversal.

# Purchase Order UI — multi-step form with financing and the Promise to Purchase

Frontend for the backend `purchase` module (see
`housing-platform-backend/docs/PROPERTY_PURCHASE_ORDERS.md`). A buyer places a purchase order on a
property in four steps — contact, financing (only when the property carries an active financing
product), agreement, review — and cannot submit until the phone number validates and the Promise
to Purchase Agreement has been read in full, accepted and signed with their full name.

## Routes

| Path | Name | Guard | View |
| --- | --- | --- | --- |
| `/properties/:id/purchase` | `PurchaseOrderCreate` | `requiresAuth`, `requiresBuyer` | `PurchaseOrderCreateView` — the wizard |
| `/purchase-orders/:id` | `PurchaseOrderDetails` | `requiresAuth` | status, financing, agreements (view / sign), history, actions |
| `/purchase-orders` | `PurchaseOrders` | `requiresAuth`, `requiresBuyer` | the buyer's orders |

Entry point: a gold "Place purchase order" button in the price card of `PropertyDetailsView`,
shown for `FOR_SALE` + `AVAILABLE` listings to visitors (the guard sends them to login and back)
and to buyers. Its label says "financing available" when the property has active offers. Amharic
URLs (`/am/...`) are generated automatically by the router's `localizedRoutes`.

## Component structure

```
src/features/purchase
├── api/purchase.types.ts            DTO mirrors of the backend
├── api/purchase.api.ts              preview, create, mine, get, agreements, sign, cancel, …
├── stores/purchaseOrderForm.ts      Pinia store: all wizard state + validation + payload + submit
├── utils/phone.ts                   E.164 normalisation identical to the backend's rules
├── utils/financing.ts               split / instalment maths for live previews
├── utils/markdown.ts                escaped Markdown subset for agreement texts
├── components/
│   ├── PurchaseWizardSteps.vue      progress chips; forward jumps only across valid steps
│   ├── PurchaseContactStep.vue      phone (required), email (optional), message
│   ├── PurchaseFinancingStep.vue    opt-in toggle, offer cards, amount slider, tenure, live summary
│   ├── AgreementReviewPanel.vue     scrollable terms, scroll-to-end gate, name field, checkbox
│   ├── PurchaseAgreementStep.vue    the panel bound to the Promise to Purchase in the store
│   ├── PurchaseReviewStep.vue       summary of exactly what will be posted, "edit" links
│   └── PurchaseOrderStatusBadge.vue
└── views/
    ├── PurchaseOrderCreateView.vue  loads property + preview, hosts the steps, navigation, submit
    ├── PurchaseOrderDetailsView.vue success banner, financing decisions, agreements modal
    └── PurchaseOrdersView.vue
```

The step components hold no state of their own beyond "touched" flags; everything lives in the
store so steps can be revisited and the review step can show the real payload.

## State management

`usePurchaseOrderFormStore` (Pinia setup store):

| Slice | Contents |
| --- | --- |
| `preview` | `GET /properties/{id}/purchase-preview`: price, `financingAvailable`, offers with min/max financeable amounts, `agreementsToSign` (rendered Promise to Purchase with `templateId` + `version`) |
| `step`, `steps` | `steps` is derived: `['contact','financing','agreement','review']` when `financingAvailable`, otherwise the financing step is removed entirely |
| `contact` | `phone`, `email`, `message`; pre-filled from the signed-in user's profile |
| `financing` | `useFinancing` toggle (default on), `selectedOfferId` (recommended offer by default), `financedAmount` (default = maximum), `tenureMonths` (default = product maximum) |
| `agreement` | `templateId`, `scrolledToEnd`, `accepted`, `signatoryFullName` — never persisted |
| submission | `submitting`, `submitError`, `serverFieldErrors`, `createdOrder` |

Derived: `selectedOffer`, `financingApplied`, `split` (financed / cash / coverage / instalment,
same maths as the server), `contactErrors`, `financingErrors`, `agreementErrors`, `stepValid`,
`canSubmit`, `payload` (the exact `CreatePurchaseOrderRequest`).

Contact and financing inputs are mirrored to `sessionStorage` per property so a reload keeps
them. The agreement acceptance is deliberately not saved: the buyer must read and accept the
current text in the session that submits it. `loadPreview` also resets the acceptance whenever the
template id changes.

## Dynamic financing UI

* `preview.financingAvailable` decides whether the financing step exists and whether the sidebar
  says "Bank financing is available" or "Standard cash purchase".
* Inside the step the buyer can opt out (`useFinancing = false` → `useFinancing: false` in the
  payload, plain cash order) or pick an offer and a split. The slider and the two number inputs
  (financed amount / own contribution) are two views of one value; `setDownPayment` converts.
* Limits shown and enforced client-side are the server's: `[minFinanceableAmount,
  maxFinanceableAmount]` and `[minTenureMonths, maxTenureMonths]` per offer. Mode badge shows
  MAXIMUM vs PARTIAL exactly as the backend will classify it.

## Agreement acceptance handling

`AgreementReviewPanel` enforces read-before-sign:

1. The terms render in a scrollable box (`max-h-[50vh]`). A scroll listener flips
   `scrolledToEnd` when the bottom is within 24 px; texts shorter than the box count as read on
   mount. A "Jump to the end" link exists for accessibility, and the read state is shown as a chip.
2. Until `scrolledToEnd`, the name field and the checkbox are disabled.
3. The buyer types their full legal name (≥ 3 characters) — this is the `TYPED_NAME` signature —
   and ticks "I have read and agree to the {title}".
4. `agreementErrors` blocks `next()` and `canSubmit` until all three hold; messages appear after
   the buyer tries to continue (`attempted`), not while they are still reading.
5. The payload carries `promiseToPurchase: { templateId, accepted: true, signatoryFullName }`. If
   the server answers 400 "agreement has changed", the store reloads the preview, clears the
   acceptance, and returns the buyer to the agreement step with an explanation.
6. A change of `content` (new version) resets `scrolledToEnd` and `accepted` inside the panel.

The same panel signs follow-up agreements from the order details page (modal). Signed agreements
open read-only with their SHA-256 fingerprint and both signatures.

## Validation logic

| Field | Rule | Where |
| --- | --- | --- |
| Phone | required; must normalise to E.164 (`09…`, `+2519…`, `2519…`, `00251…`, or `+` + 8–15 digits); shown "Will be stored as +251…" | `utils/phone.ts`, `contactErrors` |
| Email | optional; `^[^\s@]+@[^\s@]+\.[^\s@]+$` when present | `contactErrors` |
| Message | ≤ 2000 chars (counter) | `contactErrors` |
| Offer | required when `useFinancing` | `financingErrors` |
| Financed amount | within the offer's min/max; both amount and own contribution reflect the same value | `utils/financing.ts` |
| Tenure | integer within product range | `utils/financing.ts` |
| Agreement | scrolled to end, accepted, signatory name ≥ 3 chars, template present | `agreementErrors` |
| Server | `fieldErrors[]` from the API are listed under the submit error; 409 → "already have an open order"; 400 template-changed → reload and re-read | `submit()` |

Errors surface on blur or after the buyer presses Next on that step; the step header chips only
allow jumping forward across valid steps.

## Submission state

* Next / Submit buttons: `Submit` is disabled while `!canSubmit`, shows a spinner and
  `aria-busy` while `submitting`, and every input is left enabled so the buyer can correct a
  server-side field error in place.
* Success: `router.push({ name: 'PurchaseOrderDetails', params: { id }, query: { created: '1' } })`;
  the details view shows a success banner with the order number and any server warnings, the
  draft in `sessionStorage` is cleared.
* Failure: message under the form on the review step; the store keeps every input.

## i18n

All strings live under `purchase.*` in `src/i18n/locales/en.json` and `am.json` (160 keys each,
same key set). Server-provided messages are shown verbatim; our own fall-backs are keys that the
views translate through `te()`/`t()`.

## Tests

Vitest (jsdom + Vue Test Utils) is configured in `vitest.config.ts`; run `npm test` (or
`npm run test:watch`). Tests live next to the code under `src/features/purchase`:

| File | Covers |
| --- | --- |
| `utils/phone.test.ts` | the same cases as the backend `PhoneNumberNormalizerTest`, so client and server agree |
| `utils/financing.test.ts` | instalment figures identical to the backend tests (87,039.85 / 58,033.79), split classification, clamping, range validation |
| `utils/markdown.test.ts` | the supported Markdown subset and HTML escaping |
| `stores/purchaseOrderForm.test.ts` | prefill, dynamic steps, every validation gate, payload normalisation, cash opt-out, 409 and "template changed" handling, server field errors, draft persistence |
| `components/AgreementReviewPanel.test.ts` | controls disabled until scrolled to the end, scroll detection, emitted signature input, attempted-only errors, escaped rendering, reset on new text |

`vite build` and `vue-tsc` (on the feature) were also run; the remaining type errors in the repo
are pre-existing, in the shared map components.

/**
 * State for the "place a purchase order" wizard.
 *
 * One store instance per screen visit (reset on init) holding the property preview, the
 * steps' inputs, derived validation and the submission state. Contact and financing inputs are
 * mirrored to sessionStorage per property so a reload does not lose them; the agreement
 * acceptance is deliberately NOT persisted — the buyer must read and accept the current text in
 * the session that submits it.
 */
import { computed, reactive, ref } from 'vue'
import { defineStore } from 'pinia'
import type { Currency } from '@/shared/types'
import { purchaseApi } from '../api/purchase.api'
import type {
  CreatePurchaseOrderRequest,
  DepositPaymentMethod,
  FinancingOption,
  PurchaseOrderResponse,
  PurchasePreviewResponse
} from '../api/purchase.types'
import { isValidEmail, isValidPhone, normalizePhone } from '../utils/phone'
import { computeSplit, validateFinancedAmount, validateTenure } from '../utils/financing'

export type WizardStep = 'account' | 'contact' | 'financing' | 'payment' | 'agreement' | 'review'

export interface FieldErrors {
  [field: string]: string
}

interface DraftSnapshot {
  contact: { phone: string; email: string; message: string }
  financing: {
    useFinancing: boolean
    selectedOfferId: string | null
    financedAmount: number | null
    tenureMonths: number | null
  }
  payment?: { method: DepositPaymentMethod | null; currency?: Currency | null }
}

const DRAFT_KEY = (propertyId: string) => `purchase-order-draft:${propertyId}`

export const usePurchaseOrderFormStore = defineStore('purchaseOrderForm', () => {
  // ------------------------------------------------------------------ state
  const propertyId = ref<string | null>(null)
  const preview = ref<PurchasePreviewResponse | null>(null)
  const loadingPreview = ref(false)
  const previewError = ref<string | null>(null)

  const step = ref<WizardStep>('contact')

  /** True for visitors: an account step (Google / quick sign-up / WhatsApp code) comes first. */
  const needsAccount = ref(false)

  const contact = reactive({ phone: '', email: '', message: '' })
  const financing = reactive({
    /** The opt-in toggle shown only when the property carries an active financing product. */
    useFinancing: true,
    selectedOfferId: null as string | null,
    financedAmount: null as number | null,
    tenureMonths: null as number | null
  })
  const agreement = reactive({
    templateId: null as string | null,
    scrolledToEnd: false,
    accepted: false,
    signatoryFullName: ''
  })
  /** How the buyer will pay the reservation deposit (paid right after the order is placed). */
  const payment = reactive({
    method: null as DepositPaymentMethod | null,
    /** 'USD' pays an ETB deposit by international card; null pays it as quoted. */
    currency: null as Currency | null
  })
  /** The Reservation Deposit Terms, signed with the same name as the Promise to Purchase. */
  const depositAgreement = reactive({
    templateId: null as string | null,
    scrolledToEnd: false,
    accepted: false
  })

  const submitting = ref(false)
  const submitError = ref<string | null>(null)
  const serverFieldErrors = ref<FieldErrors>({})
  const createdOrder = ref<PurchaseOrderResponse | null>(null)

  // ------------------------------------------------------------------ derived
  const financingAvailable = computed(() => preview.value?.financingAvailable === true)

  /** The reservation deposit paid when placing the order; null when deposits are disabled. */
  const depositQuote = computed(() => preview.value?.deposit ?? null)
  /** Online checkout works on this server, so the buyer picks a method and pays right away. */
  const depositOnline = computed(() => depositQuote.value?.checkoutAvailable === true)

  /**
   * The wizard skips the financing step entirely when nothing is linked to the property, and the
   * payment step when no deposit is taken.
   */
  const steps = computed<WizardStep[]>(() => {
    const rest: WizardStep[] = ['contact']
    if (financingAvailable.value) rest.push('financing')
    if (depositQuote.value) rest.push('payment')
    rest.push('agreement', 'review')
    return needsAccount.value ? ['account', ...rest] : rest
  })
  const stepIndex = computed(() => steps.value.indexOf(step.value))

  const selectedOffer = computed<FinancingOption | null>(() => {
    if (!preview.value) return null
    return (
      preview.value.financingOffers.find((o) => o.financingOfferId === financing.selectedOfferId) ??
      null
    )
  })

  /** Whether the order will be bank financed given the current inputs. */
  const financingApplied = computed(
    () => financingAvailable.value && financing.useFinancing && selectedOffer.value !== null
  )

  const split = computed(() => {
    if (!financingApplied.value || !preview.value || !selectedOffer.value) return null
    return computeSplit(
      selectedOffer.value,
      preview.value.listedPrice,
      financing.financedAmount ?? selectedOffer.value.maxFinanceableAmount,
      financing.tenureMonths ?? selectedOffer.value.maxTenureMonths
    )
  })

  const promiseAgreement = computed(
    () =>
      preview.value?.agreementsToSign?.find((a) => a.type === 'PROMISE_TO_PURCHASE') ??
      preview.value?.agreementsToSign?.[0] ??
      null
  )
  const depositTermsAgreement = computed(
    () => preview.value?.agreementsToSign?.find((a) => a.type === 'RESERVATION_DEPOSIT_TERMS') ?? null
  )

  const paymentErrors = computed<FieldErrors>(() => {
    const errors: FieldErrors = {}
    if (depositOnline.value && !payment.method) errors.method = 'purchase.errors.paymentMethodRequired'
    return errors
  })

  const contactErrors = computed<FieldErrors>(() => {
    const errors: FieldErrors = {}
    if (!contact.phone.trim()) errors.phone = 'purchase.errors.phoneRequired'
    else if (!isValidPhone(contact.phone)) errors.phone = 'purchase.errors.phoneInvalid'
    if (contact.email.trim() && !isValidEmail(contact.email)) errors.email = 'validation.email'
    if (contact.message.length > 2000) errors.message = 'purchase.errors.messageTooLong'
    return errors
  })

  const financingErrors = computed<FieldErrors>(() => {
    const errors: FieldErrors = {}
    if (!financingAvailable.value || !financing.useFinancing) return errors
    const offer = selectedOffer.value
    if (!offer) {
      errors.offer = 'purchase.errors.offerRequired'
      return errors
    }
    const amountError = validateFinancedAmount(
      offer,
      financing.financedAmount ?? offer.maxFinanceableAmount
    )
    if (amountError) errors.financedAmount = amountError
    const tenureError = validateTenure(offer, financing.tenureMonths ?? offer.maxTenureMonths)
    if (tenureError) errors.tenureMonths = tenureError
    return errors
  })

  const agreementErrors = computed<FieldErrors>(() => {
    const errors: FieldErrors = {}
    if (!promiseAgreement.value) {
      errors.agreement = 'purchase.errors.agreementUnavailable'
      return errors
    }
    if (!agreement.scrolledToEnd) errors.scroll = 'purchase.errors.agreementNotRead'
    if (!agreement.accepted) errors.accepted = 'purchase.errors.agreementNotAccepted'
    if (agreement.signatoryFullName.trim().length < 3) {
      errors.signatoryFullName = 'purchase.errors.signatoryRequired'
    }
    if (depositTermsAgreement.value) {
      if (!depositAgreement.scrolledToEnd) errors.depositScroll = 'purchase.errors.agreementNotRead'
      if (!depositAgreement.accepted) errors.depositAccepted = 'purchase.errors.agreementNotAccepted'
    }
    return errors
  })

  const stepValid = computed<Record<WizardStep, boolean>>(() => ({
    account: !needsAccount.value,
    contact: Object.keys(contactErrors.value).length === 0,
    financing: Object.keys(financingErrors.value).length === 0,
    payment: Object.keys(paymentErrors.value).length === 0,
    agreement: Object.keys(agreementErrors.value).length === 0,
    review: true
  }))

  const canSubmit = computed(
    () =>
      !submitting.value &&
      !needsAccount.value &&
      stepValid.value.contact &&
      stepValid.value.financing &&
      stepValid.value.payment &&
      stepValid.value.agreement
  )

  /** Exactly what will be posted; also shown on the review step. */
  const payload = computed<CreatePurchaseOrderRequest | null>(() => {
    if (!propertyId.value || !preview.value || !promiseAgreement.value) return null
    const request: CreatePurchaseOrderRequest = {
      propertyId: propertyId.value,
      contactPhone: normalizePhone(contact.phone) ?? contact.phone.trim(),
      currency: preview.value.currency,
      promiseToPurchase: {
        templateId: promiseAgreement.value.templateId,
        accepted: agreement.accepted,
        signatoryFullName: agreement.signatoryFullName.trim()
      }
    }
    if (depositTermsAgreement.value) {
      request.depositTerms = {
        templateId: depositTermsAgreement.value.templateId,
        accepted: depositAgreement.accepted,
        signatoryFullName: agreement.signatoryFullName.trim()
      }
    }
    if (depositQuote.value && payment.method) request.depositPaymentMethod = payment.method
    if (depositQuote.value && payment.currency === 'USD' && depositQuote.value.currency === 'USD' && depositQuote.value.baseAmount) {
      request.depositCurrency = 'USD'
    }
    if (contact.email.trim()) request.contactEmail = contact.email.trim()
    if (contact.message.trim()) request.buyerMessage = contact.message.trim()
    if (financingAvailable.value) {
      if (!financing.useFinancing) {
        request.useFinancing = false
      } else if (selectedOffer.value && split.value) {
        request.useFinancing = true
        request.financing = {
          financingOfferId: selectedOffer.value.financingOfferId,
          financedAmount: split.value.financedAmount,
          requestedTenureMonths: split.value.tenureMonths
        }
      }
    }
    return request
  })

  // ------------------------------------------------------------------ actions
  function reset() {
    propertyId.value = null
    preview.value = null
    loadingPreview.value = false
    previewError.value = null
    step.value = 'contact'
    needsAccount.value = false
    Object.assign(contact, { phone: '', email: '', message: '' })
    Object.assign(financing, {
      useFinancing: true,
      selectedOfferId: null,
      financedAmount: null,
      tenureMonths: null
    })
    resetAgreement()
    resetDepositAgreement()
    payment.method = null
    payment.currency = null
    submitting.value = false
    submitError.value = null
    serverFieldErrors.value = {}
    createdOrder.value = null
  }

  function resetDepositAgreement() {
    Object.assign(depositAgreement, { templateId: null, scrolledToEnd: false, accepted: false })
  }

  function resetAgreement() {
    Object.assign(agreement, {
      templateId: null,
      scrolledToEnd: false,
      accepted: false,
      signatoryFullName: ''
    })
  }

  /**
   * Starts the wizard for a property. Pre-fills the contact fields from the signed-in user, then
   * restores a saved draft (which wins over the profile values).
   */
  async function init(
    id: string,
    currentUser?: { phoneNumber?: string | null; email?: string | null } | null,
    currency?: Currency,
    requireAccount = false
  ) {
    reset()
    propertyId.value = id
    needsAccount.value = requireAccount
    if (requireAccount) step.value = 'account'
    contact.phone = currentUser?.phoneNumber ?? ''
    contact.email = currentUser?.email ?? ''
    restoreDraft()
    await loadPreview(currency)
  }

  /**
   * The visitor now has an account. Drop the account step, pre-fill what they told us (a draft
   * that already holds a phone wins) and re-render the agreement for the signed-in buyer.
   */
  async function accountReady(details: { fullName?: string; phone?: string; email?: string }) {
    needsAccount.value = false
    if (details.phone && !contact.phone) contact.phone = details.phone
    if (details.email && !contact.email) contact.email = details.email
    if (details.fullName && !agreement.signatoryFullName) agreement.signatoryFullName = details.fullName
    step.value = 'contact'
    await loadPreview()
  }

  async function loadPreview(currency?: Currency) {
    if (!propertyId.value) return
    loadingPreview.value = true
    previewError.value = null
    try {
      const data = await purchaseApi.preview(
        propertyId.value,
        currency,
        payment.currency === 'USD' ? 'USD' : undefined
      )
      preview.value = data
      // Default to the recommended offer and its maximum split unless a draft chose otherwise.
      const offers = data.financingOffers
      if (offers.length) {
        const keep = offers.find((o) => o.financingOfferId === financing.selectedOfferId)
        const chosen = keep ?? offers.find((o) => o.recommended) ?? offers[0]
        selectOffer(chosen.financingOfferId, keep !== undefined)
      }
      // A new template version invalidates any previous acceptance.
      const promise =
        data.agreementsToSign?.find((a) => a.type === 'PROMISE_TO_PURCHASE') ?? data.agreementsToSign?.[0]
      if (!promise || promise.templateId !== agreement.templateId) {
        resetAgreement()
        agreement.templateId = promise?.templateId ?? null
      }
      const terms = data.agreementsToSign?.find((a) => a.type === 'RESERVATION_DEPOSIT_TERMS')
      if (!terms || terms.templateId !== depositAgreement.templateId) {
        resetDepositAgreement()
        depositAgreement.templateId = terms?.templateId ?? null
      }
      // USD no longer offered (rate removed): fall back to birr.
      if (payment.currency === 'USD' && data.deposit && !data.deposit.baseAmount) payment.currency = null
      // Drop a remembered method the server no longer offers.
      if (payment.method && !data.deposit?.paymentMethods?.includes(payment.method)) payment.method = null
    } catch (err: any) {
      previewError.value = extractMessage(err, 'purchase.errors.previewFailed')
    } finally {
      loadingPreview.value = false
    }
  }

  function selectOffer(offerId: string, keepAmounts = false) {
    financing.selectedOfferId = offerId
    const offer = selectedOffer.value
    if (!offer) return
    if (!keepAmounts || financing.financedAmount == null) {
      financing.financedAmount = offer.maxFinanceableAmount
    } else {
      financing.financedAmount = Math.min(
        offer.maxFinanceableAmount,
        Math.max(offer.minFinanceableAmount, financing.financedAmount)
      )
    }
    if (!keepAmounts || financing.tenureMonths == null) {
      financing.tenureMonths = offer.maxTenureMonths
    } else {
      financing.tenureMonths = Math.min(
        offer.maxTenureMonths,
        Math.max(offer.minTenureMonths, financing.tenureMonths)
      )
    }
  }

  /** Setting the cash portion is the same choice seen from the other side. */
  function setDownPayment(cash: number) {
    if (!preview.value) return
    financing.financedAmount = Math.round((preview.value.listedPrice - cash) * 100) / 100
  }

  /**
   * Switch the deposit between birr and USD (international card). The deposit terms quote the
   * amount, so they are re-rendered and must be read and accepted again.
   */
  async function setDepositCurrency(currency: 'ETB' | 'USD') {
    const next = currency === 'USD' ? 'USD' : null
    if (payment.currency === next) return
    payment.currency = next
    if (next === 'USD') payment.method = 'CARD'
    resetDepositAgreement()
    await loadPreview(preview.value?.currency)
    const terms = preview.value?.agreementsToSign?.find((a) => a.type === 'RESERVATION_DEPOSIT_TERMS')
    depositAgreement.templateId = terms?.templateId ?? null
  }

  function goTo(target: WizardStep) {
    // Never jump past a step that is still invalid.
    const targetIndex = steps.value.indexOf(target)
    for (let i = 0; i < targetIndex; i++) {
      if (!stepValid.value[steps.value[i]]) {
        step.value = steps.value[i]
        return
      }
    }
    step.value = target
    saveDraft()
  }

  function next() {
    if (!stepValid.value[step.value]) return
    const i = stepIndex.value
    if (i < steps.value.length - 1) goTo(steps.value[i + 1])
  }

  function back() {
    const i = stepIndex.value
    if (i > 0) step.value = steps.value[i - 1]
  }

  async function submit(): Promise<PurchaseOrderResponse | null> {
    if (!canSubmit.value || !payload.value) {
      // Send the buyer to the first step that still needs attention.
      goTo(steps.value.find((s) => !stepValid.value[s]) ?? 'review')
      return null
    }
    submitting.value = true
    submitError.value = null
    serverFieldErrors.value = {}
    try {
      const order = await purchaseApi.create(payload.value)
      createdOrder.value = order
      clearDraft()
      return order
    } catch (err: any) {
      const status = err?.response?.status
      const body = err?.response?.data
      if (Array.isArray(body?.fieldErrors)) {
        const errors: FieldErrors = {}
        for (const fe of body.fieldErrors) errors[String(fe.field)] = String(fe.message)
        serverFieldErrors.value = errors
      }
      if (status === 409) {
        submitError.value = 'purchase.errors.duplicateOrder'
      } else if (
        status === 400 &&
        /(Promise to Purchase agreement|Reservation Deposit Terms) ha(s|ve) changed/i.test(body?.message ?? '')
      ) {
        // The text changed under the buyer: reload it and make them read it again.
        submitError.value = 'purchase.errors.agreementChanged'
        await loadPreview()
        goTo('agreement')
      } else {
        submitError.value = extractMessage(err, 'purchase.errors.submitFailed')
      }
      return null
    } finally {
      submitting.value = false
    }
  }

  // ------------------------------------------------------------------ draft persistence
  function saveDraft() {
    if (!propertyId.value || typeof sessionStorage === 'undefined') return
    const snapshot: DraftSnapshot = {
      contact: { ...contact },
      financing: { ...financing },
      payment: { ...payment }
    }
    try {
      sessionStorage.setItem(DRAFT_KEY(propertyId.value), JSON.stringify(snapshot))
    } catch {
      /* storage may be unavailable; the form still works */
    }
  }

  function restoreDraft() {
    if (!propertyId.value || typeof sessionStorage === 'undefined') return
    try {
      const raw = sessionStorage.getItem(DRAFT_KEY(propertyId.value))
      if (!raw) return
      const snapshot = JSON.parse(raw) as DraftSnapshot
      Object.assign(contact, snapshot.contact)
      Object.assign(financing, snapshot.financing)
      if (snapshot.payment) Object.assign(payment, snapshot.payment)
    } catch {
      /* ignore a corrupt draft */
    }
  }

  function clearDraft() {
    if (!propertyId.value || typeof sessionStorage === 'undefined') return
    try {
      sessionStorage.removeItem(DRAFT_KEY(propertyId.value))
    } catch {
      /* ignore */
    }
  }

  return {
    // state
    propertyId,
    preview,
    loadingPreview,
    previewError,
    step,
    needsAccount,
    contact,
    financing,
    agreement,
    payment,
    depositAgreement,
    submitting,
    submitError,
    serverFieldErrors,
    createdOrder,
    // derived
    financingAvailable,
    steps,
    stepIndex,
    selectedOffer,
    financingApplied,
    split,
    promiseAgreement,
    depositTermsAgreement,
    depositQuote,
    depositOnline,
    paymentErrors,
    contactErrors,
    financingErrors,
    agreementErrors,
    stepValid,
    canSubmit,
    payload,
    // actions
    init,
    accountReady,
    loadPreview,
    selectOffer,
    setDownPayment,
    setDepositCurrency,
    goTo,
    next,
    back,
    submit,
    reset,
    saveDraft
  }
})

/** The server's message when it sent one, otherwise an i18n key the caller translates. */
export function extractMessage(err: any, fallbackKey: string): string {
  const message = err?.response?.data?.message
  return typeof message === 'string' && message.trim() ? message : fallbackKey
}

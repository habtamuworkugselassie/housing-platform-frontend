import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { purchaseApi } from '../api/purchase.api'
import type { PurchasePreviewResponse } from '../api/purchase.types'
import { OFFER } from '../utils/financing.test'
import { usePurchaseOrderFormStore } from './purchaseOrderForm'

vi.mock('../api/purchase.api', () => ({
  purchaseApi: {
    preview: vi.fn(),
    create: vi.fn()
  }
}))

const PREVIEW: PurchasePreviewResponse = {
  propertyId: 'prop-1',
  listedPrice: 8_500_000,
  currency: 'ETB',
  purchaseType: 'BANK_FINANCED',
  financingAvailable: true,
  financingOffers: [OFFER],
  agreementsToSign: [
    {
      templateId: 'tpl-1',
      type: 'PROMISE_TO_PURCHASE',
      version: 1,
      title: 'Promise to Purchase Agreement',
      content: '# PROMISE\n\n**Dream Teams Trading PLC**'
    }
  ]
}

const preview = vi.mocked(purchaseApi.preview)
const create = vi.mocked(purchaseApi.create)

/** Walks a store through valid contact + agreement so tests can focus on one gate. */
function fillValid(store: ReturnType<typeof usePurchaseOrderFormStore>) {
  store.contact.phone = '0911223344'
  store.agreement.scrolledToEnd = true
  store.agreement.accepted = true
  store.agreement.signatoryFullName = 'Abebe Kebede'
}

describe('usePurchaseOrderFormStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    sessionStorage.clear()
    preview.mockResolvedValue(PREVIEW)
    create.mockResolvedValue({ id: 'order-1', orderNumber: 'PPO-2026-TEST' } as any)
  })

  describe('init', () => {
    it('prefills contact details from the profile and picks the recommended offer at its maximum', async () => {
      const store = usePurchaseOrderFormStore()
      await store.init('prop-1', { phoneNumber: '0911223344', email: 'Buyer@Example.com' })
      expect(store.contact.phone).toBe('0911223344')
      expect(store.contact.email).toBe('Buyer@Example.com')
      expect(store.financing.selectedOfferId).toBe('offer-1')
      expect(store.financing.financedAmount).toBe(6_800_000)
      expect(store.financing.tenureMonths).toBe(240)
      expect(store.agreement.templateId).toBe('tpl-1')
    })

    it('includes the financing step only when the property has an active financing product', async () => {
      const store = usePurchaseOrderFormStore()
      await store.init('prop-1')
      expect(store.steps).toEqual(['contact', 'financing', 'agreement', 'review'])

      preview.mockResolvedValue({ ...PREVIEW, financingAvailable: false, purchaseType: 'CASH', financingOffers: [] })
      await store.init('prop-2')
      expect(store.steps).toEqual(['contact', 'agreement', 'review'])
      expect(store.financingApplied).toBe(false)
    })

    it('surfaces a preview failure', async () => {
      preview.mockRejectedValue({ response: { status: 500, data: { message: 'boom' } } })
      const store = usePurchaseOrderFormStore()
      await store.init('prop-1')
      expect(store.previewError).toBe('boom')
    })
  })

  describe('contact step', () => {
    it('requires a valid phone and a well-formed optional email', async () => {
      const store = usePurchaseOrderFormStore()
      await store.init('prop-1')
      expect(store.contactErrors.phone).toBe('purchase.errors.phoneRequired')
      store.contact.phone = 'abc'
      expect(store.contactErrors.phone).toBe('purchase.errors.phoneInvalid')
      store.contact.phone = '0911223344'
      store.contact.email = 'nope'
      expect(store.contactErrors.email).toBe('validation.email')
      store.contact.email = ''
      expect(store.stepValid.contact).toBe(true)
    })

    it('does not advance while the step is invalid', async () => {
      const store = usePurchaseOrderFormStore()
      await store.init('prop-1')
      store.next()
      expect(store.step).toBe('contact')
      store.contact.phone = '0911223344'
      store.next()
      expect(store.step).toBe('financing')
    })
  })

  describe('financing step', () => {
    it('computes the split and enforces the offer range', async () => {
      const store = usePurchaseOrderFormStore()
      await store.init('prop-1')
      store.financing.financedAmount = 4_250_000
      store.financing.tenureMonths = 180
      expect(store.split).toMatchObject({ mode: 'PARTIAL', cashPortion: 4_250_000, coverageRatio: 0.5 })
      store.financing.financedAmount = 100
      expect(store.financingErrors.financedAmount).toBe('purchase.errors.financedAmountBelowMin')
      expect(store.stepValid.financing).toBe(false)
    })

    it('lets the buyer express the split as a down payment', async () => {
      const store = usePurchaseOrderFormStore()
      await store.init('prop-1')
      store.setDownPayment(2_000_000)
      expect(store.financing.financedAmount).toBe(6_500_000)
    })

    it('opting out yields a cash payload without a financing block', async () => {
      const store = usePurchaseOrderFormStore()
      await store.init('prop-1')
      fillValid(store)
      store.financing.useFinancing = false
      expect(store.stepValid.financing).toBe(true)
      expect(store.payload?.useFinancing).toBe(false)
      expect(store.payload?.financing).toBeUndefined()
    })
  })

  describe('agreement step', () => {
    it('needs the text read to the end, the checkbox and a name', async () => {
      const store = usePurchaseOrderFormStore()
      await store.init('prop-1')
      store.contact.phone = '0911223344'
      expect(store.agreementErrors).toMatchObject({
        scroll: 'purchase.errors.agreementNotRead',
        accepted: 'purchase.errors.agreementNotAccepted',
        signatoryFullName: 'purchase.errors.signatoryRequired'
      })
      store.agreement.scrolledToEnd = true
      store.agreement.signatoryFullName = 'Abebe Kebede'
      expect(store.canSubmit).toBe(false)
      store.agreement.accepted = true
      expect(store.stepValid.agreement).toBe(true)
      expect(store.canSubmit).toBe(true)
    })

    it('resets acceptance when the template version changes', async () => {
      const store = usePurchaseOrderFormStore()
      await store.init('prop-1')
      fillValid(store)
      preview.mockResolvedValue({ ...PREVIEW, agreementsToSign: [{ ...PREVIEW.agreementsToSign[0], templateId: 'tpl-2', version: 2 }] })
      await store.loadPreview()
      expect(store.agreement.accepted).toBe(false)
      expect(store.agreement.scrolledToEnd).toBe(false)
      expect(store.agreement.templateId).toBe('tpl-2')
    })
  })

  describe('payload and submit', () => {
    it('posts normalised, trimmed values and the signature', async () => {
      const store = usePurchaseOrderFormStore()
      await store.init('prop-1')
      fillValid(store)
      store.contact.phone = '+251 911 22 33 44'
      store.contact.email = '  '
      store.contact.message = '  Saturday?  '
      store.financing.financedAmount = 4_250_000
      store.financing.tenureMonths = 180

      const order = await store.submit()
      expect(order?.id).toBe('order-1')
      expect(create).toHaveBeenCalledWith({
        propertyId: 'prop-1',
        contactPhone: '+251911223344',
        currency: 'ETB',
        buyerMessage: 'Saturday?',
        useFinancing: true,
        financing: { financingOfferId: 'offer-1', financedAmount: 4_250_000, requestedTenureMonths: 180 },
        promiseToPurchase: { templateId: 'tpl-1', accepted: true, signatoryFullName: 'Abebe Kebede' }
      })
      expect(store.createdOrder?.orderNumber).toBe('PPO-2026-TEST')
    })

    it('refuses to submit while a gate is open and jumps to that step', async () => {
      const store = usePurchaseOrderFormStore()
      await store.init('prop-1')
      fillValid(store)
      store.agreement.accepted = false
      store.step = 'review'
      expect(await store.submit()).toBeNull()
      expect(create).not.toHaveBeenCalled()
      expect(store.step).toBe('agreement')
    })

    it('maps a 409 to the duplicate-order message', async () => {
      const store = usePurchaseOrderFormStore()
      await store.init('prop-1')
      fillValid(store)
      create.mockRejectedValue({ response: { status: 409, data: { message: 'dup' } } })
      expect(await store.submit()).toBeNull()
      expect(store.submitError).toBe('purchase.errors.duplicateOrder')
    })

    it('reloads the agreement and sends the buyer back when the text changed under them', async () => {
      const store = usePurchaseOrderFormStore()
      await store.init('prop-1')
      fillValid(store)
      store.step = 'review'
      preview.mockResolvedValue({ ...PREVIEW, agreementsToSign: [{ ...PREVIEW.agreementsToSign[0], templateId: 'tpl-2', version: 2 }] })
      create.mockRejectedValue({
        response: { status: 400, data: { message: 'The Promise to Purchase agreement has changed (current version 2)' } }
      })
      expect(await store.submit()).toBeNull()
      expect(store.submitError).toBe('purchase.errors.agreementChanged')
      expect(store.step).toBe('agreement')
      expect(store.agreement.accepted).toBe(false)
      expect(store.agreement.templateId).toBe('tpl-2')
    })

    it('collects server field errors and keeps the server message', async () => {
      const store = usePurchaseOrderFormStore()
      await store.init('prop-1')
      fillValid(store)
      create.mockRejectedValue({
        response: { status: 400, data: { message: 'Validation Failed', fieldErrors: [{ field: 'contactEmail', message: 'bad' }] } }
      })
      await store.submit()
      expect(store.submitError).toBe('Validation Failed')
      expect(store.serverFieldErrors).toEqual({ contactEmail: 'bad' })
    })
  })

  describe('draft persistence', () => {
    it('restores contact and financing but never the agreement acceptance', async () => {
      const store = usePurchaseOrderFormStore()
      await store.init('prop-1')
      store.contact.phone = '0911223344'
      store.contact.message = 'keep me'
      store.financing.financedAmount = 4_000_000
      fillValid(store)
      store.saveDraft()

      setActivePinia(createPinia())
      const again = usePurchaseOrderFormStore()
      await again.init('prop-1', { phoneNumber: '0999999999' })
      expect(again.contact.phone).toBe('0911223344')
      expect(again.contact.message).toBe('keep me')
      expect(again.financing.financedAmount).toBe(4_000_000)
      expect(again.agreement.accepted).toBe(false)
      expect(again.agreement.signatoryFullName).toBe('')
    })

    it('clears the draft after a successful submit', async () => {
      const store = usePurchaseOrderFormStore()
      await store.init('prop-1')
      fillValid(store)
      store.saveDraft()
      expect(sessionStorage.getItem('purchase-order-draft:prop-1')).not.toBeNull()
      await store.submit()
      expect(sessionStorage.getItem('purchase-order-draft:prop-1')).toBeNull()
    })
  })

  describe('account step for visitors', () => {
    it('puts an account step first and blocks submission until the visitor signs in', async () => {
      const store = usePurchaseOrderFormStore()
      await store.init('prop-1', null, undefined, true)
      expect(store.steps).toEqual(['account', 'contact', 'financing', 'agreement', 'review'])
      expect(store.step).toBe('account')
      expect(store.stepValid.account).toBe(false)
      fillValid(store)
      expect(store.canSubmit).toBe(false)
      // the preview is public, so financing offers and the agreement are already there
      expect(store.preview?.agreementsToSign).toHaveLength(1)
    })

    it('drops the account step and pre-fills contact and signatory once authenticated', async () => {
      const store = usePurchaseOrderFormStore()
      await store.init('prop-1', null, undefined, true)
      await store.accountReady({ fullName: 'Abebe Kebede', phone: '+251911223344', email: 'abebe@example.com' })
      expect(store.steps).toEqual(['contact', 'financing', 'agreement', 'review'])
      expect(store.step).toBe('contact')
      expect(store.contact.phone).toBe('+251911223344')
      expect(store.contact.email).toBe('abebe@example.com')
      expect(store.agreement.signatoryFullName).toBe('Abebe Kebede')
      expect(preview).toHaveBeenCalledTimes(2) // re-rendered for the signed-in buyer
      store.agreement.scrolledToEnd = true
      store.agreement.accepted = true
      expect(store.canSubmit).toBe(true)
    })

    it('never overwrites a saved draft phone with the account phone', async () => {
      const store = usePurchaseOrderFormStore()
      await store.init('prop-1', null, undefined, true)
      store.contact.phone = '0700000000'
      await store.accountReady({ phone: '+251911223344' })
      expect(store.contact.phone).toBe('0700000000')
    })
  })

  describe('reservation deposit at order placement', () => {
    const WITH_DEPOSIT: PurchasePreviewResponse = {
      ...PREVIEW,
      financingAvailable: false,
      financingOffers: [],
      purchaseType: 'CASH',
      deposit: {
        amount: 85_000,
        currency: 'ETB',
        checkoutAvailable: true,
        paymentMethods: ['TELEBIRR', 'CBE_BIRR', 'MPESA', 'AWASH_BIRR', 'CARD']
      },
      agreementsToSign: [
        ...PREVIEW.agreementsToSign,
        {
          templateId: 'tpl-dep',
          type: 'RESERVATION_DEPOSIT_TERMS',
          version: 2,
          title: 'Reservation Deposit Terms',
          content: '# DEPOSIT'
        }
      ]
    }

    beforeEach(() => preview.mockResolvedValue(WITH_DEPOSIT))

    it('adds a payment step before the agreement', async () => {
      const store = usePurchaseOrderFormStore()
      await store.init('prop-1')
      expect(store.steps).toEqual(['contact', 'payment', 'agreement', 'review'])
    })

    it('requires a method and both agreements before submitting', async () => {
      const store = usePurchaseOrderFormStore()
      await store.init('prop-1')
      fillValid(store)
      expect(store.stepValid.payment).toBe(false)
      store.payment.method = 'TELEBIRR'
      expect(store.stepValid.payment).toBe(true)
      expect(store.stepValid.agreement).toBe(false)
      store.depositAgreement.scrolledToEnd = true
      store.depositAgreement.accepted = true
      expect(store.canSubmit).toBe(true)
    })

    it('posts the method and signs the deposit terms with the same name', async () => {
      const store = usePurchaseOrderFormStore()
      await store.init('prop-1')
      fillValid(store)
      store.payment.method = 'CBE_BIRR'
      store.depositAgreement.scrolledToEnd = true
      store.depositAgreement.accepted = true
      await store.submit()
      const body = create.mock.calls[0][0]
      expect(body.depositPaymentMethod).toBe('CBE_BIRR')
      expect(body.depositTerms).toEqual({ templateId: 'tpl-dep', accepted: true, signatoryFullName: 'Abebe Kebede' })
      expect(body.promiseToPurchase.templateId).toBe('tpl-1')
    })

    it('skips the method choice when online checkout is not configured', async () => {
      preview.mockResolvedValue({ ...WITH_DEPOSIT, deposit: { ...WITH_DEPOSIT.deposit!, checkoutAvailable: false } })
      const store = usePurchaseOrderFormStore()
      await store.init('prop-1')
      expect(store.steps).toContain('payment')
      expect(store.stepValid.payment).toBe(true)
    })

    it('switches the deposit to USD by card and re-renders the terms', async () => {
      preview.mockResolvedValueOnce({ ...WITH_DEPOSIT, deposit: { ...WITH_DEPOSIT.deposit!, usdAmount: 566.67 } })
      const store = usePurchaseOrderFormStore()
      await store.init('prop-1')
      store.payment.method = 'TELEBIRR'
      store.depositAgreement.scrolledToEnd = true
      store.depositAgreement.accepted = true
      preview.mockResolvedValueOnce({
        ...WITH_DEPOSIT,
        deposit: {
          amount: 566.67,
          currency: 'USD',
          checkoutAvailable: true,
          paymentMethods: ['CARD'],
          baseAmount: 85_000,
          baseCurrency: 'ETB',
          exchangeRate: 150
        }
      })
      await store.setDepositCurrency('USD')
      expect(preview).toHaveBeenLastCalledWith('prop-1', 'ETB', 'USD')
      expect(store.payment.method).toBe('CARD')
      expect(store.depositAgreement.accepted).toBe(false)
      expect(store.payload?.depositCurrency).toBe('USD')
      expect(store.depositQuote?.amount).toBe(566.67)
    })

    it('has no payment step when deposits are disabled', async () => {
      preview.mockResolvedValue({ ...WITH_DEPOSIT, deposit: null, agreementsToSign: PREVIEW.agreementsToSign })
      const store = usePurchaseOrderFormStore()
      await store.init('prop-1')
      expect(store.steps).toEqual(['contact', 'agreement', 'review'])
      expect(store.payload?.depositTerms).toBeUndefined()
    })
  })
})

/**
 * @file app/(client)/dashboard/payments/page.tsx
 * @author AdFlow Pro Team
 * @date 2026-03-19
 * @description Client payment submission page with fixed form submission.
 */

"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { CreditCard, CheckCircle, Clock, XCircle } from "lucide-react"
import toast from "react-hot-toast"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { PageLoader } from "@/components/ui/Spinner"
import api from "@/lib/axios"
import { formatCurrency, formatDate } from "@/lib/utils"
import { PAYMENT_METHODS } from "@/constants"

const METHODS = ["Easypaisa", "JazzCash", "Bank Transfer", "HBL Konnect", "UBL Omni", "Cash", "Other"]

function usePendingAds() {
  return useQuery({
    queryKey: ["pending-payment-ads"],
    queryFn: async () => {
      const res = await api.get("/api/client/ads")
      return (res.data.data ?? []).filter((a: any) => a.status === "payment_pending")
    },
  })
}

function useMyPayments() {
  return useQuery({
    queryKey: ["my-payments"],
    queryFn: async () => {
      const res = await api.get("/api/client/payments")
      return res.data.data ?? []
    },
  })
}

export default function PaymentsPage() {
  const { data: pendingAds = [], isLoading } = usePendingAds()
  const { data: payments = [] } = useMyPayments()
  const qc = useQueryClient()

  const [adId, setAdId] = useState("")
  const [amount, setAmount] = useState("")
  const [method, setMethod] = useState("")
  const [txnRef, setTxnRef] = useState("")
  const [senderName, setSenderName] = useState("")
  const [screenshotUrl, setScreenshotUrl] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})

  const submitPayment = useMutation({
    mutationFn: async (payload: any) => {
      const res = await api.post("/api/client/payments", payload)
      return res.data
    },
    onSuccess: () => {
      toast.success("Payment proof submitted!")
      setAdId("")
      setAmount("")
      setMethod("")
      setTxnRef("")
      setSenderName("")
      setScreenshotUrl("")
      setErrors({})
      qc.invalidateQueries({ queryKey: ["my-payments"] })
      qc.invalidateQueries({ queryKey: ["pending-payment-ads"] })
    },
    onError: (e: any) => {
      const msg = e?.response?.data?.message ?? "Failed to submit payment"
      toast.error(msg)
      console.error("[PAYMENT ERROR]", e?.response?.data)
    },
  })

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!adId) errs.adId = "Please select an ad"
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) errs.amount = "Enter a valid amount"
    if (!method) errs.method = "Select a payment method"
    if (!txnRef.trim()) errs.txnRef = "Transaction reference is required"
    if (!senderName.trim()) errs.senderName = "Sender name is required"
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return
    submitPayment.mutate({
      ad_id: adId,
      amount: Number(amount),
      method,
      transaction_ref: txnRef.trim(),
      sender_name: senderName.trim(),
      screenshot_url: screenshotUrl.trim() || undefined,
    })
  }

  if (isLoading) return <DashboardLayout title="Payments"><PageLoader /></DashboardLayout>

  return (
    <DashboardLayout title="Payments">
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">

        {pendingAds.length > 0 && (
          <Card>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">Submit Payment Proof</h2>
                <p className="text-xs text-gray-400">{pendingAds.length} ad(s) awaiting payment</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Ad selector */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Select Ad <span className="text-red-500">*</span></label>
                <select
                  value={adId}
                  onChange={e => setAdId(e.target.value)}
                  className="w-full h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Choose an ad...</option>
                  {pendingAds.map((ad: any) => (
                    <option key={ad.id} value={ad.id}>{ad.title}</option>
                  ))}
                </select>
                {errors.adId && <p className="text-xs text-red-500">{errors.adId}</p>}
              </div>

              {/* Amount + Method */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">Amount (PKR) <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    placeholder="500"
                    className="h-10 rounded-lg border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.amount && <p className="text-xs text-red-500">{errors.amount}</p>}
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">Payment Method <span className="text-red-500">*</span></label>
                  <select
                    value={method}
                    onChange={e => setMethod(e.target.value)}
                    className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select method</option>
                    {METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                  {errors.method && <p className="text-xs text-red-500">{errors.method}</p>}
                </div>
              </div>

              {/* Transaction ref + Sender name */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">Transaction Reference <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={txnRef}
                    onChange={e => setTxnRef(e.target.value)}
                    placeholder="TXN123456"
                    className="h-10 rounded-lg border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.txnRef && <p className="text-xs text-red-500">{errors.txnRef}</p>}
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">Sender Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={senderName}
                    onChange={e => setSenderName(e.target.value)}
                    placeholder="Ahmad Nawaz"
                    className="h-10 rounded-lg border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.senderName && <p className="text-xs text-red-500">{errors.senderName}</p>}
                </div>
              </div>

              {/* Screenshot URL */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Screenshot URL <span className="text-gray-400 font-normal">(optional)</span></label>
                <input
                  type="url"
                  value={screenshotUrl}
                  onChange={e => setScreenshotUrl(e.target.value)}
                  placeholder="https://..."
                  className="h-10 rounded-lg border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <Button className="w-full" onClick={handleSubmit} loading={submitPayment.isPending}>
                Submit Payment Proof
              </Button>
            </div>
          </Card>
        )}

        {pendingAds.length === 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
            No ads are currently awaiting payment.
          </div>
        )}

        {/* Payment history */}
        <Card>
          <h2 className="font-semibold text-gray-900 mb-4">Payment History</h2>
          {!payments.length ? (
            <div className="text-center py-8">
              <CreditCard className="w-10 h-10 text-gray-200 mx-auto mb-3" />
              <p className="text-sm text-gray-400">No payments yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {payments.map((p: any) => (
                <div key={p.id} className="flex items-start justify-between gap-3 p-4 bg-gray-50 rounded-xl">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">{p.ad?.title ?? "Ad payment"}</p>
                    <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-500">
                      <span>{p.method}</span>
                      <span className="font-mono">{p.transaction_ref}</span>
                      <span>{formatDate(p.created_at)}</span>
                    </div>
                    {p.admin_note && <p className="text-xs text-gray-500 mt-1 italic">Note: {p.admin_note}</p>}
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <p className="font-bold text-sm text-gray-900">{formatCurrency(p.amount)}</p>
                    <div className="flex items-center justify-end gap-1 mt-1">
                      {p.status === "verified" && <CheckCircle className="w-3.5 h-3.5 text-green-500" />}
                      {p.status === "pending" && <Clock className="w-3.5 h-3.5 text-yellow-500" />}
                      {p.status === "rejected" && <XCircle className="w-3.5 h-3.5 text-red-500" />}
                      <span className={`text-xs font-medium ${p.status === "verified" ? "text-green-600" : p.status === "rejected" ? "text-red-500" : "text-yellow-600"}`}>
                        {p.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  )
}

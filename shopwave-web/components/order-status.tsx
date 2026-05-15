'use client'

import { useEffect, useState } from 'react'
import { getOrder } from '@/lib/api'

const STEPS = ['Order placed', 'Confirmed', 'Processing', 'Shipped']
const STATUS_STEP: Record<string, number> = {
  pending: 0,
  confirmed: 1,
  processing: 2,
  shipped: 3,
}

export default function OrderStatus({ orderId }: { orderId: string }) {
  const [status, setStatus] = useState('pending')
  const [workflowId, setWorkflowId] = useState<string>('')

  useEffect(() => {
    const poll = async () => {
      try {
        const order = await getOrder(orderId)
        setStatus(order.status)
        setWorkflowId(order.workflow_id)
      } catch {}
    }
    poll()
    const interval = setInterval(poll, 3000)
    return () => clearInterval(interval)
  }, [orderId])

  const currentStep = STATUS_STEP[status] ?? 0

  return (
    <div className="mt-8 rounded-2xl border border-slate-200/80 bg-slate-50 p-6">
      <p className="text-center text-sm font-medium text-slate-600">Order progress</p>
      <div className="relative mt-6">
        <div className="absolute left-0 right-0 top-4 h-0.5 bg-slate-200" aria-hidden />
        <div
          className="absolute left-0 top-4 h-0.5 bg-indigo-600 transition-all duration-500"
          style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
          aria-hidden
        />
        <div className="relative flex justify-between">
          {STEPS.map((step, i) => (
            <div key={step} className="flex flex-col items-center">
              <div
                className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all duration-300 ${
                  i <= currentStep
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-white text-slate-400 ring-2 ring-slate-200'
                }`}
              >
                {i < currentStep ? (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  i + 1
                )}
              </div>
              <span
                className={`mt-2 max-w-[72px] text-center text-xs leading-tight ${
                  i <= currentStep ? 'font-medium text-slate-900' : 'text-slate-400'
                }`}
              >
                {step}
              </span>
            </div>
          ))}
        </div>
      </div>
      {workflowId && workflowId !== 'unknown' && (
        <p className="mt-5 text-center font-mono text-xs text-slate-400">
          Workflow: {workflowId}
        </p>
      )}
    </div>
  )
}

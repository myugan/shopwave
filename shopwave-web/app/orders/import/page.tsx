'use client'

import { useState, FormEvent, ChangeEvent } from 'react'
import Link from 'next/link'
import { importOrders } from '@/lib/api'

const SAMPLE = `orders:
  - customer_id: merchant@example.com
    items:
      - product_id: prod_001
        name: MechKey Pro 87
        quantity: 2
        unit_price: 129.99
`

export default function OrderImportPage() {
  const [yaml, setYaml] = useState(SAMPLE)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<string | null>(null)

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setYaml(String(reader.result ?? ''))
    reader.readAsText(file)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setResult(null)
    if (!yaml.trim()) {
      setError('Paste or upload YAML before importing.')
      return
    }
    setLoading(true)
    try {
      const data = await importOrders(yaml)
      setResult(JSON.stringify(data, null, 2))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-container py-10 sm:py-14">
      <Link href="/products" className="text-sm text-indigo-600 hover:text-indigo-700">
        ← Back to products
      </Link>
      <p className="mt-6 text-sm font-semibold uppercase tracking-wider text-indigo-600">
        Merchant tools
      </p>
      <h1 className="section-title mt-1">Bulk order import</h1>
      <p className="section-subtitle max-w-2xl">
        Upload a YAML file or paste order data below. Imports are processed by the order service.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 max-w-3xl space-y-6">
        <div>
          <label htmlFor="yaml-file" className="block text-sm font-medium text-slate-700">
            YAML file
          </label>
          <input
            id="yaml-file"
            type="file"
            accept=".yaml,.yml,text/yaml"
            onChange={handleFile}
            className="mt-2 block w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-indigo-700 hover:file:bg-indigo-100"
          />
        </div>

        <div>
          <label htmlFor="yaml-body" className="block text-sm font-medium text-slate-700">
            YAML content
          </label>
          <textarea
            id="yaml-body"
            value={yaml}
            onChange={(e) => setYaml(e.target.value)}
            rows={14}
            spellCheck={false}
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 font-mono text-sm text-slate-800 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
        )}

        {result && (
          <pre className="overflow-x-auto rounded-xl bg-slate-900 px-4 py-3 text-sm text-emerald-300">
            {result}
          </pre>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full sm:w-auto disabled:opacity-60"
        >
          {loading ? 'Importing…' : 'Import orders'}
        </button>
      </form>
    </div>
  )
}

import Anthropic from '@anthropic-ai/sdk'
import { z } from 'zod'
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod'

export const config = {
  maxDuration: 60,
}

// Keep in sync with the account IDs in src/lib/store.jsx
export const ACCOUNT_IDS = [
  'CASH', 'AR', 'INV', 'PREPAID', 'EQUIP', 'AP', 'GST_PAY', 'PST_PAY',
  'REVENUE', 'OTHER_INC', 'COGS', 'COGS_WASTE', 'WAGES', 'RENT', 'UTILITIES',
  'SUPPLIES', 'MARKETING', 'INSURANCE', 'DEPR', 'BANKFEES', 'MISC',
]

const DocumentExtraction = z.object({
  documentType: z.enum([
    'supplier_invoice', 'expense_receipt', 'pos_export',
    'bank_statement', 'capital_asset_invoice', 'payroll_hours', 'other',
  ]),
  vendorName: z.string().nullable(),
  invoiceNumber: z.string().nullable(),
  documentDate: z.string().nullable(),
  dueDate: z.string().nullable(),
  lineItems: z.array(z.object({
    description: z.string(),
    quantity: z.number().nullable(),
    unitPrice: z.number().nullable(),
    total: z.number(),
  })),
  subtotal: z.number().nullable(),
  taxAmount: z.number().nullable(),
  totalAmount: z.number(),
  suggestedAccountId: z.enum(ACCOUNT_IDS),
  suggestedCategory: z.string(),
  confidence: z.number().min(0).max(100),
  summary: z.string(),
  processingSteps: z.array(z.string()),
})

const MAX_BASE64_LENGTH = 6 * 1024 * 1024

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    res.status(500).json({ error: 'ANTHROPIC_API_KEY is not configured on the server.' })
    return
  }

  const { fileName, mimeType, dataBase64 } = req.body || {}
  if (!fileName || !mimeType || !dataBase64) {
    res.status(400).json({ error: 'fileName, mimeType, and dataBase64 are required.' })
    return
  }
  if (dataBase64.length > MAX_BASE64_LENGTH) {
    res.status(413).json({ error: 'File is too large. Please upload files under 4MB.' })
    return
  }

  let contentBlock
  if (mimeType.startsWith('image/')) {
    contentBlock = { type: 'image', source: { type: 'base64', media_type: mimeType, data: dataBase64 } }
  } else if (mimeType === 'application/pdf') {
    contentBlock = { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: dataBase64 } }
  } else if (mimeType === 'text/csv' || mimeType === 'text/plain') {
    contentBlock = { type: 'text', text: Buffer.from(dataBase64, 'base64').toString('utf-8') }
  } else {
    res.status(415).json({ error: `Unsupported file type: ${mimeType}. Upload an image, PDF, or CSV.` })
    return
  }

  const client = new Anthropic({ apiKey })

  try {
    const response = await client.messages.parse({
      model: 'claude-opus-5',
      max_tokens: 16000,
      system: `You are Sida, an AI bookkeeper for a small Canadian business. Read the uploaded business document (supplier invoice, expense receipt, POS daily export, bank statement, capital asset invoice, or payroll hours file) and extract structured accounting data.

Pick suggestedAccountId from this chart of accounts (use the ID exactly as written):
${ACCOUNT_IDS.join(', ')}

Guidance:
- Food/goods suppliers and inventory purchases -> INV. Utilities -> UTILITIES. Rent -> RENT. Insurance -> INSURANCE. Equipment or other capital purchases -> EQUIP. Bank/merchant fees -> BANKFEES. Wages/labour -> WAGES. Sales/POS revenue -> REVENUE. Anything you can't confidently classify -> MISC.
- confidence is 0-100, reflecting how sure you are about documentType, amounts, and account classification. Use under 90 when the document is unclear, handwritten, cropped, or ambiguous.
- processingSteps is a short list (3-6 items) of plain-English steps describing what you did, e.g. "Read document", "Identified vendor: Sysco Foods", "Extracted 3 line items", "Classified as supplier invoice".
- summary is one plain-English sentence describing the document and what it's for, written for a non-accountant business owner.
- All amounts are plain numbers in the document's currency, no currency symbols or commas.
- Dates as YYYY-MM-DD when present in the document, else null.`,
      messages: [
        {
          role: 'user',
          content: [
            contentBlock,
            { type: 'text', text: `Extract structured accounting data from this document: ${fileName}` },
          ],
        },
      ],
      output_config: { format: zodOutputFormat(DocumentExtraction) },
    })

    if (!response.parsed_output) {
      res.status(502).json({ error: 'Claude could not extract structured data from this document.' })
      return
    }

    res.status(200).json({ data: response.parsed_output })
  } catch (err) {
    console.error('parse-document error:', err)
    if (err instanceof Anthropic.AuthenticationError) {
      res.status(500).json({ error: 'Invalid ANTHROPIC_API_KEY — check the Vercel environment variable.' })
      return
    }
    if (err instanceof Anthropic.RateLimitError) {
      res.status(429).json({ error: 'Rate limited by the Claude API — try again shortly.' })
      return
    }
    const status = err instanceof Anthropic.APIError && err.status ? err.status : 500
    res.status(status).json({ error: err?.message || 'Failed to process document.' })
  }
}

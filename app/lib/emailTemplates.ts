export interface IntendedRecipient {
  email: string
  userId?: string
  profileName?: string
}

const BASE_STYLES = `
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  max-width: 600px;
  margin: 0 auto;
  color: #1f2937;
`

const BUTTON_STYLE = `
  display: inline-block;
  background: #4F46E5;
  color: white !important;
  padding: 10px 20px;
  text-decoration: none;
  border-radius: 6px;
  margin-top: 16px;
  font-weight: 600;
`

export function devModeBanner(recipient: IntendedRecipient): string {
  const name = recipient.profileName ?? 'Unknown'
  const email = recipient.email
  const id = recipient.userId ?? 'n/a'
  return `
    <div style="background:#FEF3C7;border:2px solid #F59E0B;border-radius:8px;padding:16px;margin-bottom:20px;">
      <p style="margin:0 0 8px;font-weight:700;color:#92400E;">Development Mode — Intended Recipient</p>
      <p style="margin:0;color:#78350F;font-size:14px;">
        <strong>${escapeHtml(name)}</strong> &lt;${escapeHtml(email)}&gt;<br/>
        Profile ID: <code style="background:#FDE68A;padding:2px 6px;border-radius:4px;">${escapeHtml(id)}</code>
      </p>
      <p style="margin:8px 0 0;font-size:12px;color:#92400E;">This email was redirected. No production recipient received this message.</p>
    </div>
  `
}

export function wrapEmailHtml(
  content: string,
  options?: { intendedRecipient?: IntendedRecipient; showDevBanner?: boolean }
): string {
  const banner =
    options?.showDevBanner && options.intendedRecipient
      ? devModeBanner(options.intendedRecipient)
      : ''

  return `
    <!DOCTYPE html>
    <html>
    <body style="background:#f3f4f6;padding:24px;margin:0;">
      <div style="${BASE_STYLES}">
        <div style="background:white;border-radius:8px;padding:24px;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
          ${banner}
          ${content}
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />
          <p style="font-size:12px;color:#9ca3af;margin:0;">CadetFlow — Military Academy Discipline Management</p>
        </div>
      </div>
    </body>
    </html>
  `
}

export function alertEmail(params: {
  subject: string
  message: string
  linkUrl?: string | null
  siteUrl?: string
}): string {
  const fullLink = params.linkUrl
    ? params.linkUrl.startsWith('http')
      ? params.linkUrl
      : `${params.siteUrl ?? ''}${params.linkUrl}`
    : null

  const bodyHtml = escapeHtml(params.message).replace(/\n/g, '<br/>')

  return wrapEmailHtml(`
    <h2 style="margin:0 0 12px;font-size:20px;color:#111827;">${escapeHtml(params.subject)}</h2>
    <p style="font-size:16px;line-height:1.5;color:#374151;">${bodyHtml}</p>
    ${fullLink ? `<a href="${escapeHtml(fullLink)}" style="${BUTTON_STYLE}">View Details</a>` : ''}
  `)
}

export function digestEmail(params: {
  items: { subject: string; message: string; linkUrl?: string | null }[]
  siteUrl?: string
}): string {
  const itemsHtml = params.items
    .map((item) => {
      const link = item.linkUrl
        ? item.linkUrl.startsWith('http')
          ? item.linkUrl
          : `${params.siteUrl ?? ''}${item.linkUrl}`
        : null
      return `
        <li style="margin-bottom:12px;">
          <strong>${escapeHtml(item.subject)}</strong><br/>
          <span style="color:#4b5563;">${escapeHtml(item.message)}</span>
          ${link ? `<br/><a href="${escapeHtml(link)}" style="color:#4F46E5;font-size:14px;">View</a>` : ''}
        </li>
      `
    })
    .join('')

  return wrapEmailHtml(`
    <h2 style="margin:0 0 16px;font-size:20px;">CadetFlow Digest</h2>
    <p style="color:#6b7280;margin:0 0 16px;">You have ${params.items.length} notification${params.items.length === 1 ? '' : 's'}:</p>
    <ul style="padding-left:20px;margin:0;">${itemsHtml}</ul>
  `)
}

export function greenSheetEmail(htmlContent: string): string {
  return wrapEmailHtml(htmlContent)
}

export function testEmail(body: string): string {
  return wrapEmailHtml(`
    <div style="border:2px dashed #d1d5db;background:#f9fafb;padding:16px;border-radius:8px;">
      <h3 style="color:#6b7280;margin:0 0 12px;">Test Email from CadetFlow</h3>
      <p style="white-space:pre-wrap;margin:0;">${escapeHtml(body)}</p>
    </div>
  `)
}

export function parentInviteEmail(params: { cadetName: string; inviteLink: string }): string {
  return wrapEmailHtml(`
    <h2 style="margin:0 0 12px;">Parent Portal Invitation</h2>
    <p>You have been invited to view updates for <strong>${escapeHtml(params.cadetName)}</strong> on CadetFlow.</p>
    <a href="${escapeHtml(params.inviteLink)}" style="${BUTTON_STYLE}">Accept Invitation</a>
  `)
}

export function parentSummaryEmail(params: { cadetName: string; summaryHtml: string }): string {
  return wrapEmailHtml(`
    <h2 style="margin:0 0 12px;">Cadet Summary: ${escapeHtml(params.cadetName)}</h2>
    ${params.summaryHtml}
  `)
}

export function workOrderEmail(params: { title: string; body: string; linkUrl?: string }): string {
  return alertEmail({ subject: params.title, message: params.body, linkUrl: params.linkUrl })
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

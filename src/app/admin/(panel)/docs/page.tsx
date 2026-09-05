import { AdminPageHeader } from '@/components/admin/hud'

export const metadata = {
  title: 'Docs — Admin',
  robots: { index: false, follow: false },
}

// The operator manual for this panel. Static by design: it documents how the
// admin works, so it changes only when the admin does — update it in the same
// PR as any panel change (same discipline as the repo CLAUDE.md).

function Section({
  id,
  title,
  children,
}: {
  id: string
  title: string
  children: React.ReactNode
}) {
  return (
    <section
      id={id}
      className="admin-hairline rounded-2xl border border-ink-border/80 bg-ink-surface/60 p-5"
    >
      <h2 className="font-mono text-sm uppercase tracking-wider text-accent">{title}</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-ink-text/90">{children}</div>
    </section>
  )
}

function K({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded bg-ink-bg/80 px-1.5 py-0.5 font-mono text-[12px] text-accent">
      {children}
    </code>
  )
}

const TOC = [
  { id: 'signin', label: 'signing in' },
  { id: 'dashboard', label: 'dashboard' },
  { id: 'posts', label: 'posts + the auto-blog' },
  { id: 'media', label: 'media library' },
  { id: 'ops', label: 'ops console' },
  { id: 'settings', label: 'settings + passkeys' },
  { id: 'recovery', label: 'if you are locked out' },
]

export default function AdminDocsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <AdminPageHeader
        path="~/admin/docs"
        title="How this panel works"
        meta="the operator manual · updated with every panel change · September 2026"
      />

      <nav className="flex flex-wrap gap-2">
        {TOC.map((t) => (
          <a
            key={t.id}
            href={`#${t.id}`}
            className="rounded-md border border-ink-border px-3 py-1.5 font-mono text-xs text-ink-muted transition hover:border-accent/40 hover:text-accent"
          >
            {t.label}
          </a>
        ))}
      </nav>

      <Section id="signin" title="signing in">
        <p>
          The fastest path is the <strong>Sign in with a passkey</strong> button on the login
          page: Face ID on the iPhone, Touch ID on the Mac, or 1Password if its browser
          extension holds the passkey. The email + password form below it always works as the
          fallback. The admin account is <K>admin@skomp.studio</K>.
        </p>
        <p>
          Register a new passkey from <K>settings → passkeys</K> while signed in — once per
          device or vault you want to use. Sessions last 30 days.
        </p>
      </Section>

      <Section id="dashboard" title="dashboard">
        <p>
          The overview tiles are live database counts — posts by status, projects, media
          files, registered passkeys. The telemetry panel renders the same snapshot the public
          homepage uses: the home server pushes a sanitized state report every 30 minutes, and
          when a snapshot is missing or older than 24 hours the panel says{' '}
          <K>LINK OFFLINE</K> instead of guessing. An offline link usually just means the
          server or its tunnel is down; it heals on the next push.
        </p>
      </Section>

      <Section id="posts" title="posts + the auto-blog">
        <p>
          Status pills: <span className="text-gold">DRAFT</span> is invisible to the public,{' '}
          <span className="text-accent">PUBLISHED</span> is live on /articles. Saving an edit
          never changes status — publish and unpublish are separate buttons on the posts list,
          so you can rework a live post safely.
        </p>
        <p>
          Drafts arrive two ways: written here by hand, or from the auto-blog lane. The lane
          runs <strong>Sunday and Wednesday mornings</strong> on the home server: it mines the
          last two weeks of real work from the knowledge vault, writes one first-person post,
          runs it through the leak/grounding gate, and inserts it as a DRAFT plus an approval
          card in the phone queue. <strong>Nothing auto-publishes</strong> — approving the
          card is what makes it public. If the lane produces nothing three runs straight, it
          emails an alert rather than staying silently dead.
        </p>
      </Section>

      <Section id="media" title="media library">
        <p>
          Drag files onto the page or use the picker; uploads go to Vercel Blob and get a
          copyable public URL for use in posts and projects. Delete removes both the stored
          file and the database record — it will break anything still referencing that URL, so
          check usage first. PDFs and unreadable files render as labeled tiles, never broken
          images.
        </p>
      </Section>

      <Section id="ops" title="ops console">
        <p>
          The three run buttons are the &quot;bring the site up to date&quot; triggers. Each
          writes an intent the home server picks up <strong>within 5 minutes</strong> and
          executes through the same gated lanes a full working session uses:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <K>kb site sync</K> — diffs the knowledge base against the hardcoded public pages
            (home, architecture, uses). A real change becomes a proposal card in the phone
            queue; approving it opens a PR. No delta means an honest &quot;pages already
            current&quot;.
          </li>
          <li>
            <K>resume refresh</K> — re-checks the resume variants against recent
            accomplishments and proposes a gated diff, again as an approval card, never a
            direct edit.
          </li>
          <li>
            <K>full refresh</K> — the composite truth pass: pushes fresh telemetry, checks
            diagram staleness, then runs the kb sync.
          </li>
        </ul>
        <p>
          Every result is a PR or an approval card — the executor cannot push to main, merge,
          or publish. One run per kind can be in flight at a time; a failed run shows its
          error on the card and is never retried silently.
        </p>
      </Section>

      <Section id="settings" title="settings + passkeys">
        <p>
          The passkeys card lists every registered credential with its label and last-used
          time. Add one per authenticator (name them — &quot;iPhone Face ID&quot;,
          &quot;1Password&quot;) and delete any you no longer recognize. Deleting all
          passkeys is safe: the password fallback always remains.
        </p>
      </Section>

      <Section id="recovery" title="if you are locked out">
        <p>
          Use <strong>Forgot password?</strong> on the login page. A single-use reset link is
          emailed to the admin address within about 5 minutes (the home server drains the
          queue on a timer) and expires after 30 minutes. The mailer only ever sends to the
          two owner addresses, so the form leaks nothing to anyone else.
        </p>
        <p>
          If email is down too, the break-glass path is the server itself:{' '}
          <K>ADMIN_EMAIL=admin@skomp.studio ADMIN_PASSWORD=… npx tsx scripts/seed-admin.ts</K>{' '}
          from the repo root resets the hash directly.
        </p>
      </Section>
    </div>
  )
}

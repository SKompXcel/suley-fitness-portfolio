import Link from 'next/link'

type Item = { id: string; primary: string; secondary: string; visible: boolean }

export function ResumeSectionCard({
  title,
  items,
  newHref,
  baseHref,
}: {
  title: string
  items: Item[]
  newHref: string
  baseHref: string
}) {
  return (
    <div className="admin-hairline rounded-2xl border border-ink-border/80 bg-ink-surface/60 p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-medium text-ink-text">
          {title} <span className="ml-1 text-sm text-ink-muted">· {items.length}</span>
        </h2>
        <Link href={newHref} className="font-mono text-xs text-accent hover:underline">
          + New
        </Link>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-ink-muted">No entries yet. Add one to see it on /resume.</p>
      ) : (
        <ul className="divide-y divide-ink-border/40">
          {items.slice(0, 5).map((item) => (
            <li key={item.id} className="flex items-center justify-between py-2">
              <Link href={`${baseHref}/${item.id}`} className="min-w-0 flex-1 hover:underline">
                <div className="truncate text-sm font-medium text-ink-text">{item.primary}</div>
                <div className="truncate text-xs text-ink-muted">{item.secondary}</div>
              </Link>
              {!item.visible && (
                <span className="ml-3 rounded-full border border-ink-border bg-white/5 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-ink-muted">
                  hidden
                </span>
              )}
            </li>
          ))}
          {items.length > 5 && (
            <li className="pt-2 text-xs text-ink-muted">+ {items.length - 5} more</li>
          )}
        </ul>
      )}
    </div>
  )
}

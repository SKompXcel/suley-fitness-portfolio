// The closed set of on-demand ops triggers /admin/ops can mint. Each kind is
// executed on the home server by its site-ops-executor timer via already-
// sanctioned machinery only, so adding a kind here does nothing until the
// executor's dispatch map sanctions it too.
export const OPS_KINDS = [
  {
    kind: 'kb_site_sync',
    name: 'KB / site sync',
    description:
      'Diff the knowledge base against the public pages and propose updates as a PR',
  },
  {
    kind: 'resume_refresh',
    name: 'Resume refresh',
    description:
      'Re-check the resume variants against recent work and propose a gated update',
  },
  {
    kind: 'full_refresh',
    name: 'Full refresh',
    description:
      'Run the full site truth pass: telemetry, diagrams staleness check, content sync',
  },
] as const

export type OpsKind = (typeof OPS_KINDS)[number]['kind']

export const OPS_KIND_SET: ReadonlySet<string> = new Set(OPS_KINDS.map((k) => k.kind))

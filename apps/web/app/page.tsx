const modes = [
  {
    name: 'Production mode',
    value: 'production',
    description: 'Live admin, customer, or internal apps that serve operational traffic.'
  },
  {
    name: 'Marketing mode',
    value: 'marketing',
    description: 'Landing pages, campaign surfaces, SEO properties, and lead-generation apps.'
  },
  {
    name: 'Automation mode',
    value: 'automation',
    description: 'Worker consoles, cron interfaces, orchestration panels, and automation hubs.'
  }
];

const samplePayload = `{
  "workspaceId": "gem-workspace",
  "apps": [
    {
      "name": "Admin Console",
      "mode": "production",
      "source": "vercel",
      "url": "https://admin.example.com",
      "vercelProjectId": "prj_admin",
      "healthPath": "/api/health"
    },
    {
      "name": "Marketing Site",
      "mode": "marketing",
      "source": "vercel",
      "url": "https://www.example.com",
      "vercelProjectId": "prj_marketing"
    },
    {
      "name": "Automation Hub",
      "mode": "automation",
      "source": "vercel",
      "url": "https://automation.example.com",
      "vercelProjectId": "prj_automation",
      "healthPath": "/api/health"
    }
  ]
}`;

export default function HomePage() {
  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', padding: '4rem', lineHeight: 1.5 }}>
      <p style={{ textTransform: 'uppercase', letterSpacing: '0.12em', fontSize: '0.8rem' }}>
        OpenGuardians
      </p>
      <h1>Workspace app control plane</h1>
      <p style={{ maxWidth: '760px' }}>
        Register completed Vercel or external apps under a workspace, classify them by service mode,
        and expose them to the operating system through a single app registry API.
      </p>

      <section style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', marginTop: '2rem' }}>
        {modes.map((mode) => (
          <article key={mode.value} style={{ border: '1px solid #ddd', borderRadius: '12px', padding: '1rem' }}>
            <h2 style={{ marginTop: 0 }}>{mode.name}</h2>
            <code>{mode.value}</code>
            <p>{mode.description}</p>
          </article>
        ))}
      </section>

      <section style={{ marginTop: '2rem' }}>
        <h2>Bulk import endpoint</h2>
        <p>
          POST completed app records to <code>/api/workspace/apps/bulk</code>. This supports production,
          marketing, and automation apps in one payload.
        </p>
        <pre style={{ overflowX: 'auto', border: '1px solid #ddd', borderRadius: '12px', padding: '1rem' }}>
          <code>{samplePayload}</code>
        </pre>
      </section>
    </main>
  );
}

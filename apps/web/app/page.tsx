import { listWorkspaceApps, type WorkspaceApp } from '../lib/controlPlane.js';

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
] as const;

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

function getAppsForMode(apps: WorkspaceApp[], mode: WorkspaceApp['mode']) {
  return apps.filter((app) => app.mode === mode);
}

export default async function HomePage() {
  const registry = await listWorkspaceApps();

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

      <section style={{ border: '1px solid #ddd', borderRadius: '12px', padding: '1rem', marginTop: '2rem' }}>
        <h2 style={{ marginTop: 0 }}>Workspace registry</h2>
        <p>
          Workspace: <code>{registry.workspaceId}</code>
        </p>
        {registry.error ? <p>{registry.error}</p> : <p>{registry.apps.length} app(s) registered.</p>}
      </section>

      <section style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', marginTop: '2rem' }}>
        {modes.map((mode) => {
          const apps = getAppsForMode(registry.apps, mode.value);

          return (
            <article key={mode.value} style={{ border: '1px solid #ddd', borderRadius: '12px', padding: '1rem' }}>
              <h2 style={{ marginTop: 0 }}>{mode.name}</h2>
              <code>{mode.value}</code>
              <p>{mode.description}</p>
              <p>{apps.length} registered</p>
              {apps.length > 0 ? (
                <ul style={{ paddingLeft: '1.2rem' }}>
                  {apps.map((app) => (
                    <li key={app.id}>
                      <a href={app.url}>{app.name}</a> — {app.status}
                    </li>
                  ))}
                </ul>
              ) : null}
            </article>
          );
        })}
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

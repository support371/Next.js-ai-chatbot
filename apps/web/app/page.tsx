export default function HomePage() {
  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', padding: '4rem', lineHeight: 1.5 }}>
      <p style={{ textTransform: 'uppercase', letterSpacing: '0.12em', fontSize: '0.8rem' }}>
        OpenGuardians
      </p>
      <h1>AI-powered cybersecurity operations dashboard</h1>
      <p>
        The web workspace is now initialized. Connect this dashboard to the API service at
        <code> /api/health </code> and <code> /api/intelligence </code> as the next delivery increment.
      </p>
    </main>
  );
}

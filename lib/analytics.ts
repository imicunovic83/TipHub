export async function trackEvent(name: string, payload: Record<string, unknown> = {}) {
  try {
    await fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, payload, variant: process.env.NEXT_PUBLIC_EXPERIMENT_VARIANT ?? 'A' }),
    });
  } catch (e) {
    // swallow errors — analytics is best-effort
    console.warn('Analytics error', e);
  }
}

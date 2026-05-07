export function isOpenAIQuotaError(error: unknown) {
  const message = error instanceof Error ? error.message.toLowerCase() : '';

  return (
    message.includes('quota') ||
    message.includes('billing') ||
    message.includes('insufficient_quota') ||
    message.includes('rate limit')
  );
}

export function getQuotaErrorResponse() {
  return {
    ok: false,
    error: 'OPENAI_QUOTA_OR_BILLING_LIMIT',
    message:
      'OpenAI authentication appears configured, but usage is blocked by quota, billing, or rate limits.'
  };
}

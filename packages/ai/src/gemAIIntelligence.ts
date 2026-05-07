import { openai } from './modelClient.js';
import { isOpenAIQuotaError, getQuotaErrorResponse } from './quotaGuard.js';

export async function gemAIIntelligence(input: {
  mode: string;
  prompt: string;
}) {
  try {
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are OpenGuardians AI.'
        },
        {
          role: 'user',
          content: input.prompt
        }
      ]
    });

    return {
      ok: true,
      mode: input.mode,
      output: response.choices[0]?.message?.content ?? ''
    };
  } catch (error) {
    if (isOpenAIQuotaError(error)) {
      return getQuotaErrorResponse();
    }

    throw error;
  }
}

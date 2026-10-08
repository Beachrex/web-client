/**
 * AI crawlers (owner decision 2026-10-08, TASK-004): bots that search or answer questions for
 * users may crawl, so Beachrex can appear in AI search answers; bots that collect training data
 * may not.
 */
export const AI_SEARCH_BOTS = [
  'OAI-SearchBot',
  'ChatGPT-User',
  'PerplexityBot',
  'Perplexity-User',
  'Claude-SearchBot',
  'Claude-User',
];

export const AI_TRAINING_BOTS = [
  'GPTBot',
  'ClaudeBot',
  'anthropic-ai',
  'Google-Extended',
  'Applebot-Extended',
  'CCBot',
  'Meta-ExternalAgent',
  'Bytespider',
];

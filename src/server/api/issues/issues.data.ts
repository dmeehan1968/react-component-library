export interface IssueDTO {
  id: string
  title: string
  url: string
  project: string
  description: string
  timestamp: string
  inputTokens: number
  outputTokens: number
  cacheTokens: number
  cost: number
  time: number
  status: 'queued' | 'running' | 'succeeded' | 'failed'
}

// Simple text fixtures keyed by project slug
export const issuesByProject: Record<string, IssueDTO[]> = {
  'react-component-library': [
    {
      id: 'rcl-1',
      title: 'Button focus ring inconsistent',
      url: 'https://github.com/example/react-component-library/issues/1',
      project: 'react-component-library',
      description: 'Focus outline differs in Safari vs Chrome.',
      timestamp: '2025-11-05T09:15:00.000Z',
      inputTokens: 1250,
      outputTokens: 320,
      cacheTokens: 0,
      cost: 0.08,
      time: 42,
      status: 'succeeded',
    },
  ],
  'design-tokens': [
    {
      id: 'dt-1',
      title: 'Token sync script fails on Windows',
      url: 'https://github.com/example/design-tokens/issues/12',
      project: 'design-tokens',
      description: 'Path separators break glob imports.',
      timestamp: '2025-10-20T13:00:00.000Z',
      inputTokens: 800,
      outputTokens: 210,
      cacheTokens: 50,
      cost: 0.05,
      time: 30,
      status: 'running',
    },
  ],
  'docs-site': [],
}

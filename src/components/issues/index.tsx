import * as React from 'react'
import { useParams } from 'react-router-dom'
import { IssuesProvider } from '../../providers/issuesProvider.tsx'
import { IssuesTableView } from '../issues-table'

export const IssuesView: React.FC = () => {
  const { projectId = '' } = useParams<{ projectId: string }>()

  const dataSource = React.useMemo(() => ({
    fetch: (input: RequestInfo | URL, init?: RequestInit) => {
      // ignore input and target our project-specific API endpoint
      return fetch(`/api/projects/${encodeURIComponent(projectId)}/issues`, init)
    },
  }), [projectId])

  return (
    <IssuesProvider dataSource={dataSource}>
      <IssuesTableView/>
    </IssuesProvider>
  )
}

export default IssuesView

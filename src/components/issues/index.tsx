import * as React from 'react'
import { useParams } from 'react-router-dom'
import { IssuesProvider } from '../../providers/issuesProvider.tsx'
import { IssuesTableView } from '../issues-table'

export const IssuesView: React.FC = () => {
  const { projectId = '' } = useParams<{ projectId: string }>()

  return (
    <IssuesProvider projectId={projectId}>
      <IssuesTableView/>
    </IssuesProvider>
  )
}

export default IssuesView

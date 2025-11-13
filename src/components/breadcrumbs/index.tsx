import * as React from 'react'
import { Link, useLocation } from 'react-router-dom'
import clsx from 'clsx'
import { useProjects } from '../../hooks/useProjects.tsx'

export interface BreadcrumbsProps {
  className?: string
}

type Crumb = { label: string; to?: string }

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ className }) => {
  const location = useLocation()
  const ctx = useProjects()

  const crumbs: Crumb[] = React.useMemo(() => {
    // Known routes in this app:
    // 1) "/" → Projects list
    // 2) "/projects/:projectId/issues" → Issues list for project
    const path = location.pathname
    if (path === '/') {
      return [{ label: 'Projects' }]
    }
    const issuesMatch = path.match(/^\/projects\/([^/]+)\/issues$/)
    if (issuesMatch) {
      const pid = issuesMatch[1]
      let label = decodeURIComponent(pid)
      const match = ctx.projects?.find((p) => p.url.includes(`/${pid}/issues`))
      if (match) label = match.name
      // On issues table route, show only: Projects (link) > Project Name (current, non-link)
      return [
        { label: 'Projects', to: '/' },
        { label },
      ]
    }
    // Fallback: split segments and build generic crumbs
    const segments = path.replace(/^\/+|\/+$/g, '').split('/')
    const acc: Crumb[] = []
    let to = ''
    for (let i = 0; i < segments.length; i++) {
      to += `/${segments[i]}`
      acc.push({ label: decodeURIComponent(segments[i]), to })
    }
    if (acc.length) delete acc[acc.length - 1].to // last is current
    return acc
  }, [location.pathname, ctx])

  if (!crumbs.length) return null

  return (
    <nav aria-label="Breadcrumb" className={clsx('text-sm breadcrumbs', className)}>
      <ul>
        {crumbs.map((c, idx) => (
          <li key={`${c.label}-${idx}`}>
            {c.to ? (
              <Link className="link link-hover" to={c.to}>
                {c.label}
              </Link>
            ) : (
              <span className="text-accent hover:no-underline" aria-current="page">
                {c.label}
              </span>
            )}
          </li>
        ))}
      </ul>
    </nav>
  )
}

export default Breadcrumbs

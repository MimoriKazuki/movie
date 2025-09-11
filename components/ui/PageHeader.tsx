import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface PageHeaderProps {
  title: string
  description?: string
  actions?: ReactNode
  breadcrumb?: Array<{
    label: string
    href?: string
  }>
  className?: string
  variant?: 'fancy' | 'simple'
}

export function PageHeader({
  title,
  description,
  actions,
  breadcrumb,
  className = '',
  variant = 'fancy'
}: PageHeaderProps) {
  return (
    <div className={cn('mb-8', className)}>
      {breadcrumb && breadcrumb.length > 0 && (
        <nav className="flex mb-4" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            {breadcrumb.map((item, index) => (
              <li key={index} className="inline-flex items-center">
                {index > 0 && (
                  <svg className="w-3 h-3 text-gray-400 mx-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                )}
                {item.href ? (
                  <a href={item.href} className="text-sm font-medium text-gray-700 hover:text-blue-600">
                    {item.label}
                  </a>
                ) : (
                  <span className="text-sm font-medium text-gray-500">
                    {item.label}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}
      {variant === 'fancy' ? (
        <div className="relative overflow-hidden rounded-2xl border border-gray-200/60 bg-white/80 backdrop-blur-xl">
          <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600" />
          <div className="px-5 py-6 sm:px-6 sm:py-7 flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                {title}
              </h1>
              {description && (
                <p className="mt-2 text-sm text-gray-600">{description}</p>
              )}
            </div>
            {actions && (
              <div className="mt-4 sm:mt-0 flex gap-3">
                {actions}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
            {description && (
              <p className="mt-2 text-sm text-gray-600">{description}</p>
            )}
          </div>
          {actions && (
            <div className="mt-4 sm:mt-0 flex gap-3">
              {actions}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

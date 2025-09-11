import { cn } from '@/lib/utils'
import { formatPriceJPY } from '@/lib/format'

interface PriceRowProps {
  price?: number | null
  freeLabel?: string
  leftLabel?: string
  className?: string
}

export function PriceRow({ price, freeLabel = '無料', leftLabel, className = '' }: PriceRowProps) {
  const isFree = !price || price === 0
  return (
    <div className={cn('border-t border-gray-100 px-4 py-3 bg-gray-50', className)}>
      {isFree ? (
        <div className="text-center">
          <span className="text-sm font-medium text-green-600">{freeLabel}</span>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          {leftLabel ? (
            <span className="text-sm text-gray-600">{leftLabel}</span>
          ) : <span />}
          <span className="text-lg font-bold text-gray-900">{formatPriceJPY(price)}</span>
        </div>
      )}
    </div>
  )
}


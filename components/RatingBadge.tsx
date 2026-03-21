interface RatingBadgeProps {
  rating: number
  className?: string
}

export function RatingBadge({ rating, className = '' }: RatingBadgeProps) {
  const color =
    rating >= 7.0 ? 'bg-green-500 text-black' :
    rating >= 5.0 ? 'bg-yellow-500 text-black' :
    'bg-red-500 text-white'

  return (
    <span className={`${color} text-xs font-bold px-1.5 py-0.5 rounded ${className}`}>
      {rating.toFixed(1)}
    </span>
  )
}

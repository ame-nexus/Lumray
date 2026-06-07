export function tmdbPoster(path: string, size: 'w185' | 'w300' | 'w500' = 'w300'): string {
  if (path.startsWith('http')) return path
  return `https://image.tmdb.org/t/p/${size}${path}`
}

export function nameInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export interface Provider {
  name: string
  baseUrl: string
  moviePattern: string
  tvPattern: string
  params: string
}

export const PROVIDERS: Provider[] = [
  {
    name: "Vidking",
    baseUrl: "https://www.vidking.net",
    moviePattern: "/embed/movie/{id}",
    tvPattern: "/embed/tv/{id}/{season}/{episode}",
    params: "?autoPlay=true&nextEpisode=true&episodeSelector=true&color=e50914"
  },
  {
    name: "VidSrc",
    baseUrl: "https://vidsrc.cc/v2",
    moviePattern: "/embed/movie/{id}",
    tvPattern: "/embed/tv/{id}/{season}/{episode}",
    params: ""
  },
  {
    name: "VidSrc ICU",
    baseUrl: "https://vidsrc.icu",
    moviePattern: "/embed/movie/{id}",
    tvPattern: "/embed/tv/{id}/{season}/{episode}",
    params: ""
  }
]

export function buildEmbedUrl(provider: Provider, type: 'movie' | 'tv', id: number, season?: number, episode?: number): string {
  const pattern = type === 'movie' ? provider.moviePattern : provider.tvPattern
  const path = pattern
    .replace('{id}', String(id))
    .replace('{season}', String(season ?? 1))
    .replace('{episode}', String(episode ?? 1))
  return `${provider.baseUrl}${path}${provider.params}`
}

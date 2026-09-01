import Image from "next/image"
import { notFound } from "next/navigation"
import { getNewsBySlug, getRelatedPublishedNews } from "@/lib/frontend-news"
import { getRequestLocale } from "@/lib/request-locale"
import { getTranslations } from "@/lib/i18n"
import type { Metadata } from "next"
import { LocalizedLink } from "@/components/localized-link"

export const dynamic = "force-dynamic"

interface NewsDetailPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: NewsDetailPageProps): Promise<Metadata> {
  const [{ slug }, locale] = await Promise.all([params, getRequestLocale()])
  const article = await getNewsBySlug(slug, locale)
  if (!article) return {}
  return {
    title: article.title,
    description: article.excerpt ?? article.title,
    openGraph: {
      type: 'article',
      title: article.title,
      description: article.excerpt ?? article.title,
      images: article.featured_image ? [article.featured_image] : undefined,
    },
  }
}

export default async function NewsDetailPage({ params }: NewsDetailPageProps) {
  const { slug } = await params
  const locale = await getRequestLocale()
  const t = getTranslations(locale)
  const article = await getNewsBySlug(slug, locale)

  if (!article) {
    notFound()
  }

  const related = await getRelatedPublishedNews(article.id, 6, locale)

  return (
    <div className="bg-background py-14 md:py-20">
      <div className="container mx-auto max-w-6xl px-4 lg:px-8">
        <LocalizedLink href="/news" className="mb-6 inline-block text-sm font-semibold text-accent hover:text-accent/80">
          &larr; {t.news.back}
        </LocalizedLink>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start">
          <article className="min-w-0 max-w-4xl lg:max-w-none">
            <h1 className="text-3xl font-bold text-foreground md:text-4xl">{article.title}</h1>
            <p className="mt-3 text-sm text-muted-foreground">
              {new Date(article.published_at ?? article.created_at).toLocaleDateString(locale)}
            </p>

            {article.featured_image ? (
              <div className="relative mt-8 h-64 w-full overflow-hidden rounded-2xl md:h-96">
                <Image src={article.featured_image} alt={article.title} fill className="object-cover" unoptimized />
              </div>
            ) : null}

            <div
              className="news-content mt-8"
              dangerouslySetInnerHTML={{ __html: article.content || `<p>${t.news.noContent}</p>` }}
            />
          </article>

          <aside className="lg:sticky lg:top-24">
            <div className="rounded-2xl border bg-card p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-foreground">{t.news.related}</h2>
              {related.length === 0 ? (
                <p className="mt-3 text-sm text-muted-foreground">{t.news.noRelated}</p>
              ) : (
                <ul className="mt-4 space-y-4">
                  {related.map((item) => (
                    <li key={item.id}>
                      <LocalizedLink href={`/news/${item.slug}`} className="group flex gap-3">
                        {item.featured_image ? (
                          <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-muted">
                            <Image
                              src={item.featured_image}
                              alt=""
                              fill
                              className="object-cover transition-transform group-hover:scale-105"
                              sizes="96px"
                              unoptimized
                            />
                          </div>
                        ) : (
                          <div className="h-16 w-24 shrink-0 rounded-lg bg-muted" />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-2 text-sm font-medium leading-snug text-foreground group-hover:text-accent">
                            {item.title}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {new Date(item.published_at ?? item.created_at).toLocaleDateString(locale)}
                          </p>
                        </div>
                      </LocalizedLink>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

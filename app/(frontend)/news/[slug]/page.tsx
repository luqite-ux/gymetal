import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { getNewsBySlug, getRelatedPublishedNews } from "@/lib/frontend-news"

export const dynamic = "force-dynamic"

interface NewsDetailPageProps {
  params: Promise<{ slug: string }>
}

export default async function NewsDetailPage({ params }: NewsDetailPageProps) {
  const { slug } = await params
  const article = await getNewsBySlug(slug)

  if (!article) {
    notFound()
  }

  const related = await getRelatedPublishedNews(article.id, 6)

  return (
    <div className="bg-background py-14 md:py-20">
      <div className="container mx-auto max-w-6xl px-4 lg:px-8">
        <Link href="/news" className="mb-6 inline-block text-sm font-semibold text-accent hover:text-accent/80">
          &larr; Back to News
        </Link>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start">
          <article className="min-w-0 max-w-4xl lg:max-w-none">
            <h1 className="text-3xl font-bold text-foreground md:text-4xl">{article.title}</h1>
            <p className="mt-3 text-sm text-muted-foreground">
              {new Date(article.published_at ?? article.created_at).toLocaleDateString("en-US")}
            </p>

            {article.featured_image ? (
              <div className="relative mt-8 h-64 w-full overflow-hidden rounded-2xl md:h-96">
                <Image src={article.featured_image} alt={article.title} fill className="object-cover" unoptimized />
              </div>
            ) : null}

            <div
              className="news-content mt-8"
              dangerouslySetInnerHTML={{ __html: article.content || "<p>No content.</p>" }}
            />
          </article>

          <aside className="lg:sticky lg:top-24">
            <div className="rounded-2xl border bg-card p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-foreground">相关文章</h2>
              {related.length === 0 ? (
                <p className="mt-3 text-sm text-muted-foreground">暂无其他已发布文章。</p>
              ) : (
                <ul className="mt-4 space-y-4">
                  {related.map((item) => (
                    <li key={item.id}>
                      <Link href={`/news/${item.slug}`} className="group flex gap-3">
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
                            {new Date(item.published_at ?? item.created_at).toLocaleDateString("zh-CN")}
                          </p>
                        </div>
                      </Link>
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

import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { getPublishedNews } from "@/lib/frontend-news"

export const dynamic = "force-dynamic"

export default async function NewsPage() {
  const articles = await getPublishedNews()

  return (
    <div className="bg-background py-16 md:py-20">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="mb-10 text-center">
          <p className="mb-2 text-sm font-medium uppercase tracking-widest text-accent">Latest Updates</p>
          <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl">News</h1>
        </div>

        {articles.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card px-6 py-14 text-center">
            <p className="text-lg font-medium text-foreground">No published news yet.</p>
            <p className="mt-2 text-muted-foreground">Create and publish articles from the admin panel.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {articles.map((article) => (
              <Link
                key={article.id}
                href={`/news/${article.slug}`}
                aria-label={article.title}
                className="group block overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:border-accent/40 hover:shadow-lg focus-visible:-translate-y-1 focus-visible:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <article>
                  {article.featured_image ? (
                    <div className="relative h-48 w-full overflow-hidden">
                      <Image
                        src={article.featured_image}
                        alt={article.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        unoptimized
                      />
                    </div>
                  ) : null}

                  <div className="space-y-3 p-5">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      {new Date(article.published_at ?? article.created_at).toLocaleDateString("en-US")}
                    </p>
                    <h2 className="line-clamp-2 text-xl font-semibold text-foreground transition-colors group-hover:text-accent">
                      {article.title}
                    </h2>
                    <p className="line-clamp-3 text-sm text-muted-foreground">
                      {article.excerpt || "Read more details in this update."}
                    </p>
                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-accent">
                      Read more
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

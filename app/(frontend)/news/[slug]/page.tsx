import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { getNewsBySlug } from "@/lib/frontend-news"

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

  return (
    <div className="bg-background py-14 md:py-20">
      <article className="container mx-auto max-w-4xl px-4 lg:px-8">
        <Link href="/news" className="mb-6 inline-block text-sm font-semibold text-accent hover:text-accent/80">
          &larr; Back to News
        </Link>

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
    </div>
  )
}

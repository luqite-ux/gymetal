import { ArticleForm } from "../article-form"

export default function NewArticlePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">新建文章</h1>
        <p className="text-muted-foreground">创作一篇新文章</p>
      </div>

      <ArticleForm />
    </div>
  )
}

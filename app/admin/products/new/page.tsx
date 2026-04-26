import { ProductForm } from "../product-form"

export default function NewProductPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">添加产品</h1>
        <p className="text-muted-foreground">创建一个新产品</p>
      </div>

      <ProductForm />
    </div>
  )
}

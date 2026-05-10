import { getProduct } from "@/actions/products";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { IconArrowLeft, IconBox, IconEdit } from "@tabler/icons-react";
import { StockAdjuster } from "./stock-adjuster";
import { StatusControl } from "./status-control";

export const dynamic = "force-dynamic";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) notFound();

  // Build variant label from its option maps
  const variantLabel = (v: (typeof product.variants)[number]) => {
    const parts = v.optionMaps.map((om) => om.option.value);
    return parts.length > 0 ? parts.join(" / ") : "Default";
  };

  const totalStock = product.variants.reduce((s, v) => s + v.stockQty, 0);
  const lowStockThreshold =
    product.variants[0]?.lowStockThreshold ?? product.lowStockThreshold;

  let stockColor = "text-text-primary";
  if (totalStock === 0) stockColor = "text-[#A32D2D]";
  else if (totalStock <= lowStockThreshold) stockColor = "text-[#854F0B]";

  return (
    <div className="p-[24px] md:p-[32px] w-full max-w-[1200px] mx-auto flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/products"
            className="flex items-center gap-1.5 text-[12px] text-text-secondary hover:text-text-primary transition-colors"
          >
            <IconArrowLeft size={14} stroke={1.5} aria-hidden="true" />
            Products
          </Link>
          <span className="text-border-strong text-[12px]">/</span>
          <span className="text-[12px] text-text-primary truncate max-w-[260px]">
            {product.name}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/products/${product.id}/edit`}
            className="flex items-center gap-[6px] px-[12px] h-[32px] bg-cta-bg text-cta-text rounded-[7px] text-[12px] font-medium hover:bg-cta-hover active:scale-[0.99] transition-all"
          >
            <IconEdit size={14} aria-hidden="true" />
            Edit Product
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN — Images + Variants */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Images */}
          <div className="bg-bg-primary border border-border-default rounded-[10px] overflow-hidden">
            <div className="flex items-center justify-between p-[14px] px-[20px] border-b border-border-default">
              <h2 className="text-[13px] font-medium text-text-primary">
                Images
              </h2>
            </div>
            <div className="p-[20px]">
              {product.images.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[120px] border border-dashed border-border-strong rounded-[8px] bg-bg-secondary gap-2">
                  <IconBox size={22} stroke={1.5} className="text-text-muted" aria-hidden="true" />
                  <span className="text-[12px] text-text-muted">
                    No images uploaded
                  </span>
                </div>
              ) : (
                <div className="flex flex-wrap gap-3">
                  {product.images.map((img, idx) => (
                    <div
                      key={img.id}
                      className="relative w-[100px] h-[100px] rounded-[8px] border border-border-default overflow-hidden bg-bg-secondary"
                    >
                      <Image
                        src={img.url}
                        alt={`${product.name} image ${idx + 1}`}
                        fill
                        className="object-cover"
                      />
                      {idx === 0 && (
                        <span className="absolute bottom-1 left-1 text-[10px] font-mono bg-bg-primary/90 text-text-secondary px-1.5 py-0.5 rounded-[3px]">
                          Cover
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Variants & Stock */}
          <div className="bg-bg-primary border border-border-default rounded-[10px] overflow-hidden">
            <div className="flex items-center justify-between p-[14px] px-[20px] border-b border-border-default">
              <h2 className="text-[13px] font-medium text-text-primary">
                Variants & Stock
              </h2>
              <span className={`font-mono text-[12px] ${stockColor}`}>
                {totalStock === 0
                  ? "Out of stock"
                  : totalStock <= lowStockThreshold
                  ? `Low stock (${totalStock} total)`
                  : `${totalStock} in stock`}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="bg-bg-tertiary border-b border-border-default">
                    <th className="font-normal text-[11px] text-text-muted px-[20px] py-[8px]">
                      Variant
                    </th>
                    <th className="font-normal text-[11px] text-text-muted px-[20px] py-[8px]">
                      SKU
                    </th>
                    <th className="font-normal text-[11px] text-text-muted px-[20px] py-[8px] text-right">
                      Price
                    </th>
                    <th className="font-normal text-[11px] text-text-muted px-[20px] py-[8px] text-right">
                      Stock
                    </th>
                    <th className="font-normal text-[11px] text-text-muted px-[20px] py-[8px] text-right">
                      Adjust
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {product.variants.map((v) => {
                    const price = v.priceOverride ?? product.basePrice;
                    let rowStockColor = "text-text-primary";
                    if (v.stockQty === 0)
                      rowStockColor = "text-[#A32D2D]";
                    else if (v.stockQty <= v.lowStockThreshold)
                      rowStockColor = "text-[#854F0B]";

                    return (
                      <tr
                        key={v.id}
                        className="border-b border-border-subtle last:border-b-0 hover:bg-bg-tertiary transition-colors"
                      >
                        <td className="px-[20px] py-[10px] text-[12px] text-text-primary font-medium">
                          {variantLabel(v)}
                          {!v.isActive && (
                            <span className="ml-2 text-[10px] font-mono text-text-muted bg-bg-subtle px-1.5 py-0.5 rounded-[3px]">
                              Disabled
                            </span>
                          )}
                        </td>
                        <td className="px-[20px] py-[10px] font-mono text-[11px] text-text-secondary">
                          {v.sku}
                        </td>
                        <td className="px-[20px] py-[10px] font-mono text-[12px] text-text-primary text-right">
                          ₵{price.toLocaleString()}
                        </td>
                        <td
                          className={`px-[20px] py-[10px] font-mono text-[12px] text-right ${rowStockColor}`}
                        >
                          {v.stockQty}
                        </td>
                        <td className="px-[20px] py-[10px] text-right">
                          <StockAdjuster
                            variantId={v.id}
                            currentQty={v.stockQty}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN — Info + Status */}
        <div className="flex flex-col gap-4">
          {/* Status Control */}
          <div className="bg-bg-primary border border-border-default rounded-[10px] overflow-hidden">
            <div className="flex items-center justify-between p-[14px] px-[20px] border-b border-border-default">
              <h2 className="text-[13px] font-medium text-text-primary">
                Status
              </h2>
            </div>
            <div className="p-[20px]">
              <StatusControl productId={product.id} currentStatus={product.status} />
            </div>
          </div>

          {/* Product Info */}
          <div className="bg-bg-primary border border-border-default rounded-[10px] overflow-hidden">
            <div className="flex items-center justify-between p-[14px] px-[20px] border-b border-border-default">
              <h2 className="text-[13px] font-medium text-text-primary">
                Product Info
              </h2>
            </div>
            <div className="p-[20px] flex flex-col gap-4">
              <div>
                <p className="text-[11px] font-mono uppercase text-text-muted tracking-[0.06em] border-b border-border-subtle pb-2 mb-2">
                  Name
                </p>
                <p className="text-[13px] text-text-primary font-medium">
                  {product.name}
                </p>
              </div>

              <div>
                <p className="text-[11px] font-mono uppercase text-text-muted tracking-[0.06em] border-b border-border-subtle pb-2 mb-2">
                  Category
                </p>
                <p className="text-[12px] text-text-secondary">
                  {product.category.name}
                </p>
              </div>

              <div>
                <p className="text-[11px] font-mono uppercase text-text-muted tracking-[0.06em] border-b border-border-subtle pb-2 mb-2">
                  Base Price
                </p>
                <p className="font-mono text-[13px] text-text-primary">
                  ₵{product.basePrice.toLocaleString()}
                </p>
              </div>

              {product.description && (
                <div>
                  <p className="text-[11px] font-mono uppercase text-text-muted tracking-[0.06em] border-b border-border-subtle pb-2 mb-2">
                    Description
                  </p>
                  <p className="text-[12px] text-text-secondary leading-relaxed whitespace-pre-wrap">
                    {product.description}
                  </p>
                </div>
              )}

              <div>
                <p className="text-[11px] font-mono uppercase text-text-muted tracking-[0.06em] border-b border-border-subtle pb-2 mb-2">
                  Date Added
                </p>
                <p className="font-mono text-[11px] text-text-muted">
                  {product.createdAt.toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Attributes */}
          {product.attributes.length > 0 && (
            <div className="bg-bg-primary border border-border-default rounded-[10px] overflow-hidden">
              <div className="flex items-center justify-between p-[14px] px-[20px] border-b border-border-default">
                <h2 className="text-[13px] font-medium text-text-primary">
                  Attributes
                </h2>
              </div>
              <div className="p-[20px] flex flex-col gap-3">
                {product.attributes.map((attr) => (
                  <div key={attr.id}>
                    <p className="text-[11px] font-mono uppercase text-text-muted tracking-[0.06em] mb-1.5">
                      {attr.name}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {attr.options.map((opt) => (
                        <span
                          key={opt.id}
                          className="inline-flex px-[8px] py-[3px] rounded-[4px] text-[11px] font-mono bg-bg-subtle text-text-secondary"
                        >
                          {opt.value}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

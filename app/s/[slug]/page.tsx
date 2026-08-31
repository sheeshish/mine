import StorefrontPreview from "@/components/StorefrontPreview";

export default async function StorePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <StorefrontPreview slug={slug} />;
}

import Popular from '@/components/Popular';

export default async function PopularCategoryPage({ params }) {
  const { category } = await params;
  
  return <Popular category={category} />;
}

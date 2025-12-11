'use client';

import { useParams, useRouter } from 'next/navigation';
import Library from '@/components/Library';
import { useEffect } from 'react';

export default function LibraryCategoryPage() {
  const params = useParams();
  const category = params.category;

  return <Library initialCategory={category} />;
}

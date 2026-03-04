import { redirect } from 'next/navigation';

export const runtime = 'edge';

const defaultSlugs = {
  category: 'technology',
  technology: 'react',
  topic: 'finance',
} as const;

type DirectoryType = keyof typeof defaultSlugs;

const normalizeDirectoryType = (type: string): DirectoryType => (
  type in defaultSlugs ? (type as DirectoryType) : 'category'
);

type DirectoryTypePageProps = {
  params: Promise<{ type: string }>;
};

export default async function DirectoryTypePage({ params }: DirectoryTypePageProps) {
  const { type } = await params;
  const normalizedType = normalizeDirectoryType(type);
  const defaultSlug = defaultSlugs[normalizedType];

  redirect(`/directory/${normalizedType}/${defaultSlug}`);
}

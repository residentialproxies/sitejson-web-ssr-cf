import { redirect } from 'next/navigation';

export const runtime = 'edge';

export default function DirectoryIndexPage() {
  redirect('/directory/category/technology');
}

import { cache } from 'react';
import { revalidatePath } from 'next/cache';

const getEpubUrl = cache(async () => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/getEpubUrl`);
  if (!res.ok) return null;
  return res.json();
});

export default async function Home() {
  const epubUrl = await getEpubUrl();

  async function handleSubmit(formData: FormData) {
    'use server';
    debugger;
    
    const repoUrl = formData.get('repoUrl') as string;
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ repoUrl }),
    }).catch(err => {
      console.error(err);
      return null;
    });
    
    revalidatePath('/');
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1 className="text-4xl font-bold">将GitHub仓库转换为EPUB</h1>
      
      <form action={handleSubmit} className="mt-8 flex gap-2">
        <input
          type="text"
          name="repoUrl"
          placeholder="GitHub 仓库地址"
          className="rounded border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <button
          type="submit"
          className="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          转换
        </button>
      </form>
      
      {epubUrl && (
        <a href={epubUrl} className="mt-8 text-blue-500 hover:underline" download>
          下载EPUB
        </a>
      )}
    </main>
  );
}
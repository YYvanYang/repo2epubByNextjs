import { NextResponse } from 'next/server';
import epubGen from 'epub-gen';
import { remark } from 'remark';
import html from 'remark-html';
import prism from 'remark-prism';
import { Octokit } from '@octokit/core';

export async function POST(request: Request) {
  const { repoUrl } = await request.json();
  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
  const [_, owner, repo] = repoUrl.replace(/^https?:\/\/github.com\//, '').split('/');
  
  const { data: files } = await octokit.request('GET /repos/{owner}/{repo}/contents', {
    owner,
    repo,
  });
  
  const processedFiles = await Promise.all(
    files.map(async (file: any) => {
      if (file.type === 'file' && file.path.endsWith('.md')) {
        const { data: content } = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
          owner,
          repo,
          path: file.path,
        });
        
        const decodedContent = Buffer.from(content.content, 'base64').toString();
        const processedContent = await remark()
          .use(html)
          .use(prism)
          .process(decodedContent);
        
        return {
          title: file.name,
          data: processedContent.toString(),
        };
      }
    })
  );

  const options = {
    title: `${owner}/${repo}`,
    author: owner,
    content: processedFiles.filter(Boolean),
  };
  
  const outputPath = `public/${owner}_${repo}.epub`;
  await epubGen(options, outputPath);

  const epubUrl = `/${outputPath.replace('public/', '')}`;
  return NextResponse.json({ epubUrl });
}
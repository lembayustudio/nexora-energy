import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const pages = ['index.html', 'about/index.html', 'services/index.html', 'projects/index.html', 'events/index.html', 'contact/index.html'];
for (const page of pages) {
  const file=join('dist',page);
  if (!existsSync(file)) throw new Error(`Missing output: ${file}`);
  const html=readFileSync(file,'utf8');
  if (!html.includes('<main id="main">') || !html.includes('NEXORA')) throw new Error(`Invalid page structure: ${file}`);
  console.log(`✓ ${page}`);
}
console.log('Static output smoke tests passed.');

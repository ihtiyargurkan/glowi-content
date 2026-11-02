import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'path';
const ID = process.env.COMP || 'GlowiReel';
const frames = process.argv.slice(2).map(Number);
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
import fs from 'fs';
const findChrome = () => {
  if (process.env.CHROME) return process.env.CHROME;
  const base = '/opt/pw-browsers';
  if (!fs.existsSync(base)) return undefined;
  for (const d of fs.readdirSync(base).filter((x) => x.startsWith('chromium')).sort().reverse())
    for (const sub of ['chrome-linux64', 'chrome-linux']) { const p = `${base}/${d}/${sub}/chrome`; if (fs.existsSync(p)) return p; }
  return undefined;
};
const browserExecutable = findChrome();
const composition = await selectComposition({serveUrl, id: ID, browserExecutable});
for (const f of frames) {
  await renderStill({serveUrl, composition, frame: f, output: `out/stills/f${f}.jpg`, imageFormat: 'jpeg', jpegQuality: 70, scale: 0.5, browserExecutable});
  console.log('done', f);
}

import data from './timeline.json';

export type Word = {text: string; start: number; end: number; key: boolean; s: number; line: number};
export const words: Word[] = data.words as Word[];
export const voEnd: number = data.voEnd;
export const sentences: {start: number; end: number}[] = data.sentences;

const norm = (x: string) => x.toLowerCase().replace(/[^a-z0-9%]/g, '');

// start time (s) of the n-th occurrence of a caption word (optionally inside sentence s)
export const cue = (text: string, sentence?: number, n = 0): number => {
  const t = norm(text);
  const hits = words.filter((w) => norm(w.text) === t && (sentence === undefined || w.s === sentence));
  if (!hits[n]) throw new Error(`cue not found: ${text} s=${sentence}`);
  return hits[n].start;
};
export const S = (i: number) => sentences[i].start;
export const SE = (i: number) => sentences[i].end;

export const cueAny = (texts: string[], sentence?: number): number => {
  for (const t of texts) {
    try {
      return cue(t, sentence);
    } catch (e) {}
  }
  throw new Error('cueAny not found: ' + texts.join('/'));
};

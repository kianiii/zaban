import { mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

const data = JSON.parse(readFileSync(join(process.cwd(), "data/learnables.json"), "utf8"));
const dir = join(process.cwd(), "public/content");
mkdirSync(dir, { recursive: true });

const meta = {};
for (const [id, item] of Object.entries(data.byId)) {
  writeFileSync(join(dir, `${id}.json`), JSON.stringify(item), "utf8");
  meta[id] = {
    focus: item.focus,
    source: item.source,
    sentences: item.sentences.length,
    words: item.words.length,
    proverb: item.proverb.length,
    conversation: item.conversation.length,
  };
}
writeFileSync(join(process.cwd(), "data/lesson-meta.json"), JSON.stringify(meta), "utf8");
console.log("wrote", Object.keys(meta).length, "content files");

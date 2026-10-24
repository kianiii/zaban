import { readdirSync, readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

const root = process.argv.slice(2).find((arg) => arg && arg !== "--");
if (!root) {
  console.error("pass course root");
  process.exit(1);
}

const lessons = JSON.parse(readFileSync(join(process.cwd(), "data/lessons.json"), "utf8"));

const books = [
  { dir: "1-Everyday Conversations", match: "Everyday", source: "مکالمه میرزایی مقدماتی" },
  { dir: "2-Advance 1", match: "Advance 1", source: "مکالمه میرزایی پیشرفته ۱" },
  { dir: "3-Advance 2", match: "Advance 2", source: "مکالمه میرزایی پیشرفته ۲" },
];

const sessionFa = {
  "1-Greeting": "جلسه اول · احوالپرسی",
  "2-Using look + adj": "جلسه دوم · توصیف ظاهر با look + صفت",
  "3-Would like": "جلسه سوم · درخواست مؤدبانه با would like و there is/are",
  "4-Could you, Shall I": "جلسه چهارم · درخواست، پیشنهاد و توانایی با could / shall / can",
  "5-Have-has got": "جلسه پنجم · مالکیت با have/has got",
  "6-What have you got": "جلسه ششم · پرسیدن و گفتن دارایی",
  "7-Present continuous": "جلسه هفتم · حال استمراری",
  "8-Definite future": "جلسه هشتم · آینده قطعی",
  "9-Indefinite future": "جلسه نهم · آینده غیرقطعی / going to",
  "10-Simple present sentences  I": "جلسه دهم · حال ساده ۱",
  "11-Simple present sentences  II": "جلسه یازدهم · حال ساده ۲",
  "12-Simple present vs. definite future": "جلسه دوازدهم · حال ساده در برابر آینده قطعی",
  "13-Was & Were": "جلسه سیزدهم · گذشته to be",
  "14-Simple past sentences": "جلسه چهاردهم · گذشته ساده",
  "15-Past continuous sentences": "جلسه پانزدهم · گذشته استمراری",
  "16-Passive sentences": "جلسه شانزدهم · جملات مجهول",
  "17-Present perfect sentences": "جلسه هفدهم · حال کامل",
  "18-The Sing of present perfect": "جلسه هجدهم · نشانه‌های حال کامل (just / already / never)",
  "1-Initiating a Conversation": "پیشرفته ۱ · جلسه اول · شروع مکالمه و معرفی",
  "2-to be about to (almost did)": "پیشرفته ۱ · جلسه دوم · almost / be about to",
  "3-Should-have to": "پیشرفته ۱ · جلسه سوم · should و have to",
  "4-I gotta go": "پیشرفته ۱ · جلسه چهارم · خداحافظی و gotta go",
  "5-Have been done": "پیشرفته ۱ · جلسه پنجم · مجهول حال کامل",
  "6-Have you heard the news": "پیشرفته ۱ · جلسه ششم · خبر دادن",
  "7-Wh in the middle of the sentence": "پیشرفته ۱ · جلسه هفتم · سؤال‌واژه وسط جمله",
  "8-See-Hear someone do-doing": "پیشرفته ۱ · جلسه هشتم · see/hear someone do/doing",
  "9-Future in past": "پیشرفته ۱ · جلسه نهم · آینده در گذشته",
  "10-Neutrality sentences": "پیشرفته ۱ · جلسه دهم · جملات بی‌طرف",
  "11-Do you mind if I …": "پیشرفته ۱ · جلسه یازدهم · Do you mind if I",
  "12-to be always doing": "پیشرفته ۱ · جلسه دوازدهم · be always doing",
  "13-Can I count on you": "پیشرفته ۱ · جلسه سیزدهم · حساب کردن روی کسی",
  "14-to be supposed to": "پیشرفته ۱ · جلسه چهاردهم · be supposed to",
  "15-remember to do-doing": "پیشرفته ۱ · جلسه پانزدهم · remember to do / doing",
  "16-Do you by any chance": "پیشرفته ۱ · جلسه شانزدهم · Do you by any chance",
  "1-Offering help; Part 1": "پیشرفته ۲ · جلسه اول · پیشنهاد کمک ۱",
  "2-Offering help; Part 2": "پیشرفته ۲ · جلسه دوم · پیشنهاد کمک ۲",
  "3-Offering help; Part 3": "پیشرفته ۲ · جلسه سوم · پیشنهاد کمک ۳",
  "4-Appreciation": "پیشرفته ۲ · جلسه چهارم · قدردانی",
  "5-Discussing past plans & decision; Part 1": "پیشرفته ۲ · جلسه پنجم · برنامه‌ها و تصمیم‌های گذشته ۱",
  "6-Discussing past plans & decision; Part 2": "پیشرفته ۲ · جلسه ششم · برنامه‌ها و تصمیم‌های گذشته ۲",
  "7-Asking for & giving permission (Allow)": "پیشرفته ۲ · جلسه هفتم · اجازه با allow",
  "8-What is & is not allowed": "پیشرفته ۲ · جلسه هشتم · چه چیزی مجاز است",
  "9-Asking for permission; Can I possibly": "پیشرفته ۲ · جلسه نهم · Can I possibly",
  "10-Obtaining permission; Inviting & refusing": "پیشرفته ۲ · جلسه دهم · اجازه، دعوت و رد دعوت",
  "11-Inviting & arranging the time": "پیشرفته ۲ · جلسه یازدهم · دعوت و تعیین وقت",
  "12-Inviting & hesitating": "پیشرفته ۲ · جلسه دوازدهم · دعوت و تردید",
  "13-If clauses; Part 1": "پیشرفته ۲ · جلسه سیزدهم · جملات شرطی ۱",
  "14-If clauses; Part 2": "پیشرفته ۲ · جلسه چهاردهم · جملات شرطی ۲",
  "15-Functions of wish; Part 1 (to be)": "پیشرفته ۲ · جلسه پانزدهم · wish با to be",
  "16-Functions of wish; Part 2 (verb)": "پیشرفته ۲ · جلسه شانزدهم · wish با فعل",
};

function norm(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9\u0600-\u06ff]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isEnglish(line) {
  const t = line.trim();
  if (!t) return false;
  if (/^[AB]:/.test(t)) return true;
  return /[A-Za-z]/.test(t) && !/^[\u0600-\u06ff]/.test(t);
}

function parsePairs(text) {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.replace(/\s+/g, " ").trim())
    .filter((l) => l && l !== "." && !/^[-–]+$/.test(l));
  const pairs = [];
  const seen = new Set();
  for (let i = 0; i < lines.length; i++) {
    const a = lines[i];
    const b = lines[i + 1];
    if (!b) continue;
    let fa = "";
    let en = "";
    if (!isEnglish(a) && isEnglish(b)) {
      fa = a;
      en = b;
      i += 1;
    } else if (isEnglish(a) && b && !isEnglish(b) && !/^[AB]:/.test(a)) {
      en = a;
      fa = b;
      i += 1;
    } else continue;
    const key = norm(`${en}|${fa}`);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    pairs.push({ fa, en });
  }
  return pairs;
}

function parseDialogue(text) {
  return text
    .split(/\r?\n/)
    .map((l) => l.replace(/\s+/g, " ").trim())
    .filter((l) => l && l !== ".");
}

function findLesson(bookMatch, chapter, title) {
  const c = norm(chapter);
  const t = norm(title);
  return lessons.find((lesson) => {
    if (!lesson.book.includes(bookMatch)) return false;
    return norm(lesson.chapter) === c && norm(lesson.title) === t;
  });
}

const byId = {};
const unmatched = [];

for (const book of books) {
  const bookRoot = join(root, book.dir);
  if (!existsSync(bookRoot)) {
    console.error("missing", bookRoot);
    continue;
  }
  for (const chapter of readdirSync(bookRoot, { withFileTypes: true }).filter((d) => d.isDirectory())) {
    const chapterPath = join(bookRoot, chapter.name);
    for (const lessonDir of readdirSync(chapterPath, { withFileTypes: true }).filter((d) => d.isDirectory())) {
      const lesson = findLesson(book.match, chapter.name, lessonDir.name);
      if (!lesson) {
        unmatched.push(`${book.match} / ${chapter.name} / ${lessonDir.name}`);
        continue;
      }
      const folder = join(chapterPath, lessonDir.name);
      const read = (name) => (existsSync(join(folder, name)) ? readFileSync(join(folder, name), "utf8") : "");
      const sentences = parsePairs(read("Context.txt"));
      const words = parsePairs(read("Vocabulary.txt"));
      const proverb = parsePairs(read("Proverb.txt"));
      const conversation = parseDialogue(read("Conversation text.txt"));
      byId[lesson.id] = {
        focus: sessionFa[lesson.chapter] || lesson.chapter.replace(/^\d+-/, ""),
        source: book.source,
        sentences,
        words,
        proverb,
        conversation,
      };
    }
  }
}

writeFileSync(join(process.cwd(), "data/learnables.json"), JSON.stringify({ byId, sessionFa }, null, 2), "utf8");
console.log("lessons", Object.keys(byId).length, "unmatched", unmatched.length);
if (unmatched.length) console.log(unmatched.slice(0, 20).join("\n"));

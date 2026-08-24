import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pages = [
  'index.html',
  'functions.html',
  'geometry.html',
  'probability.html',
  'calculus.html',
  'elective.html',
  'lab.html',
  'challenge.html'
];
const coursePages = pages.filter(page => !['index.html', 'challenge.html'].includes(page));
const failures = [];

function check(condition, message) {
  if (!condition) failures.push(message);
}

function read(file) {
  return fs.readFileSync(path.join(root, file), 'utf8');
}

function localReferences(html) {
  const refs = [];
  const pattern = /\b(?:src|href|poster|data-src)=["']([^"']*)["']/g;
  for (const match of html.matchAll(pattern)) refs.push(match[1]);
  return refs.filter(ref =>
    ref &&
    !ref.includes('${') &&
    !/^(?:https?:|data:|javascript:|mailto:|tel:|#)/.test(ref)
  );
}

for (const page of pages) {
  const html = read(page);
  const ids = [...html.matchAll(/\bid=["']([^"']+)["']/g)].map(match => match[1]);
  const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
  check(duplicateIds.length === 0, `${page}: duplicate ids: ${[...new Set(duplicateIds)].join(', ')}`);
  check(!/\b(?:src|href)=["']\s*["']/.test(html), `${page}: empty src/href attribute`);
  check(!/maximum-scale|user-scalable\s*=\s*no/i.test(html), `${page}: viewport disables zoom`);
  check(html.includes('href="assets/favicon.svg"'), `${page}: local favicon is missing`);
  check(!html.includes('fonts.googleapis.com') && !html.includes('fonts.gstatic.com'), `${page}: remote font dependency remains`);

  for (const ref of localReferences(html)) {
    const filePart = ref.split(/[?#]/, 1)[0];
    const target = path.resolve(root, path.dirname(page), filePart);
    check(fs.existsSync(target), `${page}: missing local reference ${ref}`);
  }

  for (const openTag of html.matchAll(/<a\b[^>]*target=["']_blank["'][^>]*>/g)) {
    check(/\brel=["'][^"']*\bnoopener\b/.test(openTag[0]), `${page}: target=_blank without rel=noopener`);
  }

  for (const script of html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)) {
    const attributes = script[1];
    if (/\bsrc=|type=["']text\/tailwindcss["']/.test(attributes)) continue;
    try {
      new Function(script[2]);
    } catch (error) {
      failures.push(`${page}: inline script syntax error: ${error.message}`);
    }
  }
}

check(fs.existsSync(path.join(root, 'assets/favicon.svg')), 'assets/favicon.svg is missing');
for (const asset of [
  'assets/vendor/tailwind-browser-4.3.1.js',
  'assets/vendor/tailwind-v3.js',
  'assets/vendor/lucide-1.8.0.min.js',
  'assets/genshin-enhancements.js',
  'assets/genshin-enhancements.css'
]) {
  check(fs.existsSync(path.join(root, asset)), `${asset} is missing`);
}

for (const page of pages.filter(page => page !== 'challenge.html')) {
  const html = read(page);
  check(html.includes('class="hidden lg:flex items-center gap-5"'), `${page}: desktop nav breakpoint is not lg`);
  check(html.includes('class="lg:hidden inline-flex'), `${page}: mobile nav toggle breakpoint is not lg`);
  check(html.includes('id="mobile-menu" class="lg:hidden hidden'), `${page}: mobile menu breakpoint is not lg`);
  for (const target of ['functions', 'geometry', 'probability', 'calculus', 'elective']) {
    check(
      new RegExp(`<a href=["']${target}\\.html["'] data-nav-key=["']${target}["']`).test(html),
      `${page}: mobile link to ${target}.html is missing`
    );
  }
  check(html.includes('<noscript><style>.reveal'), `${page}: no-JavaScript reveal fallback is missing`);
}

for (const page of coursePages) {
  const html = read(page);
  check(/class="toc-(?:desktop|panel) hidden lg:block/.test(html), `${page}: desktop TOC breakpoint is not lg`);
  check(/class="lg:hidden(?: fixed)?/.test(html), `${page}: mobile TOC breakpoint is not lg`);
}

const challenge = read('challenge.html');
const bankMatch = challenge.match(/const questionBank = (\{[\s\S]*?\n\s*\};)/);
check(Boolean(bankMatch), 'challenge.html: questionBank was not found');
if (bankMatch) {
  const questionBank = vm.runInNewContext(`(${bankMatch[1].replace(/;\s*$/, '')})`);
  check(Object.keys(questionBank).length === 30, 'challenge.html: questionBank must contain 30 days');
  let total = 0;
  const fullQuestionKeys = new Set();
  for (const [day, questions] of Object.entries(questionBank)) {
    check(Array.isArray(questions) && questions.length >= 5, `challenge.html: day ${day} has fewer than 5 questions`);
    total += questions.length;
    questions.forEach((question, index) => {
      check(typeof question.q === 'string' && question.q.length > 0, `challenge.html: day ${day} question ${index + 1} has no text`);
      check(Array.isArray(question.options) && question.options.length === 4, `challenge.html: day ${day} question ${index + 1} must have 4 options`);
      check(Number.isInteger(question.answer) && question.answer >= 0 && question.answer < question.options.length,
        `challenge.html: day ${day} question ${index + 1} has an invalid answer`);
      check(typeof question.explanation === 'string' && question.explanation.length > 0,
        `challenge.html: day ${day} question ${index + 1} has no explanation`);
      check(/^(?:index|functions|geometry|probability|calculus|elective)\.html$/.test(question.kpPage),
        `challenge.html: day ${day} question ${index + 1} has an invalid kpPage`);
      const fullKey = `${question.q}\u0000${[...question.options].sort().join('\u0000')}`;
      check(!fullQuestionKeys.has(fullKey), `challenge.html: day ${day} question ${index + 1} fully duplicates an earlier question`);
      fullQuestionKeys.add(fullKey);
    });
  }
  check(total === 330, `challenge.html: expected 330 questions, found ${total}`);
}

try {
  new Function(read('assets/genshin-enhancements.js'));
} catch (error) {
  failures.push(`assets/genshin-enhancements.js: syntax error: ${error.message}`);
}

if (failures.length) {
  console.error(`STATIC CHECKS FAILED (${failures.length})`);
  failures.forEach((failure, index) => console.error(`${index + 1}. ${failure}`));
  process.exit(1);
}

console.log(`STATIC CHECKS PASSED: ${pages.length} pages, 330 questions`);

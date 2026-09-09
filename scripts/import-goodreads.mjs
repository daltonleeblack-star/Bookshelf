#!/usr/bin/env node
/**
 * Pull Goodreads shelves into data/books.js.
 *
 *   node scripts/import-goodreads.mjs --csv goodreads_library_export.csv
 *   node scripts/import-goodreads.mjs --rss 108508812
 *   node scripts/import-goodreads.mjs --csv export.csv --rss 108508812   # CSV for facts, RSS for covers
 *   node scripts/import-goodreads.mjs --rss-file read.xml                # from saved feeds, offline
 *
 * The CSV export (Goodreads → My Books → Import/Export → Export Library) is the
 * complete, reliable source. The RSS feed needs no login but caps out around 100
 * books per shelf — it is, however, the only one that carries cover art.
 *
 * Anything you hand-edited in data/books.js — `progress`, `pagesRead`, `startedAt`,
 * `spineColor` — is matched by title+author and carried across re-imports.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'data', 'books.js');

/* ---------- args ---------- */

const args = process.argv.slice(2);
function flag(name) {
  const i = args.indexOf(name);
  return i === -1 ? null : (args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : true);
}
function flagAll(name) {
  var out = [];
  args.forEach(function (a, i) {
    if (a === name && args[i + 1] && !args[i + 1].startsWith('--')) out.push(args[i + 1]);
  });
  return out;
}
const csvPath = flag('--csv');
const rssFiles = flagAll('--rss-file');
const rssUser = flag('--rss');
const outPath = typeof flag('--out') === 'string' ? path.resolve(flag('--out')) : OUT;

if (!csvPath && !rssUser && !rssFiles.length) {
  console.error(`Usage:
  node scripts/import-goodreads.mjs --csv goodreads_library_export.csv
  node scripts/import-goodreads.mjs --rss <goodreads-user-id>
  node scripts/import-goodreads.mjs --rss-file read.xml --rss-file current.xml

Get the CSV at https://www.goodreads.com/review/import (Export Library).
--rss-file reads shelf RSS you already saved, for when this machine can't
reach goodreads.com. Shelf feeds live at:
  https://www.goodreads.com/review/list_rss/<user-id>?shelf=read&sort=date_read&order=d
  https://www.goodreads.com/review/list_rss/<user-id>?shelf=currently-reading`);
  process.exit(1);
}

/* ---------- tiny CSV reader (handles quoted fields and embedded newlines) ---------- */

function parseCsv(text) {
  const rows = [];
  let row = [], field = '', quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else quoted = false;
      } else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
    else if (c !== '\r') field += c;
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  const header = rows.shift().map((h) => h.trim());
  return rows
    .filter((r) => r.length > 1)
    .map((r) => Object.fromEntries(header.map((h, i) => [h, (r[i] ?? '').trim()])));
}

/* ---------- fetch + parse RSS ---------- */

async function fetchShelfRss(userId, shelf) {
  const url = `https://www.goodreads.com/review/list_rss/${userId}?shelf=${shelf}&sort=date_read&order=d&per_page=200`;
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 reading-room-importer' } });
  if (!res.ok) throw new Error(`${shelf}: HTTP ${res.status} — is the profile public?`);
  return parseRss(await res.text());
}

function parseRss(xml) {
  const tag = (block, name) => {
    const m = new RegExp(`<${name}>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?</${name}>`).exec(block);
    return m ? m[1].trim() : '';
  };
  return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(([, b]) => ({
    id: tag(b, 'book_id') || tag(b, 'guid'),
    title: decode(tag(b, 'title')),
    author: decode(tag(b, 'author_name')),
    pages: num(tag(b, 'num_pages')),
    rating: num(tag(b, 'user_rating')),
    dateRead: date(tag(b, 'user_read_at')),
    startedAt: date(tag(b, 'user_date_added')),
    coverUrl: (tag(b, 'book_large_image_url') || tag(b, 'book_image_url') || '').replace(/^http:/, 'https:')
  }));
}

const decode = (s) => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>');
const num = (v) => { const n = parseInt(v, 10); return Number.isFinite(n) && n > 0 ? n : null; };
const date = (v) => { const d = v ? new Date(v) : null; return d && !isNaN(d) ? d.toISOString().slice(0, 10) : null; };

/* ---------- carry over hand-edited fields ---------- */

function readExisting() {
  if (!fs.existsSync(outPath)) return {};
  try {
    const win = {};
    new Function('window', fs.readFileSync(outPath, 'utf8'))(win);
    const map = {};
    for (const b of [...(win.BOOKSHELF_DATA?.currentlyReading || []), ...(win.BOOKSHELF_DATA?.read || [])]) {
      map[key(b)] = b;
    }
    return map;
  } catch (e) {
    console.warn('Could not read existing data/books.js (' + e.message + ') — starting fresh.');
    return {};
  }
}
const key = (b) => `${(b.title || '').toLowerCase().replace(/\s*\(.*\)$/, '')}|${(b.author || '').toLowerCase()}`;

function merge(book, previous) {
  const prev = previous[key(book)];
  if (!prev) return book;
  for (const f of ['progress', 'pagesRead', 'startedAt', 'spineColor']) {
    if (book[f] == null && prev[f] != null) book[f] = prev[f];
  }
  if (!book.coverUrl && prev.coverUrl) book.coverUrl = prev.coverUrl;
  return book;
}

/* ---------- build ---------- */

const previous = readExisting();
let current = [], read = [];

if (csvPath && csvPath !== true) {
  const rows = parseCsv(fs.readFileSync(path.resolve(csvPath), 'utf8'));
  const map = (r) => ({
    id: r['Book Id'] || undefined,
    title: r['Title'],
    author: r['Author'],
    pages: num(r['Number of Pages']),
    rating: num(r['My Rating']),
    dateRead: date(r['Date Read']) || date(r['Date Added']) || null,
    startedAt: date(r['Date Added'])
  });
  const shelfOf = (r) => (r['Exclusive Shelf'] || '').toLowerCase();
  current = rows.filter((r) => shelfOf(r) === 'currently-reading').map((r) => {
    const b = map(r); delete b.dateRead; delete b.rating; return b;
  });
  read = rows.filter((r) => shelfOf(r) === 'read').map(map);
  console.log(`CSV: ${read.length} read, ${current.length} currently reading.`);
}

if (rssUser && rssUser !== true || rssFiles.length) {
  let rssCurrent = [], rssRead = [];

  if (rssFiles.length) {
    // Saved feeds: a shelf is "currently reading" if nothing in it has a read date.
    for (const f of rssFiles) {
      const items = parseRss(fs.readFileSync(path.resolve(f), 'utf8'));
      if (items.some((b) => b.dateRead)) rssRead = rssRead.concat(items);
      else rssCurrent = rssCurrent.concat(items);
    }
    console.log(`RSS files: ${rssRead.length} read, ${rssCurrent.length} currently reading.`);
  } else {
    [rssCurrent, rssRead] = await Promise.all([
      fetchShelfRss(rssUser, 'currently-reading'),
      fetchShelfRss(rssUser, 'read')
    ]);
    console.log(`RSS: ${rssRead.length} read, ${rssCurrent.length} currently reading.`);
  }

  if (!current.length) current = rssCurrent.map((b) => { const c = { ...b }; delete c.dateRead; delete c.rating; return c; });
  if (!read.length) read = rssRead;
  // RSS is the only source of cover art — graft it onto whatever we already have.
  const covers = Object.fromEntries([...rssRead, ...rssCurrent].filter((b) => b.coverUrl).map((b) => [key(b), b.coverUrl]));
  for (const b of [...current, ...read]) if (!b.coverUrl && covers[key(b)]) b.coverUrl = covers[key(b)];
}

current = current.map((b) => merge(b, previous));
read = read
  .map((b) => merge(b, previous))
  .sort((a, b) => new Date(b.dateRead || 0) - new Date(a.dateRead || 0));

const cutoff = new Date();
cutoff.setFullYear(cutoff.getFullYear() - 3);
const onShelf = read.filter((b) => b.dateRead && new Date(b.dateRead) >= cutoff).length;

const data = {
  profile: {
    name: process.env.READER_NAME || undefined,
    goodreadsUrl: rssUser && rssUser !== true ? `https://www.goodreads.com/user/show/${rssUser}` : undefined,
    lastSynced: new Date().toISOString().slice(0, 10)
  },
  currentlyReading: current,
  read
};

const banner = `/* Generated by scripts/import-goodreads.mjs on ${data.profile.lastSynced}.
 * Hand-edits to progress / pagesRead / startedAt / spineColor survive re-imports.
 */\n`;
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, banner + 'window.BOOKSHELF_DATA = ' + JSON.stringify(data, null, 2) + ';\n');

console.log(`Wrote ${path.relative(ROOT, outPath)} — ${onShelf} books land on the shelf (last 3 years).`);
if (current.some((b) => b.progress == null && b.pagesRead == null)) {
  console.log('Tip: Goodreads does not expose reading progress, so add `"pagesRead": 120` (or `"progress": 45`) to your current reads by hand — the importer keeps them from now on.');
}

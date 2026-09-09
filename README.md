# The Reading Room

A dashboard for what you're reading, drawn as a room: a comfy armchair, a side table
with a stack of your current reads, and a bookcase of everything you've finished in
the last three years.

- **Click the stack** on the side table → a drawer slides out with covers and how far
  you are through each book.
- **Click a spine** on the shelf → a card showing when you finished it and your rating.
- The shelf only holds books with a *date read* inside the last 3 years. Anything older
  (or undated) stays out of the room; the footer tells you how many were skipped.

No build step, no dependencies. Open `index.html` in a browser and you're in.

## Getting your Goodreads data in

`data/books.js` ships with sample books so the room isn't empty. Replace them with yours:

### Option A — CSV export (recommended, complete)

1. Go to <https://www.goodreads.com/review/import> → **Export Library**, download the CSV.
2. ```sh
   node scripts/import-goodreads.mjs --csv ~/Downloads/goodreads_library_export.csv
   ```

The export has everything: every book, page counts, ratings, and real *Date Read* values.
It doesn't include cover images.

### Option B — RSS feed (no download, but capped and needs a public profile)

```sh
node scripts/import-goodreads.mjs --rss 108508812
```

Reads your `currently-reading` and `read` shelves straight off Goodreads. This is the only
source that carries **cover art**, but it returns roughly the most recent 100 books per shelf.

### Option C — saved feeds (when the machine running the import can't reach Goodreads)

Open the shelf feeds in a browser, save each page, then point the importer at the files:

```
https://www.goodreads.com/review/list_rss/108508812?shelf=read&sort=date_read&order=d
https://www.goodreads.com/review/list_rss/108508812?shelf=currently-reading
```

```sh
node scripts/import-goodreads.mjs --rss-file read.xml --rss-file currently-reading.xml
```

A saved shelf is treated as *currently reading* when none of its items carry a read date.

### Best of both

```sh
node scripts/import-goodreads.mjs --csv ~/Downloads/goodreads_library_export.csv --rss 108508812
```

CSV for the facts, RSS grafted on for the covers.

## Reading progress

Goodreads doesn't publish how far you are through a book in either the CSV or the RSS feed,
so progress is yours to set. Open `data/books.js` and add to any current read:

```js
{ "title": "Piranesi", "author": "Susanna Clarke", "pages": 245, "pagesRead": 61 }
```

or use a straight percentage: `"progress": 25`. Re-running the importer **keeps** anything you
hand-edited — `progress`, `pagesRead`, `startedAt`, `spineColor` — matched by title and author.

## Tuning the room

| What | Where |
| --- | --- |
| Years of history on the shelf | `YEARS_ON_SHELF` in `assets/app.js` |
| Spine size vs. page count | `spineWidth()` / `spineHeight()` in `assets/app.js` |
| A specific book's spine color | add `"spineColor": "#7d3b52"` to that book |
| Wall, wood, lamp colors | the `:root` variables in `assets/styles.css` |

## Files

```
index.html                    the room
assets/styles.css             the room's paint, furniture and lighting
assets/app.js                 rendering, the stack drawer, the spine cards
data/books.js                 your shelves (generated, safe to hand-edit)
scripts/import-goodreads.mjs  Goodreads CSV / RSS → data/books.js
```

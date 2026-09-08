/* The Reading Room — renders a cozy scene from data/books.js */
(function () {
  'use strict';

  var DATA = window.BOOKSHELF_DATA || { profile: {}, currentlyReading: [], read: [] };
  var YEARS_ON_SHELF = 3;

  /* ---------- helpers ---------- */

  var PALETTE = [
    ['#7d3b52', '#4a1f2f'], ['#2f5d62', '#1b3b3f'], ['#7a5a2e', '#48331a'],
    ['#4a4a7d', '#26264a'], ['#6d3324', '#3d1a12'], ['#3f6b45', '#223d26'],
    ['#7b5170', '#452a40'], ['#26506f', '#142f42'], ['#8a6a2c', '#4f3b17'],
    ['#5c3f7a', '#331f47'], ['#a1553a', '#5d2d1d'], ['#37605c', '#1f3a37']
  ];

  function hash(str) {
    var h = 0;
    for (var i = 0; i < String(str).length; i++) h = (h * 31 + String(str).charCodeAt(i)) | 0;
    return Math.abs(h);
  }
  function colorsFor(book) {
    if (book.spineColor) {
      return [book.spineColor, shade(book.spineColor, -0.32)];
    }
    return PALETTE[hash((book.title || '') + (book.author || '')) % PALETTE.length];
  }
  function shade(hex, amt) {
    var m = /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(hex || '');
    if (!m) return hex;
    return '#' + [1, 2, 3].map(function (i) {
      var v = Math.round(Math.min(255, Math.max(0, parseInt(m[i], 16) * (1 + amt))));
      return ('0' + v.toString(16)).slice(-2);
    }).join('');
  }
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function parseDate(v) {
    if (!v) return null;
    var d = new Date(v);
    return isNaN(d) ? null : d;
  }
  function fmtDate(v) {
    var d = parseDate(v);
    if (!d) return 'Date not recorded';
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  }
  function stars(rating) {
    var r = Math.round(Number(rating) || 0);
    var s = el('span', 'stars');
    for (var i = 1; i <= 5; i++) {
      var star = el('span', i <= r ? '' : 'off', '★');
      s.appendChild(star);
    }
    return s;
  }
  function pct(book) {
    if (typeof book.progress === 'number') return Math.max(0, Math.min(100, Math.round(book.progress)));
    if (book.pagesRead && book.pages) return Math.max(0, Math.min(100, Math.round((book.pagesRead / book.pages) * 100)));
    return 0;
  }

  /* ---------- header ---------- */

  var profile = DATA.profile || {};
  var cutoff = new Date();
  cutoff.setFullYear(cutoff.getFullYear() - YEARS_ON_SHELF);

  var shelfBooks = (DATA.read || [])
    .filter(function (b) { var d = parseDate(b.dateRead); return d && d >= cutoff; })
    .sort(function (a, b) { return parseDate(b.dateRead) - parseDate(a.dateRead); });

  var undated = (DATA.read || []).filter(function (b) { return !parseDate(b.dateRead); }).length;

  document.getElementById('profile-line').textContent =
    (profile.name ? profile.name + ' · ' : '') + 'a chair, a lamp, and everything you’ve been reading';

  document.getElementById('shelf-range').textContent =
    '· ' + cutoff.getFullYear() + '–' + new Date().getFullYear();

  var statList = [
    ['Reading now', (DATA.currentlyReading || []).length],
    ['On the shelf', shelfBooks.length],
    ['Avg rating', avgRating(shelfBooks)]
  ];
  var statsEl = document.getElementById('stats');
  statList.forEach(function (s) {
    var wrap = el('div');
    wrap.appendChild(el('dd', null, s[1]));
    wrap.appendChild(el('dt', null, s[0]));
    statsEl.appendChild(wrap);
  });

  function avgRating(list) {
    var rated = list.filter(function (b) { return Number(b.rating) > 0; });
    if (!rated.length) return '—';
    var sum = rated.reduce(function (a, b) { return a + Number(b.rating); }, 0);
    return (sum / rated.length).toFixed(1);
  }

  if (profile.sample) document.getElementById('sample-notice').hidden = false;

  var syncedEl = document.getElementById('synced');
  syncedEl.textContent = profile.lastSynced
    ? 'Shelf synced ' + fmtDate(profile.lastSynced) + (undated ? ' · ' + undated + ' read books have no date and are off the shelf' : '')
    : 'Not yet synced with Goodreads';

  var link = document.getElementById('profile-link');
  if (profile.goodreadsUrl) link.href = profile.goodreadsUrl;
  else link.hidden = true;

  /* ---------- the stack on the side table ---------- */

  var current = DATA.currentlyReading || [];
  var stackBooks = document.getElementById('stack-books');
  var stackBtn = document.getElementById('stack');

  if (!current.length) {
    document.getElementById('stack-tag').textContent = 'Nothing on the table';
  }
  current.slice(0, 7).forEach(function (b, i) {
    var c = colorsFor(b);
    var book = el('span', 'book');
    book.style.setProperty('--c1', c[0]);
    book.style.setProperty('--c2', c[1]);
    book.style.setProperty('--w', (72 + (hash(b.title) % 26)) + '%');
    book.style.setProperty('--r', ((hash(b.title + i) % 5) - 2) + 'deg');
    book.style.setProperty('--nudge', ((i % 2 ? 1 : -1) * 2) + '%');
    stackBooks.appendChild(book);
  });

  /* ---------- drawer ---------- */

  var drawer = document.getElementById('drawer');
  var scrim = document.getElementById('scrim');
  var body = document.getElementById('drawer-body');

  function buildCover(b) {
    var c = colorsFor(b);
    if (b.coverUrl) {
      var img = document.createElement('img');
      img.className = 'cover';
      img.src = b.coverUrl;
      img.alt = 'Cover of ' + b.title;
      img.loading = 'lazy';
      img.onerror = function () { img.replaceWith(fallbackCover(b, c)); };
      return img;
    }
    return fallbackCover(b, c);
  }
  function fallbackCover(b, c) {
    var d = el('div', 'cover', b.title);
    d.style.setProperty('--c1', c[0]);
    d.style.setProperty('--c2', c[1]);
    return d;
  }

  function renderDrawer() {
    body.innerHTML = '';
    if (!current.length) {
      body.appendChild(el('p', 'empty', 'No books in progress. The table is clear — pick something off the shelf.'));
      return;
    }
    current.forEach(function (b) {
      var card = el('div', 'reading-card');
      card.appendChild(buildCover(b));

      var right = el('div');
      right.appendChild(el('h3', null, b.title));
      right.appendChild(el('p', 'author', b.author || ''));

      var p = pct(b);
      var bar = el('div', 'bar');
      var fill = el('span');
      fill.style.width = p + '%';
      bar.appendChild(fill);
      right.appendChild(bar);

      var meta = el('div', 'bar-meta');
      var left = el('span');
      left.innerHTML = '<b>' + p + '%</b> through';
      meta.appendChild(left);
      meta.appendChild(el('span', null,
        b.pages ? (b.pagesRead != null ? b.pagesRead + ' / ' + b.pages + ' pages' : b.pages + ' pages') : ''));
      right.appendChild(meta);

      if (b.startedAt) right.appendChild(el('p', 'since', 'Started ' + fmtDate(b.startedAt)));
      card.appendChild(right);
      body.appendChild(card);
    });
  }

  function openDrawer() {
    renderDrawer();
    drawer.hidden = false;
    scrim.hidden = false;
    stackBtn.setAttribute('aria-expanded', 'true');
    document.getElementById('drawer-close').focus();
  }
  function closeDrawer() {
    drawer.hidden = true;
    scrim.hidden = true;
    stackBtn.setAttribute('aria-expanded', 'false');
    stackBtn.focus();
  }
  stackBtn.addEventListener('click', openDrawer);
  document.getElementById('drawer-close').addEventListener('click', closeDrawer);
  scrim.addEventListener('click', closeDrawer);

  /* ---------- shelves ---------- */

  var shelvesEl = document.getElementById('shelves');
  var hintEl = document.querySelector('.bookcase-hint');
  var HINT = hintEl.textContent;

  var MAX_SHELVES = 4;
  var GAP = 0.28;

  // One "unit" is whatever --unit resolves to at this breakpoint; measuring it
  // means the case decides how many books fit, at any screen size.
  function shelfCapacity() {
    var probe = el('div');
    probe.style.cssText = 'position:absolute;visibility:hidden;width:var(--unit)';
    shelvesEl.appendChild(probe);
    var unit = probe.getBoundingClientRect().width || 12;
    probe.remove();
    return Math.max(12, shelvesEl.clientWidth / unit - 1.6);
  }

  function baseWidth(b) {
    var pages = Number(b.pages) || 320;
    return Math.max(1.05, Math.min(2.6, pages / 190));
  }
  function baseHeight(b) {
    var pages = Number(b.pages) || 320;
    return Math.max(6.4, Math.min(9.6, 6.2 + pages / 130));
  }

  // Squeeze the spines until three years of reading fits the case, and drop the
  // oldest ones only if even the thinnest binding won't fit.
  function fitToCase(books, rowWidth) {
    var total = books.reduce(function (sum, b) { return sum + baseWidth(b) + GAP; }, 0);
    var capacity = rowWidth * MAX_SHELVES;
    var scale = Math.max(0.42, Math.min(1, capacity / total));
    var shown = books, dropped = 0;
    if (total * scale > capacity) {
      var used = 0;
      shown = [];
      for (var i = 0; i < books.length; i++) {
        var w = baseWidth(books[i]) * scale + GAP;
        if (used + w > capacity) break;
        shown.push(books[i]);
        used += w;
      }
      dropped = books.length - shown.length;
    }
    return { books: shown, scale: scale, dropped: dropped };
  }

  // Pack each shelf full before starting the next, the way a real case fills up.
  function layoutShelves(books, scale, rowWidth) {
    var rows = [[]], used = 0;
    books.forEach(function (b) {
      var w = baseWidth(b) * scale + GAP;
      if (used + w > rowWidth && rows[rows.length - 1].length) { rows.push([]); used = 0; }
      rows[rows.length - 1].push(b);
      used += w;
    });
    return rows.slice(0, MAX_SHELVES);
  }

  function rowWidthOf(row, scale) {
    return row.reduce(function (sum, b) { return sum + baseWidth(b) * scale + GAP; }, 0);
  }

  function unit(n) { return 'calc(var(--unit) * ' + n.toFixed(3) + ')'; }

  // A short last shelf gets a few volumes laid flat, like everyone's does.
  function shelfProp(space) {
    var prop = el('div', 'shelf-prop');
    [Math.min(6, space * 0.6), Math.min(5.2, space * 0.52), Math.min(5.6, space * 0.56)]
      .forEach(function (w, i) {
        var c = ['#5c3f7a', '#7a5a2e', '#2f5d62'][i];
        var flat = el('span', 'flat-book');
        flat.style.width = unit(w);
        flat.style.background = 'linear-gradient(180deg,' + c + ',' + shade(c, -0.35) + ')';
        prop.appendChild(flat);
      });
    return prop;
  }

  function renderShelves() {
    closeSpine();
    shelvesEl.innerHTML = '';
    hintEl.textContent = HINT;

    if (!shelfBooks.length) {
      var emptyShelf = el('div', 'shelf');
      emptyShelf.appendChild(el('p', 'shelf-empty',
        'No finished books dated in the last ' + YEARS_ON_SHELF + ' years yet.'));
      shelvesEl.appendChild(emptyShelf);
      return;
    }

    var rowWidth = shelfCapacity();
    var fit = fitToCase(shelfBooks, rowWidth);
    var rows = layoutShelves(fit.books, fit.scale, rowWidth);

    rows.forEach(function (row, rowIndex) {
      var shelf = el('div', 'shelf');
      row.forEach(function (b) {
        var c = colorsFor(b);
        var s = el('button', 'spine');
        s.type = 'button';
        s.style.width = unit(baseWidth(b) * fit.scale);
        s.style.height = unit(baseHeight(b));
        s.style.fontSize = unit(Math.max(0.62, 1.02 * fit.scale));
        s.style.background = 'linear-gradient(90deg,' + c[1] + ',' + c[0] + ' 42%,' + c[1] + ')';
        s.title = b.title + (b.author ? ' — ' + b.author : '');
        s.appendChild(document.createTextNode(b.title));
        s.addEventListener('click', function (e) {
          e.stopPropagation();
          openSpine(b, s);
        });
        shelf.appendChild(s);
      });
      var space = rowWidth - rowWidthOf(row, fit.scale);
      if (rowIndex === rows.length - 1 && space > 5) shelf.appendChild(shelfProp(space));
      shelvesEl.appendChild(shelf);
    });

    if (fit.dropped) {
      hintEl.textContent = HINT + ' \u00b7 ' + fit.dropped + ' older titles didn\u2019t fit the case';
    }
  }

  /* ---------- spine detail card ---------- */

  var card = document.getElementById('spine-card');
  var openSpineEl = null;

  function openSpine(b, node) {
    if (openSpineEl === node) return closeSpine();
    closeSpine();
    openSpineEl = node;
    node.classList.add('is-open');

    card.innerHTML = '';
    card.appendChild(el('h3', null, b.title));
    card.appendChild(el('p', 'author', b.author || ''));

    var r1 = el('div', 'row');
    r1.appendChild(el('span', null, 'Finished'));
    r1.appendChild(el('span', null, fmtDate(b.dateRead)));
    card.appendChild(r1);

    var r2 = el('div', 'row');
    r2.appendChild(el('span', null, 'My rating'));
    r2.appendChild(Number(b.rating) ? stars(b.rating) : el('span', null, 'Not rated'));
    card.appendChild(r2);

    if (b.pages) {
      var r3 = el('div', 'row');
      r3.appendChild(el('span', null, 'Length'));
      r3.appendChild(el('span', null, b.pages + ' pages'));
      card.appendChild(r3);
    }

    card.hidden = false;
    var box = node.getBoundingClientRect();
    var w = 270;
    var x = Math.min(window.innerWidth - w - 12, Math.max(12, box.left + box.width / 2 - w / 2));
    var y = box.top - card.offsetHeight - 12;
    if (y < 12) y = Math.min(window.innerHeight - card.offsetHeight - 12, box.bottom + 12);
    card.style.left = x + 'px';
    card.style.top = y + 'px';
  }

  function closeSpine() {
    card.hidden = true;
    if (openSpineEl) openSpineEl.classList.remove('is-open');
    openSpineEl = null;
  }

  document.addEventListener('click', function (e) {
    if (!card.hidden && !card.contains(e.target)) closeSpine();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    closeSpine();
    if (!drawer.hidden) closeDrawer();
  });
  var resizeTimer;
  window.addEventListener('resize', function () {
    closeSpine();
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(renderShelves, 180);
  });

  renderShelves();
})();

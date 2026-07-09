/* CORSI shared behavior: header, drawer, bag, reveals, film */

function menuToggle(open) {
  document.body.classList.toggle('menu-open', open);
}

function bagToggle(open) {
  document.body.classList.toggle('bag-open', open);
  if (open) bagRender();
}

addEventListener('keydown', function (e) {
  if (e.key === 'Escape') { menuToggle(false); bagToggle(false); searchToggle(false); }
});

/* ---------- search ---------- */

var CATALOG = [
  { name: 'Sinopoli Crest Tee', price: 280, page: 'product-sinopoli.html', img: 'images/card-sinopoli.jpg', tags: 'sinopoli crest supima cotton t-shirt tee white italy heritage men women', stock: false },
  { name: 'The Calligraphy Tiger', price: 280, page: 'product-tiger.html', img: 'images/card-tiger.jpg', tags: 'arabic calligraphy tiger supima cotton t-shirt tee white signature men women', stock: false },
  { name: 'Tennis Crewneck', price: 450, page: 'product-tennis.html', img: 'images/card-tennis.jpg', tags: 'tennis crewneck sweatshirt sweater organic cotton natural cream racket men women', stock: false },
  { name: 'C Icon Pima Tee', price: 260, page: 'product-pima.html', img: 'images/card-pima.jpg', tags: 'c icon pima cotton t-shirt tee rose pink men women', stock: false },
  { name: 'C Icon Royal Purple Tee', price: 260, page: 'product-purple.html', img: 'images/card-purple.jpg', tags: 'c icon royal purple cotton t-shirt tee violet men women', stock: false },
  { name: 'C Icon Floral Tee', price: 280, page: 'product-floral.html', img: 'images/card-floral.jpg', tags: 'c icon floral flower supima cotton t-shirt tee white men women', stock: false }
];

function searchToggle(open) {
  document.body.classList.toggle('search-open', open);
  var input = document.getElementById('search-input');
  if (open && input) {
    searchRender(input.value);
    setTimeout(function () { input.focus(); }, 160);
  }
}

function searchSet(q) {
  var input = document.getElementById('search-input');
  if (input) { input.value = q; input.focus(); }
  searchRender(q);
}

function searchMatches(q) {
  q = q.trim().toLowerCase();
  if (!q) return CATALOG;
  return CATALOG.filter(function (p) {
    return (p.name + ' ' + p.tags).toLowerCase().indexOf(q) !== -1;
  });
}

function searchRender(q) {
  var box = document.getElementById('search-results');
  if (!box) return;
  var label = document.getElementById('search-label');
  var hits = searchMatches(q || '');
  if (label) label.textContent = (q || '').trim() ? (hits.length ? 'Results' : 'Results') : 'The Collection';
  var HEART = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>';
  if (!hits.length) {
    box.innerHTML = '<div class="search-empty">Nothing found for "' + q + '". Try the trending searches above.</div>';
    return;
  }
  box.innerHTML = hits.map(function (p) {
    return '<a class="icon-card" href="' + p.page + '">'
      + '<div class="icon-media">'
      + '<button class="card-heart" data-name="' + p.name + '" aria-label="Save ' + p.name + ' to wishlist" '
      + 'onclick="return heartTap(event, \'' + p.name + '\', ' + p.price + ', \'' + p.img + '\', \'' + p.page + '\')">' + HEART + '</button>'
      + '<img src="' + p.img + '" alt="' + p.name + '">'
      + '<div class="icon-veil"><span>Discover</span></div>'
      + '</div>'
      + '<h3>' + p.name + '</h3>'
      + '<div class="price">' + (p.stock ? '$' + p.price : 'Coming Soon') + '</div>'
      + '</a>';
  }).join('');
  wishSync();
}

/* ---------- bag (localStorage) ---------- */

function bagGet() {
  try { return JSON.parse(localStorage.getItem('corsi-lux-bag')) || []; } catch (e) { return []; }
}

function bagSave(items) {
  localStorage.setItem('corsi-lux-bag', JSON.stringify(items));
  bagRender();
}

function bagCount() {
  return bagGet().reduce(function (n, it) { return n + it.qty; }, 0);
}

function bagSubtotal() {
  return bagGet().reduce(function (n, it) { return n + it.price * it.qty; }, 0);
}

function bagRender() {
  var badge = document.getElementById('bag-n');
  if (badge) badge.textContent = bagCount();
  var list = document.getElementById('bag-items');
  if (!list) return;
  var items = bagGet();
  var html = '';
  for (var i = 0; i < items.length; i++) {
    var it = items[i];
    html += '<div class="bag-item">'
      + '<div><div class="bag-item-name">' + it.name + '</div>'
      + '<div class="bag-item-meta">' + (it.size ? 'Size ' + it.size + ' &nbsp;&middot;&nbsp; ' : '') + 'Qty ' + it.qty + '</div>'
      + '<button class="bag-remove" onclick="bagRemove(' + i + ')">Remove</button></div>'
      + '<div class="bag-item-right">$' + (it.price * it.qty).toFixed(2) + '</div>'
      + '</div>';
  }
  list.innerHTML = html;
  document.getElementById('bag-empty').style.display = items.length ? 'none' : 'block';
  document.getElementById('bag-foot').style.display = items.length ? 'block' : 'none';
  var sub = document.getElementById('bag-subtotal');
  if (sub) sub.textContent = '$' + bagSubtotal().toFixed(2);
}

function bagRemove(i) {
  var items = bagGet();
  items.splice(i, 1);
  bagSave(items);
}

function bagCheckout() {
  var items = bagGet();
  if (!items.length) return;
  var lines = items.map(function (it) {
    return '- ' + it.name + (it.size ? ' (size ' + it.size + ')' : '') + ' x' + it.qty + ' = $' + (it.price * it.qty).toFixed(2);
  });
  var body = 'Hi Corsi,\n\nI would like to order:\n\n' + lines.join('\n')
    + '\n\nSubtotal: $' + bagSubtotal().toFixed(2)
    + '\n\nName:\nShipping address:\n';
  location.href = 'mailto:support@felipecorsi.com?subject=' + encodeURIComponent('Corsi order')
    + '&body=' + encodeURIComponent(body);
}

/* ---------- product page ---------- */

function sizeSelect(btn) {
  var pills = btn.parentNode.querySelectorAll('.size-pill');
  pills.forEach(function (p) { p.classList.remove('on'); });
  btn.classList.add('on');
  var err = document.getElementById('size-error');
  if (err) err.classList.remove('show');
}

function addToBag(name, price) {
  var on = document.querySelector('.size-pill.on');
  if (!on) {
    var ss = document.querySelector('.size-select');
    if (ss) ss.open = true;
    var err = document.getElementById('size-error');
    if (err) err.classList.add('show');
    return;
  }
  var size = on.textContent.trim();
  var items = bagGet();
  for (var i = 0; i < items.length; i++) {
    if (items[i].name === name && items[i].size === size) {
      items[i].qty += 1;
      bagSave(items);
      bagToggle(true);
      return;
    }
  }
  items.push({ name: name, price: price, size: size, qty: 1 });
  bagSave(items);
  bagToggle(true);
}

function notifyMe(name) {
  location.href = 'mailto:support@felipecorsi.com?subject=' + encodeURIComponent('Notify me: ' + name)
    + '&body=' + encodeURIComponent('Please let me know when the ' + name + ' is available again.\n');
}

/* ---------- gift card ---------- */

function giftBuy() {
  var on = document.querySelector('.amount-pills .size-pill.on');
  if (!on) {
    var err = document.getElementById('size-error');
    if (err) err.classList.add('show');
    return;
  }
  var amount = on.textContent.trim();
  location.href = 'mailto:support@felipecorsi.com?subject=' + encodeURIComponent('Corsi gift card ' + amount)
    + '&body=' + encodeURIComponent('I would like to purchase a Corsi gift card of ' + amount
    + '.\n\nRecipient name:\nRecipient email:\nMessage (optional):\n');
}

/* ---------- wishlist ---------- */

function wishGet() {
  try { return JSON.parse(localStorage.getItem('corsi-lux-wish')) || []; } catch (e) { return []; }
}

function wishSave(items) {
  localStorage.setItem('corsi-lux-wish', JSON.stringify(items));
  wishSync();
  wishRender();
}

function wishToggle(name, price, img, page) {
  var items = wishGet();
  var kept = items.filter(function (it) { return it.name !== name; });
  if (kept.length === items.length) kept.push({ name: name, price: price, img: img, page: page });
  wishSave(kept);
}

function wishSync() {
  var items = wishGet();
  function saved(name) { return items.some(function (it) { return it.name === name; }); }
  var b = document.getElementById('wish-btn');
  if (b) {
    if (b.classList.contains('wish-heart')) b.classList.toggle('on', saved(b.dataset.name));
    else b.textContent = saved(b.dataset.name) ? 'Saved to Wishlist' : 'Add to Wishlist';
  }
  document.querySelectorAll('.card-heart').forEach(function (h) {
    h.classList.toggle('on', saved(h.dataset.name));
  });
}

function heartTap(e, name, price, img, page) {
  e.preventDefault();
  e.stopPropagation();
  wishToggle(name, price, img, page);
  return false;
}

function wishRender() {
  var grid = document.getElementById('wish-grid');
  if (!grid) return;
  var items = wishGet();
  var html = '';
  for (var i = 0; i < items.length; i++) {
    var it = items[i];
    html += '<div class="icon-card">'
      + '<a href="' + it.page + '"><div class="icon-media">'
      + '<img src="' + it.img + '" alt="' + it.name + '">'
      + '<div class="icon-veil"><span>View</span></div></div>'
      + '<h3>' + it.name + '</h3>'
      + '<div class="price">$' + it.price + '</div></a>'
      + '<button class="wish-remove" onclick="wishToggle(\'' + it.name + '\')">Remove</button>'
      + '</div>';
  }
  grid.innerHTML = html;
  document.getElementById('wish-empty').style.display = items.length ? 'none' : 'block';
  document.getElementById('wish-intro').style.display = items.length ? 'block' : 'none';
}

function accountSubmit(e) {
  e.preventDefault();
  document.getElementById('acct-thanks').style.display = 'block';
  return false;
}

/* ---------- forms ---------- */

function joinHouse(e) {
  e.preventDefault();
  var em = document.getElementById('join-email').value.trim();
  if (!em) return false;
  document.getElementById('join-thanks').style.display = 'block';
  document.getElementById('join-email').value = '';
  location.href = 'mailto:support@felipecorsi.com?subject=' + encodeURIComponent('Waitlist')
    + '&body=' + encodeURIComponent('Please add ' + em + ' to the Corsi waitlist.');
  return false;
}

function contactSend(e) {
  e.preventDefault();
  var name = document.getElementById('c-name').value.trim();
  var email = document.getElementById('c-email').value.trim();
  var msg = document.getElementById('c-msg').value.trim();
  document.getElementById('c-thanks').style.display = 'block';
  location.href = 'mailto:support@felipecorsi.com?subject=' + encodeURIComponent('Corsi inquiry from ' + (name || 'the website'))
    + '&body=' + encodeURIComponent(msg + '\n\n' + name + '\n' + email);
  return false;
}

/* ---------- header, reveals, film ---------- */

document.addEventListener('DOMContentLoaded', function () {
  bagRender();
  wishSync();
  wishRender();

  var si = document.getElementById('search-input');
  if (si) {
    searchRender('');
    si.addEventListener('input', function () { searchRender(si.value); });
    si.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        var first = document.querySelector('#search-results .icon-card');
        if (first) location.href = first.getAttribute('href');
      }
    });
  }

  var bar = document.getElementById('top-bar');
  var clearTop = document.body.classList.contains('clear-top');
  var lastY = scrollY;
  addEventListener('scroll', function () {
    var y = scrollY;
    /* backdrop: product pages go solid almost immediately, hero pages after the hero */
    bar.classList.toggle('scrolled', y > (clearTop ? 24 : innerHeight * 0.82));
    /* product pages: header is part of the page (scrolls away naturally),
       comes back fixed on scroll up, back to normal at the top */
    if (clearTop) {
      if (y <= 8) {
        bar.classList.add('no-anim');
        bar.classList.remove('pinned', 'hidden');
        requestAnimationFrame(function () { bar.classList.remove('no-anim'); });
      } else if (y < lastY - 1) {
        if (!bar.classList.contains('pinned')) {
          bar.classList.add('no-anim', 'pinned', 'hidden');
          void bar.offsetHeight;
          bar.classList.remove('no-anim');
          requestAnimationFrame(function () { bar.classList.remove('hidden'); });
        } else {
          bar.classList.remove('hidden');
        }
      } else if (y > lastY + 1 && bar.classList.contains('pinned')) {
        bar.classList.add('hidden');
      }
    }
    lastY = y;
  }, { passive: true });

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.14 });
  document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });

  var film = document.getElementById('film');
  if (film) {
    var filmWrap = film.parentElement;
    var fio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          /* always start clean from the first frame, never mid-fade */
          filmWrap.classList.remove('fading');
          try { film.currentTime = 0; } catch (err) {}
          film.play().catch(function () {});
        } else { film.pause(); }
      });
    }, { threshold: 0.35 });
    fio.observe(film);

    film.addEventListener('timeupdate', function () {
      if (!film.duration) return;
      var t = film.currentTime;
      if (film.duration - t < 1.1) filmWrap.classList.add('fading');
      else if (t > 0.7) filmWrap.classList.remove('fading');
      /* between 0 and 0.7s neither fires, so the grey holds after the loop */
    });
  }
});

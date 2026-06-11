/* Kanata HVAC — shared interactions */
(function(){
  'use strict';

  // sticky header shadow on scroll
  var nav = document.getElementById('nav');
  function onScroll(){
    if(!nav) return;
    nav.classList.toggle('scrolled', window.scrollY > 8);
  }
  window.addEventListener('scroll', onScroll, { passive:true });
  onScroll();

  // mobile menu
  var ham = document.getElementById('hamburger');
  var menu = document.getElementById('mobileMenu');
  var scrim = document.getElementById('scrim');
  var close = document.getElementById('mmClose');
  function openMenu(){
    menu.classList.add('open'); scrim.classList.add('open');
    menu.style.display = 'flex'; scrim.style.display = 'block';
    if(ham) ham.setAttribute('aria-expanded','true');
    document.body.style.overflow = 'hidden';
  }
  function closeMenu(){
    menu.classList.remove('open'); scrim.classList.remove('open');
    if(ham) ham.setAttribute('aria-expanded','false');
    document.body.style.overflow = '';
    setTimeout(function(){ if(!menu.classList.contains('open')){ menu.style.display=''; scrim.style.display=''; } }, 320);
  }
  if(ham) ham.addEventListener('click', openMenu);
  if(close) close.addEventListener('click', closeMenu);
  if(scrim) scrim.addEventListener('click', closeMenu);
  if(menu) menu.querySelectorAll('a').forEach(function(a){ a.addEventListener('click', closeMenu); });
  window.addEventListener('keydown', function(e){ if(e.key === 'Escape') closeMenu(); });

  // reveal on scroll
  var reveals = document.querySelectorAll('.reveal');
  if('IntersectionObserver' in window && reveals.length){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if(en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold:0.12, rootMargin:'0px 0px -40px 0px' });
    reveals.forEach(function(el, i){
      el.style.transitionDelay = ((i % 4) * 60) + 'ms';
      io.observe(el);
    });
  } else {
    reveals.forEach(function(el){ el.classList.add('in'); });
  }

  // ---- quote forms (contact page + hero lead form) ----
  var quoteForms = document.querySelectorAll('form[data-quote-form]');
  quoteForms.forEach(function(form){
    var fields = form.querySelectorAll('[data-required]');
    function setError(field, msg){
      var wrap = field.closest('.field');
      if(!wrap) return;
      var err = wrap.querySelector('.field-error');
      if(msg){ wrap.classList.add('has-error'); if(err) err.textContent = msg; }
      else { wrap.classList.remove('has-error'); if(err) err.textContent = ''; }
    }
    function validateField(field){
      var v = (field.value || '').trim();
      if(!v){ setError(field, 'This field is required.'); return false; }
      if(field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)){ setError(field, 'Enter a valid email address.'); return false; }
      if(field.type === 'tel' && v.replace(/[^0-9]/g,'').length < 10){ setError(field, 'Enter a valid phone number.'); return false; }
      setError(field, '');
      return true;
    }
    fields.forEach(function(f){
      f.addEventListener('blur', function(){ validateField(f); });
      f.addEventListener('input', function(){ if(f.closest('.field').classList.contains('has-error')) validateField(f); });
    });
    form.addEventListener('submit', function(e){
      e.preventDefault();
      var ok = true;
      fields.forEach(function(f){ if(!validateField(f)) ok = false; });
      if(!ok){
        var firstErr = form.querySelector('.has-error [data-required]');
        if(firstErr) firstErr.focus();
        return;
      }
      // success state (placeholder — wire to email backend later)
      form.classList.add('sent');
      var success = form.querySelector('.form-success');
      if(success){ success.hidden = false; }
      var body = form.querySelector('.form-body');
      if(body){ body.hidden = true; }
    });
  });
})();


/* Kanata HVAC — live Google reviews feed */
(function(){
  var grid = document.getElementById('reviewsGrid');
  if(!grid) return;
  function esc(s){ return (s==null?'':String(s)).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  fetch('/api/reviews').then(function(r){ return r.json(); }).then(function(d){
    if(!d || !d.reviews || !d.reviews.length) return;
    grid.innerHTML = d.reviews.slice(0,6).map(function(rv){
      var n = Math.max(1, Math.min(5, Math.round(rv.rating || 5)));
      var stars = '\u2605\u2605\u2605\u2605\u2605'.slice(0, n);
      var text = esc(rv.text);
      if(text.length > 320){ text = text.slice(0,300).replace(/\s+\S*$/,'') + '\u2026'; }
      return '<figure class="review-card reveal in">'
        + '<div class="stars" aria-label="'+n+' out of 5 stars">'+stars+'</div>'
        + '<blockquote>'+text+'</blockquote>'
        + '<figcaption><span class="rv-avatar" aria-hidden="true">'+esc(rv.initial||'G')+'</span>'
        + '<div><strong>'+esc(rv.author)+'</strong><span>'+esc(rv.when)+'</span></div></figcaption>'
        + '</figure>';
    }).join('');
    var sum = document.getElementById('reviewsSummary');
    if(sum && d.rating){ sum.textContent = d.rating.toFixed(1) + ' \u2605 average \u00b7 ' + (d.total||0) + ' Google reviews'; }
  }).catch(function(){});
})();

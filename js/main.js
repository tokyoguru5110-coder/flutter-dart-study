// ナビゲーション: スクロールでスタイル変更
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.style.borderBottomColor = window.scrollY > 10
    ? 'rgba(0,0,0,.12)'
    : 'rgba(0,0,0,.08)';
}, { passive: true });

// ハンバーガーメニュー
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

hamburger.addEventListener('click', () => {
  const isOpen = mobileMenu.classList.toggle('open');
  hamburger.setAttribute('aria-expanded', isOpen);
});

mobileMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
  });
});

// レッスンカードの開閉
document.querySelectorAll('.lesson-toggle').forEach(btn => {
  btn.addEventListener('click', () => {
    const card = btn.closest('.lesson-card');
    const body = card.querySelector('.lesson-body');
    const isOpen = body.classList.toggle('open');
    btn.classList.toggle('open', isOpen);
    btn.textContent = isOpen ? '閉じる ↑' : '詳しく見る ↓';
  });
});

// フェードイン (Intersection Observer)
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.card, .lesson-card, .practice-card, .roadmap, .step-item').forEach(el => {
  el.classList.add('fade-in');
  observer.observe(el);
});

// アクティブナビリンク
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');

const navObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.getAttribute('id');
      navLinks.forEach(a => {
        a.style.color = a.getAttribute('href') === `#${id}`
          ? 'var(--accent)'
          : '';
      });
    }
  });
}, { rootMargin: '-40% 0px -55% 0px' });

sections.forEach(s => navObserver.observe(s));

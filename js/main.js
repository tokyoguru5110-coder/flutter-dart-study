// ========== ナビゲーション ==========
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.style.borderBottomColor = window.scrollY > 10
    ? 'rgba(0,0,0,.12)'
    : 'rgba(0,0,0,.08)';
}, { passive: true });

const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
hamburger.addEventListener('click', () => {
  mobileMenu.classList.toggle('open');
});
mobileMenu.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => mobileMenu.classList.remove('open'));
});

// ========== レッスン開閉 ==========
document.querySelectorAll('.lesson-toggle').forEach(btn => {
  btn.addEventListener('click', () => {
    const card = btn.closest('.lesson-card');
    const body = card.querySelector('.lesson-body');
    const isOpen = body.classList.toggle('open');
    btn.classList.toggle('open', isOpen);
    btn.textContent = isOpen ? '閉じる ↑' : '詳しく見る ↓';

    if (isOpen) {
      card.querySelectorAll('.CodeMirror').forEach(cm => cm.CodeMirror.refresh());
    }
  });
});

// ========== CodeMirror 初期化 ==========
const editors = new Map();

document.querySelectorAll('.dart-editor').forEach(textarea => {
  const originalCode = textarea.value;
  const cm = CodeMirror.fromTextArea(textarea, {
    mode: 'text/x-java',
    theme: 'dracula',
    lineNumbers: true,
    indentUnit: 2,
    tabSize: 2,
    lineWrapping: false,
    extraKeys: {
      Tab: cm => cm.execCommand('insertSoftTab'),
    },
  });
  cm.setSize('100%', 'auto');
  editors.set(textarea, { cm, originalCode });
});

// ========== ヒントボタン ==========
document.querySelectorAll('.ex-hint-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const wrap = btn.closest('.ex-editor-wrap');
    const hintBox = wrap.querySelector('.ex-hint-box');
    if (hintBox.style.display === 'none') {
      hintBox.textContent = btn.dataset.hint;
      hintBox.style.display = 'block';
      btn.textContent = '💡 ヒントを隠す';
    } else {
      hintBox.style.display = 'none';
      btn.textContent = '💡 ヒント';
    }
  });
});

// ========== リセットボタン ==========
document.querySelectorAll('.ex-reset-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const wrap = btn.closest('.ex-editor-wrap');
    const textarea = wrap.querySelector('.dart-editor');
    const entry = editors.get(textarea);
    if (entry) {
      entry.cm.setValue(entry.originalCode);
    }
    const outputText = wrap.querySelector('.ex-output-text');
    const status = wrap.querySelector('.ex-status');
    outputText.textContent = '▶ 実行ボタンを押すと、ここに結果が表示されます';
    outputText.className = 'ex-output-text placeholder';
    status.textContent = '';
    status.className = 'ex-status';
  });
});

// ========== 実行ボタン (Piston API) ==========
document.querySelectorAll('.ex-run-btn').forEach(btn => {
  btn.addEventListener('click', async () => {
    const wrap = btn.closest('.ex-editor-wrap');
    const textarea = wrap.querySelector('.dart-editor');
    const entry = editors.get(textarea);
    const outputText = wrap.querySelector('.ex-output-text');
    const status = wrap.querySelector('.ex-status');
    const expected = textarea.dataset.expected;

    if (!entry) return;

    const code = entry.cm.getValue();

    btn.textContent = '実行中...';
    btn.classList.add('loading');
    btn.disabled = true;

    outputText.className = 'ex-output-text';
    outputText.textContent = '実行中...';
    status.textContent = '';
    status.className = 'ex-status';

    try {
      const res = await fetch('https://emkc.org/api/v2/piston/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: 'dart',
          version: '*',
          files: [{ name: 'main.dart', content: code }],
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      const stdout = (data.run?.stdout ?? '').trimEnd();
      const stderr = (data.run?.stderr ?? '').trimEnd();
      const exitCode = data.run?.code ?? -1;

      if (exitCode !== 0 || stderr) {
        outputText.textContent = stderr || stdout || 'エラーが発生しました';
        outputText.className = 'ex-output-text has-error';
        status.textContent = 'エラー';
        status.className = 'ex-status error';
      } else {
        outputText.textContent = stdout || '（出力なし）';
        outputText.className = 'ex-output-text';

        if (expected && stdout.trim() === expected.trim()) {
          status.textContent = '✓ 正解！';
          status.className = 'ex-status success';
        } else if (expected) {
          status.textContent = '実行完了';
          status.className = 'ex-status';
        } else {
          status.textContent = '実行完了';
          status.className = 'ex-status';
        }
      }
    } catch (err) {
      outputText.textContent = 'ネットワークエラー: コードを実行できませんでした。\nインターネット接続を確認してください。';
      outputText.className = 'ex-output-text has-error';
      status.textContent = 'エラー';
      status.className = 'ex-status error';
    } finally {
      btn.textContent = '▶ 実行';
      btn.classList.remove('loading');
      btn.disabled = false;
    }
  });
});

// ========== フェードイン ==========
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      observer.unobserve(e.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.card, .lesson-card, .practice-card, .roadmap').forEach(el => {
  el.classList.add('fade-in');
  observer.observe(el);
});

// ========== アクティブナビ ==========
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');

const navObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const id = e.target.getAttribute('id');
      navLinks.forEach(a => {
        a.style.color = a.getAttribute('href') === `#${id}` ? 'var(--accent)' : '';
      });
    }
  });
}, { rootMargin: '-40% 0px -55% 0px' });

sections.forEach(s => navObserver.observe(s));

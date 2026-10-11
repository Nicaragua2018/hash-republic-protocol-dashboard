import React, { useState } from 'react';

const targets = (url, text) => {
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(text);
  return [
    { name: 'WhatsApp', href: `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}` },
    { name: 'Telegram', href: `https://t.me/share/url?url=${u}&text=${t}` },
    { name: 'X', href: `https://x.com/intent/post?text=${t}&url=${u}` },
    { name: 'LinkedIn', href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}` },
    { name: 'Facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${u}` },
  ];
};

export default function ShareBar({ url, text, label = 'Compartir' }) {
  const [copied, setCopied] = useState(false);
  const canNativeShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt('Copia este enlace:', url);
    }
  };

  const nativeShare = () => navigator.share({ text, url }).catch(() => {});

  return (
    <div className="oc-share" role="group" aria-label={label}>
      <span className="oc-share__label">{label}:</span>
      {canNativeShare && (
        <button type="button" className="oc-share__btn oc-share__btn--primary" onClick={nativeShare}>
          Compartir…
        </button>
      )}
      {targets(url, text).map((t) => (
        <a key={t.name} className="oc-share__btn" href={t.href} target="_blank" rel="noopener noreferrer">
          {t.name}
        </a>
      ))}
      <button type="button" className="oc-share__btn" onClick={copy} aria-live="polite">
        {copied ? 'Enlace copiado ✓' : 'Copiar enlace'}
      </button>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import ShareBar from './ShareBar';
import { COMMENTS_HOST, COMMENTS_SITE_ID, commentAnchor } from '../content/comments';

const MAX_QUOTE = 240;
const excerpt = (s) => (s.length > MAX_QUOTE ? s.slice(0, MAX_QUOTE).trimEnd() + '…' : s);

// Comments pinned by an admin in Remark42, shown above the thread with
// their own share buttons. The link carries the comment's anchor, so it
// opens the article scrolled to that comment.
export default function PinnedComments({ url, title }) {
  const [pinned, setPinned] = useState([]);

  useEffect(() => {
    let alive = true;
    const api = `${COMMENTS_HOST}/api/v1/find?site=${COMMENTS_SITE_ID}&url=${encodeURIComponent(url)}&format=plain`;
    fetch(api)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (alive && data) setPinned((data.comments || []).filter((c) => c.pin && !c.delete));
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [url]);

  if (!pinned.length) return null;

  return (
    <div style={{ marginBottom: 32 }}>
      <h3 style={{ fontSize: '1.1rem' }}>Comentario destacado</h3>
      {pinned.map((c) => {
        // `orig` is the plain text the person typed; rendering it as text
        // (never as HTML) keeps visitor input from injecting markup here.
        const quote = excerpt((c.orig || '').trim());
        const name = c.user?.name || 'Anónimo';
        return (
          <figure
            key={c.id}
            className="oc-card"
            style={{ borderLeft: '4px solid var(--oc-yellow)', margin: '0 0 16px' }}
          >
            <blockquote style={{ margin: 0, fontSize: '1.02rem', lineHeight: 1.65, whiteSpace: 'pre-line' }}>
              «{quote}»
            </blockquote>
            <figcaption style={{ fontSize: '0.88rem', opacity: 0.75, margin: '10px 0 14px' }}>
              — {name} · <a href={commentAnchor(c.id)}>ver en la conversación</a>
            </figcaption>
            <ShareBar
              label="Compartir este comentario"
              url={url + commentAnchor(c.id)}
              text={`«${quote}» — ${name}, sobre "${title}"`}
            />
          </figure>
        );
      })}
    </div>
  );
}

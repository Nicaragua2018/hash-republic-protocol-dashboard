import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPostBySlug } from '../content/posts';
import Seo from '../components/Seo';
import { getPostMeta } from '../content/seo';
import { formatDate } from '../content/format';
import ShareBar from '../components/ShareBar';
import PinnedComments from '../components/PinnedComments';
import Comments from '../components/Comments';
import SuscripcionForm from '../components/SuscripcionForm';
import NotFound from './NotFound';

function Inline({ tokens }) {
  return tokens.map((tok, i) => {
    if (tok.t === 'strong') return <strong key={i}>{tok.v}</strong>;
    if (tok.t === 'em') return <em key={i}>{tok.v}</em>;
    if (tok.t === 'link') {
      const label = tok.children ? <Inline tokens={tok.children} /> : tok.v;
      // Site pages use the router, anchors stay on the page, and only web
      // and mail links leave it — anything else (javascript:, data:) is
      // shown as plain text rather than turned into a link.
      if (tok.url.startsWith('/'))
        return (
          <Link key={i} to={tok.url}>
            {label}
          </Link>
        );
      if (tok.url.startsWith('#'))
        return (
          <a key={i} href={tok.url}>
            {label}
          </a>
        );
      if (/^mailto:/i.test(tok.url))
        return (
          <a key={i} href={tok.url}>
            {label}
          </a>
        );
      if (!/^https?:\/\//i.test(tok.url)) return <React.Fragment key={i}>{label}</React.Fragment>;
      return (
        <a key={i} href={tok.url} target="_blank" rel="noopener noreferrer">
          {label}
        </a>
      );
    }
    return <React.Fragment key={i}>{tok.v}</React.Fragment>;
  });
}

export default function BlogPost() {
  const { slug } = useParams();
  const post = getPostBySlug(slug);

  if (!post) return <NotFound />;

  const meta = getPostMeta(post);

  return (
    <>
      <Seo {...meta} />
      <section className="oc-section oc-hero" style={{ paddingTop: 56, paddingBottom: 0 }}>
        <div className="oc-hero-bees" aria-hidden="true" />
        <div className="oc-container" style={{ position: 'relative', maxWidth: 760 }}>
          <Link to="/blog" style={{ fontSize: '0.9rem', fontWeight: 600 }}>
            &larr; Volver al blog
          </Link>
          <h1 className="oc-h1" style={{ marginTop: 16 }}>
            {post.title}
          </h1>
          <p className="oc-lede">{post.dek}</p>
          <p style={{ fontSize: '0.85rem', color: 'var(--oc-ink)', opacity: 0.7, marginBottom: 4 }}>
            {post.author} · {formatDate(post.date)}
          </p>
          <a href="#comentarios" className="oc-share__btn" style={{ margin: '8px 0 12px' }}>
            Comentar ↓
          </a>
          {post.aiAssisted && (
            <p style={{ fontSize: '0.8rem', color: 'var(--oc-ink)', opacity: 0.7 }}>
              Texto asistido por IA, con revisión y autorización humana antes de publicarse.
            </p>
          )}
        </div>
      </section>

      <section className="oc-section" style={{ paddingTop: 32 }}>
        <div className="oc-container oc-prose">
          {post.image && (
            <img
              src={post.image}
              alt={post.imageAlt}
              className="oc-illustration"
              style={{ width: '100%', marginBottom: 32 }}
            />
          )}
          {post.body.map((block, i) => {
            if (block.type === 'h2') return <h2 key={i}>{block.text}</h2>;
            if (block.type === 'h3')
              return (
                <h3 key={i} style={{ fontSize: '1.15rem', marginTop: '1.4em' }}>
                  {block.text}
                </h3>
              );
            if (block.type === 'p')
              return (
                <p key={i}>
                  <Inline tokens={block.inlines} />
                </p>
              );
            if (block.type === 'img') {
              return (
                <img
                  key={i}
                  src={block.src}
                  alt={block.alt}
                  className="oc-illustration"
                  style={{ width: '100%', margin: '16px 0 24px' }}
                />
              );
            }
            if (block.type === 'table') {
              return (
                <div key={i} style={{ overflowX: 'auto', margin: '8px 0 24px' }}>
                  <table className="oc-table">
                    <thead>
                      <tr>
                        {block.head.map((cell, j) => (
                          <th key={j}>
                            <Inline tokens={cell} />
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {block.rows.map((row, r) => (
                        <tr key={r}>
                          {row.map((cell, j) => (
                            <td key={j}>
                              <Inline tokens={cell} />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            }
            if (block.type === 'ul') {
              return (
                <ul key={i} style={{ paddingLeft: 20, lineHeight: 1.7, marginBottom: '1em' }}>
                  {block.items.map((item, j) => (
                    <li key={j} style={{ marginBottom: 6 }}>
                      <Inline tokens={item} />
                    </li>
                  ))}
                </ul>
              );
            }
            if (block.type === 'sources') {
              return (
                <div
                  key={i}
                  className="oc-card"
                  style={{ borderLeft: '4px solid var(--oc-yellow)', marginTop: 32 }}
                >
                  <h3 style={{ fontSize: '1rem', marginBottom: 12 }}>Fuentes</h3>
                  {block.parts.map((part, j) =>
                    part.note ? (
                      <p key={j} style={{ fontSize: '0.9rem' }}>
                        <Inline tokens={part.note} />
                      </p>
                    ) : (
                      <ul key={j} style={{ paddingLeft: 20, margin: '0 0 12px' }}>
                        {part.items.map((item, k) => (
                          <li key={k} style={{ fontSize: '0.9rem', marginBottom: 8 }}>
                            <Inline tokens={item} />
                          </li>
                        ))}
                      </ul>
                    )
                  )}
                </div>
              );
            }
            return null;
          })}

          <div style={{ marginTop: 40, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <Link to="/proyectos/hash-republic-protocol" className="oc-btn oc-btn--primary">
              Ver el Hash Republic Protocol
            </Link>
            <Link to="/blog" className="oc-btn oc-btn--outline">
              Volver al blog
            </Link>
          </div>
        </div>
      </section>

      <section className="oc-section oc-section--mist" style={{ paddingTop: 40 }}>
        <div className="oc-container oc-prose">
          <div style={{ marginBottom: 40 }}>
            <ShareBar label="Compartir este artículo" url={meta.url} text={post.title} />
          </div>
          <div style={{ marginBottom: 40 }}>
            <SuscripcionForm />
          </div>
          <h2 id="comentarios" style={{ marginTop: 0 }}>
            Comentarios
          </h2>
          <p style={{ fontSize: '0.92rem' }}>
            Puedes comentar con un seudónimo. No compartas datos que permitan identificarte a ti o a otras
            personas en riesgo.
          </p>
          <PinnedComments url={meta.url} title={post.title} />
          <Comments url={meta.url} title={post.title} />
        </div>
      </section>
    </>
  );
}

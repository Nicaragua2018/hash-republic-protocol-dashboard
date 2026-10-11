import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPostBySlug } from '../content/posts';
import Seo from '../components/Seo';
import { getPostMeta } from '../content/seo';
import NotFound from './NotFound';

const formatDate = (iso) =>
  new Date(iso + 'T00:00:00').toLocaleDateString('es', { year: 'numeric', month: 'long', day: 'numeric' });

function Inline({ tokens }) {
  return tokens.map((tok, i) => {
    if (tok.t === 'strong') return <strong key={i}>{tok.v}</strong>;
    if (tok.t === 'em') return <em key={i}>{tok.v}</em>;
    if (tok.t === 'link') {
      const label = tok.children ? <Inline tokens={tok.children} /> : tok.v;
      if (tok.url.startsWith('/')) return <Link key={i} to={tok.url}>{label}</Link>;
      return (
        <a key={i} href={tok.url} target="_blank" rel="noreferrer">
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

  return (
    <>
      <Seo {...getPostMeta(post)} />
      <section className="oc-section oc-hero" style={{ paddingTop: 56, paddingBottom: 0 }}>
        <div className="oc-hero-bees" aria-hidden="true" />
        <div className="oc-container" style={{ position: 'relative', maxWidth: 760 }}>
          <Link to="/blog" style={{ fontSize: '0.9rem', fontWeight: 600 }}>&larr; Volver al blog</Link>
          <h1 className="oc-h1" style={{ marginTop: 16 }}>{post.title}</h1>
          <p className="oc-lede">{post.dek}</p>
          <p style={{ fontSize: '0.85rem', color: 'var(--oc-ink)', opacity: 0.7, marginBottom: 4 }}>
            {post.author} · {formatDate(post.date)}
          </p>
          {post.aiAssisted && (
            <p style={{ fontSize: '0.8rem', color: 'var(--oc-ink)', opacity: 0.7 }}>
              Redactado con asistencia de IA a partir de documentos de OpenCivic, y revisado y
              aprobado por una persona antes de publicarse.
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
            if (block.type === 'p') return <p key={i}><Inline tokens={block.inlines} /></p>;
            if (block.type === 'ul') {
              return (
                <ul key={i} style={{ paddingLeft: 20, lineHeight: 1.7, marginBottom: '1em' }}>
                  {block.items.map((item, j) => (
                    <li key={j} style={{ marginBottom: 6 }}><Inline tokens={item} /></li>
                  ))}
                </ul>
              );
            }
            if (block.type === 'sources') {
              return (
                <div key={i} className="oc-card" style={{ borderLeft: '4px solid var(--oc-yellow)', marginTop: 32 }}>
                  <h3 style={{ fontSize: '1rem', marginBottom: 12 }}>Fuentes</h3>
                  {block.notes.map((note, j) => (
                    <p key={j} style={{ fontSize: '0.9rem' }}><Inline tokens={note} /></p>
                  ))}
                  <ul style={{ paddingLeft: 20, margin: 0 }}>
                    {block.items.map((item, j) => (
                      <li key={j} style={{ fontSize: '0.9rem', marginBottom: 8 }}><Inline tokens={item} /></li>
                    ))}
                  </ul>
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
    </>
  );
}

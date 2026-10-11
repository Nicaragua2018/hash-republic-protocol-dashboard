import React from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { getPostBySlug } from '../content/posts';

const formatDate = (iso) =>
  new Date(iso + 'T00:00:00').toLocaleDateString('es', { year: 'numeric', month: 'long', day: 'numeric' });

export default function BlogPost() {
  const { slug } = useParams();
  const post = getPostBySlug(slug);

  if (!post) return <Navigate to="/blog" replace />;

  return (
    <>
      <section className="oc-section oc-hero" style={{ paddingTop: 56, paddingBottom: 0 }}>
        <div className="oc-hero-bees" aria-hidden="true" />
        <div className="oc-container" style={{ position: 'relative', maxWidth: 760 }}>
          <Link to="/blog" style={{ fontSize: '0.9rem', fontWeight: 600 }}>&larr; Volver al blog</Link>
          <h1 className="oc-h1" style={{ marginTop: 16 }}>{post.title}</h1>
          <p className="oc-lede">{post.dek}</p>
          <p style={{ fontSize: '0.85rem', color: 'var(--oc-ink)', opacity: 0.7 }}>
            {post.author} · {formatDate(post.date)}
          </p>
        </div>
      </section>

      <section className="oc-section" style={{ paddingTop: 32 }}>
        <div className="oc-container oc-prose">
          {post.body.map((block, i) => {
            if (block.type === 'h2') return <h2 key={i}>{block.text}</h2>;
            if (block.type === 'p') return <p key={i}>{block.text}</p>;
            if (block.type === 'sources') {
              return (
                <div key={i} className="oc-card" style={{ borderLeft: '4px solid var(--oc-yellow)', marginTop: 32 }}>
                  <h3 style={{ fontSize: '1rem', marginBottom: 12 }}>Fuentes</h3>
                  <ul style={{ paddingLeft: 20, margin: 0 }}>
                    {block.items.map((item, j) => (
                      <li key={j} style={{ fontSize: '0.9rem', marginBottom: 8 }}>{item}</li>
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

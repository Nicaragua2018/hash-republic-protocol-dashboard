// Remark42 runs on the same VPS, routed by Traefik under /comentarios
// (see docker-compose.yml). SITE_ID must match its SITE setting.
export const COMMENTS_HOST = 'https://opencivicsolutions.org/comentarios';
export const COMMENTS_SITE_ID = 'opencivic';

export const commentAnchor = (id) => `#remark42__comment-${id}`;

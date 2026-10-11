import React, { useEffect } from 'react';
import { COMMENTS_HOST, COMMENTS_SITE_ID } from '../content/comments';

const SCRIPT_ATTR = 'data-remark42-embed';

// Remark42's embed script renders into the element with id="remark42",
// reading window.remark_config. It initializes itself once on load; on a
// client-side move to another article we call createInstance again and
// destroy the old instance on unmount.
export default function Comments({ url, title }) {
  useEffect(() => {
    window.remark_config = {
      host: COMMENTS_HOST,
      site_id: COMMENTS_SITE_ID,
      url,
      page_title: title,
      locale: 'es',
      theme: 'light',
      components: ['embed'],
    };

    if (window.REMARK42?.createInstance) {
      window.REMARK42.createInstance(window.remark_config);
    } else if (!document.querySelector(`script[${SCRIPT_ATTR}]`)) {
      const script = document.createElement('script');
      script.src = `${COMMENTS_HOST}/web/embed.js`;
      script.defer = true;
      script.setAttribute(SCRIPT_ATTR, '');
      document.head.appendChild(script);
    }

    return () => {
      window.REMARK42?.destroy?.();
    };
  }, [url, title]);

  return <div id="remark42" />;
}

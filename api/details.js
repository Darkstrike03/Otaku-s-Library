import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  const { uid } = req.query;

  if (!uid) {
    return res.status(400).json({ error: 'UID required' });
  }

  try {
    // Get the last letter to determine table
    const lastLetter = uid.charAt(uid.length - 1).toUpperCase();
    
    const tableMapping = {
      'A': 'Ani_data',
      'M': 'Manga_data',
      'H': 'Manhwa_data',
      'U': 'Manhua_data',
      'D': 'Donghua_data',
      'W': 'Webnovel_data',
    };

    const table = tableMapping[lastLetter];
    if (!table) {
      return res.status(404).send('Table not found');
    }

    // Fetch from Supabase
    const { data: animeData, error } = await supabase
      .from(table)
      .select('*')
      .eq('uid', uid)
      .single();

    if (error || !animeData) {
      return res.status(404).send('Anime not found');
    }

    // Generate meta tags HTML
    const synopsis = (animeData.synopsis || animeData.syn || 'Discover this amazing content').substring(0, 160);
    const image = animeData.poster || animeData.poster || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1200';

    const html = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>${escapeHtml(animeData.title)} | Otaku's Library</title>
          <meta name="description" content="${escapeHtml(synopsis)}" />
          <meta name="keywords" content="${animeData.type}, anime, manga, ${escapeHtml((animeData.genre || '').toString())}" />
          
          <!-- Open Graph / Facebook -->
          <meta property="og:type" content="website" />
          <meta property="og:url" content="https://www.otaku-s-library.vercel.app/details/${uid}" />
          <meta property="og:title" content="${escapeHtml(animeData.title)} | Otaku's Library" />
          <meta property="og:description" content="${escapeHtml(synopsis)}" />
          <meta property="og:image" content="${image}" />
          <meta property="og:image:width" content="1200" />
          <meta property="og:image:height" content="630" />
          
          <!-- Twitter -->
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:url" content="https://www.otaku-s-library.vercel.app/details/${uid}" />
          <meta name="twitter:title" content="${escapeHtml(animeData.title)} | Otaku's Library" />
          <meta name="twitter:description" content="${escapeHtml(synopsis)}" />
          <meta name="twitter:image" content="${image}" />
          
          <!-- Structured Data (JSON-LD) -->
          <script type="application/ld+json">
            {
              "@context": "https://schema.org",
              "@type": "CreativeWork",
              "name": "${escapeHtml(animeData.title)}",
              "description": "${escapeHtml(synopsis)}",
              "image": "${image}",
              "url": "https://www.otaku-s-library.vercel.app/details/${uid}",
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "${animeData.rating || 0}",
                "bestRating": "10"
              }
            }
          </script>
          
          <!-- Preload React app -->
          <link rel="preload" href="/index.html" as="document" />
          
          <!-- Redirect to React app after bots crawl -->
          <script>
            if (navigator.userAgent.includes('Googlebot') || navigator.userAgent.includes('Bingbot')){
            window.location.href = '/details/${uid}';
            }
          </script>
        </head>
        <body>
          <noscript>Loading...</noscript>
        </body>
      </html>
    `;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    return res.send(html);
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}

function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

}


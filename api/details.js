import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

let cachedIndexHtml = null;

function getIndexHtml() {
  if (cachedIndexHtml) {
    return cachedIndexHtml;
  }

  try {
    // Try to read the built index.html
    const indexPath = path.join(process.cwd(), '.next') || 
                     path.join(process.cwd(), 'build') || 
                     path.join(process.cwd(), 'olib/build');
    
    const filePath = path.join(indexPath, 'index.html');
    if (fs.existsSync(filePath)) {
      cachedIndexHtml = fs.readFileSync(filePath, 'utf-8');
      return cachedIndexHtml;
    }
  } catch (err) {
    console.error('Error reading index.html:', err);
  }

  // Fallback minimal HTML
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
</head>
<body>
  <div id="root"></div>
</body>
</html>`;
}

export default async function handler(req, res) {
  const { uid } = req.query;

  if (!uid) {
    return res.status(400).json({ error: 'UID required' });
  }

  try {
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

    const { data: animeData, error } = await supabase
      .from(table)
      .select('*')
      .eq('uid', uid)
      .single();

    if (error || !animeData) {
      return res.status(404).send('Anime not found');
    }

    const synopsis = (animeData.synopsis || animeData.syn || 'Discover this amazing content').substring(0, 160);
    const image = animeData.banner || animeData.poster || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1200';

    // Get the base index.html
    let baseHtml = getIndexHtml();

    // Inject meta tags into the head
    const metaTags = `
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
    <meta property="og:site_name" content="Otaku's Library" />
    
    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:url" content="https://www.otaku-s-library.vercel.app/details/${uid}" />
    <meta name="twitter:title" content="${escapeHtml(animeData.title)} | Otaku's Library" />
    <meta name="twitter:description" content="${escapeHtml(synopsis)}" />
    <meta name="twitter:image" content="${image}" />
    <meta name="twitter:creator" content="@otakus_library" />
    
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
    
    <title>${escapeHtml(animeData.title)} | Otaku's Library</title>
    `;

    // Insert meta tags before closing head tag
    const html = baseHtml.replace('</head>', metaTags + '</head>');

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
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

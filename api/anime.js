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
      return res.status(404).json({ error: 'Table not found' });
    }

    const { data: animeData, error } = await supabase
      .from(table)
      .select('*')
      .eq('uid', uid)
      .single();

    if (error || !animeData) {
      return res.status(404).json({ error: 'Anime not found' });
    }

    res.setHeader('Cache-Control', 'public, max-age=3600');
    return res.status(200).json(animeData);
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}
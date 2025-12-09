import { supabase } from '@/supabaseClient';

export const getJsonFile = async (uid) => {
  if (!uid) return null;

  const lastLetter = uid.charAt(uid.length - 1).toUpperCase();

  // Map last letter to table name
  const tableMap = {
    A: 'Ani_data',
    M: 'Manga_data',
    H: 'Manhwa_data',
    U: 'Manhua_data',
    D: 'Donghua_data',
    W: 'Webnovel_data',
  };

  const tableName = tableMap[lastLetter];
  if (!tableName) return null;

  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .eq('uid', uid)
      .single();

    if (error || !data) {
      console.error('Error fetching data:', error);
      return null;
    }

    return { item: data };
  } catch (error) {
    console.error('Unexpected error:', error);
    return null;
  }
};
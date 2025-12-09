import { supabase } from '../../supabaseClient'; // Import Supabase client

export const getJsonFile = async (uid) => {
  if (!uid) {
    console.error('UID is required');
    return null;
  }

  // Extract the last letter and convert to uppercase
  const lastLetter = uid.charAt(uid.length - 1).toUpperCase();

  // Map last letter to table name and category
  const tableMapping = {
    'A': { table: 'Ani_data', category: 'anime' },
    'M': { table: 'Manga_data', category: 'manga' },
    'H': { table: 'Manhwa_data', category: 'manhwa' },
    'U': { table: 'Manhua_data', category: 'manhua' },
    'D': { table: 'Donghua_data', category: 'donghua' },
    'W': { table: 'Webnovel_data', category: 'webnovel' },
  };

  const mapping = tableMapping[lastLetter];

  if (!mapping) {
    console.error(`Unknown category for UID ending with: ${lastLetter}`);
    return null;
  }

  try {
    // Query the appropriate table in Supabase
    const { data, error } = await supabase
      .from(mapping.table)
      .select('*')
      .eq('uid', uid)
      .single(); // Fetch a single record

    if (error) {
      console.error(`Error fetching from ${mapping.table}:`, error);
      return null;
    }

    if (data) {
      return {
        table: mapping.table,
        category: mapping.category,
        item: data
      };
    } else {
      console.warn(`UID ${uid} not found in ${mapping.table}`);
      return null;
    }
  } catch (error) {
    console.error(`Unexpected error querying ${mapping.table}:`, error);
    return null;
  }
};
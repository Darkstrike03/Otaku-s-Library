export const getJsonFile = async (uid) => {
  const files = ['anime.json', 'manhua.json', 'donghua.json', 'webnovels.json', 'manhwa.json']; // List of JSON files
  for (const file of files) {
    try {
      const response = await fetch(`/JSON/${file}`);
      if (response.ok) {
        const data = await response.json();
        const category = file.split('.')[0]; // Extract category name from file name
        const item = data[category]?.find((item) => item.uid === uid); // Check if uid exists in the file
        if (item) {
          return { file, item }; // Return the file name and the item data
        }
      }
    } catch (error) {
      console.error(`Error checking ${file}:`, error);
    }
  }
  return null; // Return null if uid is not found
};
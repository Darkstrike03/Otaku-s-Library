export const uploadToImgBB = async (file) => {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('key', process.env.NEXT_PUBLIC_IMGBB_API_KEY);

  try {
    const response = await fetch('https://api.imgbb.com/1/upload', {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.success) {
      return data.data.display_url; // Use display_url instead of url
    } else {
      throw new Error(data.error?.message || 'Upload failed');
    }
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
};
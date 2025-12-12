# Contributing to TWIST - Community Lists

Thank you for wanting to share your favorite anime, manga, manhwa, manhua, donghua, and web novels with the community!

## How to Submit Your List

1. **Fork this repository**

2. **Create your JSON file** in `public/JSON/TWIST/` with your username as the filename (e.g., `yourname.json`)

3. **Follow the JSON structure** below:

```json
{
  "username": "yourname",
  "displayName": "Your Display Name",
  "avatar": "https://your-avatar-url.com/image.jpg",
  "bio": "A short bio about yourself and your interests 📚",
  "favorites": {
    "anime": [
      {
        "id": 1,
        "uid": "1A",
        "title": "Anime Title",
        "image": "https://image-url.com/poster.jpg",
        "rating": 8.5,
        "status": "Completed",
        "episodes": 24
      }
    ],
    "manga": [
      {
        "id": 1,
        "uid": "1M",
        "title": "Manga Title",
        "image": "https://image-url.com/cover.jpg",
        "rating": 9.0,
        "status": "Ongoing",
        "chapters": 150
      }
    ],
    "manhwa": [],
    "manhua": [],
    "donghua": [],
    "webnovels": []
  }
}
```

## Field Descriptions

- **username**: Your unique username (lowercase, no spaces)
- **displayName**: Your display name as you want it shown
- **avatar**: URL to your avatar image (use services like imgur, imgbb, or pravatar.cc)
- **bio**: A short description about yourself (keep it under 100 characters)
- **favorites**: Object containing arrays for each category
  - **id**: Sequential number within the category
  - **uid**: Unique ID from the main database (check existing entries)
  - **title**: The title of the work
  - **image**: URL to the poster/cover image
  - **rating**: Your personal rating (0-10, one decimal place)
  - **status**: "Completed", "Ongoing", or "Hiatus"
  - **episodes**: For anime/donghua
  - **chapters**: For manga/manhwa/manhua/webnovels

## Categories

You can include any combination of:
- `anime`
- `manga`
- `manhwa`
- `manhua`
- `donghua`
- `webnovels`

Leave empty arrays `[]` for categories you don't want to include.

## Image Guidelines

- Use high-quality images
- Recommended size: 400x600px minimum
- Use reliable image hosting services:
  - [ImgBB](https://imgbb.com/)
  - [Imgur](https://imgur.com/)
  - For avatars: [Pravatar](https://pravatar.cc/) or [UI Avatars](https://ui-avatars.com/)

## UID Reference

To find the correct `uid` for entries:
- Check the existing database JSON files in `public/JSON/`
- Format: `{number}{Letter}` where Letter is:
  - A = Anime
  - M = Manga
  - H = Manhwa
  - U = Manhua
  - D = Donghua
  - W = Web Novel

## Example

See `alice.json`, `bob.json`, or `charlie.json` in the TWIST folder for examples.

## Submission Process

1. Create your JSON file following the structure above
2. Test it locally to make sure it displays correctly
3. Update `src/components/Twist.js` line 23 to add your username to the array:
   ```javascript
   const usernames = ['alice', 'bob', 'charlie', 'yourname'];
   ```
4. Commit your changes
5. Create a Pull Request with:
   - Title: "Add [YourName]'s TWIST list"
   - Description: Brief intro about yourself and your favorites

## Guidelines

- Keep your list focused (5-15 items per category is ideal)
- Be honest with your ratings
- Include a variety of titles, not just the most popular ones
- Keep your bio friendly and appropriate
- Check that all image URLs are working before submitting

## Questions?

Open an issue or reach out to the maintainers if you have any questions!

Happy sharing! 🎉

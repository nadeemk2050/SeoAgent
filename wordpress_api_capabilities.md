# WordPress REST API: Comprehensive Capability List

With the Application Password authentication currently configured in your SEO Agent, you have full programmatic control over your WordPress site. Here is the 100% breakdown of what you can control and manipulate.

## 1. Content Management (Pages, Posts, & Custom Post Types)
*   **Full CRUD**: Create, Read, Update, and Delete any page or blog post.
*   **Draft to Production**: Toggle status between `draft`, `publish`, `future` (scheduled), `pending`, and `private`.
*   **Hierarchical Control**: Change page parents to restructure site architecture.
*   **Slugs & URLs**: Programmatically change the URL slug for better keyword optimization.
*   **Password Protection**: Set or remove passwords for specific pages.
*   **Sticky Posts**: Make specific blog posts "sticky" to keep them at the top of the feed.

## 2. Block-Level Control (Gutenberg)
*   **HTML Block Injection**: Add new `<!-- wp:html -->` blocks to insert custom code.
*   **Content Appending**: Add new sections (Paragraphs, Headings, Lists) to the end of existing pages.
*   **Content Prepending**: Insert H1s or Introduction sections at the very top.
*   **Block Parsing**: Search existing content for specific blocks (like old SEO sections) and replace only those specific parts.

## 3. SEO & Meta Data (The Core Power)
*   **Yoast/RankMath Integration**: Read and update specific SEO fields like `_yoast_wpseo_title`, `_yoast_wpseo_metadesc`, and focus keywords.
*   **Custom Fields**: Update any hidden metadata associated with a page.
*   **Canonical URLs**: Set custom canonical tags to prevent duplicate content issues.
*   **Open Graph (Social)**: Set custom Facebook/Twitter titles and images for social sharing.

## 4. Media & Assets
*   **Bulk Uploads**: Upload images, PDFs, or videos directly to the media library.
*   **SEO Alt Text**: Programmatically update the `alt_text` and `caption` for every image on the site to improve image search ranking.
*   **Featured Images**: Automatically assign or change the "Featured Image" for any post.
*   **Media Metadata**: Edit EXIF data or descriptions of existing media.

## 5. Taxonomies (SEO Structure)
*   **Category Management**: Create, rename, or delete categories.
*   **Tagging Engine**: Automatically assign tags to posts based on the keywords detected in the content.
*   **Term Relationships**: Change which categories a post belongs to for better site siloing.

## 6. Users & Comments
*   **Comment Moderation**: Approve, trash, or mark comments as spam (great for keeping the "link juice" clean).
*   **Author Assignment**: Change the author of a post to a different user profile.
*   **Profile Updates**: Update user bios or contact information.

## 7. Global Site Control
*   **Site Title & Tagline**: Change the main site branding.
*   **Timezones & Date Formats**: Adjust site-wide settings.
*   **Pingbacks/Trackbacks**: Enable or disable site-wide linking notifications.

---

### How to use this list:
Your SEO Agent can now be programmed to perform any of these actions. For example, your "Auto-Content Expander" uses the **Content Management** and **Block Control** features, while your "Bulk Fixer" uses the **SEO & Meta Data** features.

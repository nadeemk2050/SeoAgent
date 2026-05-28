<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/a04f7207-d78c-46d0-9c62-db4d6eda8260

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Configure APIs in `.env.local` (recommended for maximum AI quality):

   `GEMINI_API_KEY=your_gemini_key`

   `GEMINI_MODEL=gemini-2.5-flash`

   `SERPER_API_KEY=your_serper_key`

   Optional fallbacks:

   `GOOGLE_CSE_KEY=your_google_cse_key`

   `GOOGLE_CSE_ID=your_google_cse_id`
3. Run the app:
   `npm run dev`

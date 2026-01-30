<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# ClashCoach AI — Gemini 3 Hackathon (Devpost)

**Contest:** Gemini 3 Hackathon on Devpost  
**Link:** https://gemini3.devpost.com/

ClashCoach AI is a Clash of Clans tactical assistant that analyzes your army and base images, then generates a step-by-step attack plan with clear deployment directions. It uses the Gemini 3 API for multimodal reasoning and produces structured, actionable guidance for players.

## What it does
- Reads your **army composition image** and **enemy base image**
- Generates a **multi‑phase strategy** with explicit deployment directions (e.g., “9 o’clock (West)”)
- Renders **consistent arrow overlays** on the base image to visualize each direction

## Gemini 3 Integration
- **Model:** `gemini-3-pro-preview`
- **Usage:** Multimodal analysis (images + goal) → structured JSON plan
- **Output:** phases, instructions, and troop usage for each phase

## Tech Stack
- React + TypeScript + Vite
- Tailwind CSS (via CDN)
- Google Gemini API (`@google/genai`)

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in `.env.local` to your Gemini API key
3. Run the app:
   `npm run dev`

## Devpost Submission Checklist
- **Project page:** https://gemini3.devpost.com/
- **Public demo link:** Add your deployed link (or AI Studio app link if used)
- **Public code repo:** https://github.com/MayaMatrix9936/ClashCoachAI
- **Demo video:** ~3 minutes

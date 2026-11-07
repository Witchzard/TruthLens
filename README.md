# TruthLens AI – AI-Powered Media Authenticity Analyzer

**TruthLens AI** is an AI-powered platform designed to help people evaluate the authenticity of digital content. Users can upload images, videos, and documents to analyze potential signs of manipulation, AI generation, and inconsistencies.

In a world where deepfakes and AI-generated content are becoming increasingly realistic, TruthLens AI aims to make digital content verification more accessible and understandable.

## Key Features

- **Image Analysis:** Examine uploaded images for potential AI generation, visual manipulation, editing artifacts, and available metadata.
- **Video Analysis:** Analyze video frames for potential manipulation and inconsistencies.
- **Document Analysis:** Extract document content and inspect metadata, formatting, dates, and possible inconsistencies.
- **AI-Powered Insights:** Use AI to interpret available evidence and explain suspicious findings.
- **Evidence-Based Reports:** Present findings with explanations instead of simply labeling content as real or fake.
- **Analysis History:** Access previously generated analysis reports.
- **User-Friendly Dashboard:** A clean interface for uploading files and viewing analysis results.

## How It Works

1. Upload an image, video, or document.
2. TruthLens AI processes the uploaded file.
3. Relevant metadata and content are examined.
4. AI analyzes the available information for potential signs of manipulation or inconsistencies.
5. The platform generates a report explaining its findings.

## Possible Analysis Outcomes

TruthLens AI uses multiple outcome categories to avoid misleading binary judgments:

- **Likely Authentic** – No significant signs of manipulation were identified in the checks performed.
- **Potentially Manipulated** – One or more suspicious indicators were detected.
- **Likely AI-Generated** – The analysis identified indicators consistent with AI-generated content.
- **Inconclusive** – Available evidence is insufficient to make a reliable assessment.

## Technology Stack

The project is built using modern web technologies:

- **Frontend:** React, TypeScript, Tailwind CSS
- **UI & Animations:** Framer Motion, Lucide Icons
- **Backend:** Node.js, Express.js
- **AI Integration:** Google Gemini API
- **File Processing:** Tools and libraries for image, video, and document analysis
- **Version Control:** Git and GitHub

*The exact technologies and integrations depend on the components enabled in the current implementation.*

## Project Structure

```text
TruthLens-AI/
├── public/
├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── hooks/
│   ├── utils/
│   └── App.tsx
├── server/
│   ├── routes/
│   ├── controllers/
│   └── services/
├── package.json
└── README.md
```

*The structure above is illustrative; your actual repository may differ.*

## Getting Started

### Prerequisites

- Node.js and npm
- Google Gemini API key (if Gemini integration is enabled)
- Git

### Installation

1. Clone the repository:

```bash
git clone YOUR_REPOSITORY_URL
```

2. Navigate into the project directory:

```bash
cd TruthLens-AI
```

3. Install dependencies:

```bash
npm install
```

4. Configure environment variables.

Create a `.env` file and add the required configuration:

```env
GEMINI_API_KEY=your_api_key_here
```

Never commit your actual API key to GitHub.

5. Start the application using the appropriate development command defined in `package.json`.

For example:

```bash
npm run dev
```

If the project uses a separate backend, start that server using its own development command as well.

## Important Note on Accuracy

TruthLens AI is an assistance tool for evaluating digital content, not a guaranteed forensic verification system.

AI-generated content detection and deepfake identification are challenging problems. A suspicious indicator does not automatically prove that content is fake, and the absence of suspicious indicators does not guarantee authenticity.

Results should be interpreted alongside the evidence and limitations included in each report.

## Future Enhancements

- Integration of specialized deepfake detection models.
- Advanced image manipulation detection.
- Audio authenticity and voice-cloning analysis.
- Video frame-by-frame forensic inspection.
- C2PA content credentials and provenance verification.
- Improved evidence visualization.
- Downloadable forensic reports.
- Expanded support for additional file formats.

## Project Vision

Our vision is to make digital content verification easier and more accessible by helping people understand what they are viewing, identify potential warning signs, and make better-informed decisions.

**Think Before You Trust. Verify With TruthLens.**

---

*Developed as an AI-powered digital media authenticity analysis project.*

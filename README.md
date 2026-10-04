# 🔍 TraceLens — Digital Footprint & OSINT Intelligence Dashboard

[![Next.js](https://img.shields.io/badge/Next.js-14.x-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

> **TraceLens** is an Open Source Intelligence (OSINT) and Social Media Intelligence (SOCMINT) dashboard designed to aggregate, analyze, and visualize publicly observable digital footprints across modern developer and social platforms.

---

## 🌟 Overview

In today's interconnected web, reusing handles, metadata, and bio descriptions across public platforms often exposes individuals to cross-platform linkability and spear-phishing risks. 

**TraceLens** acts as a privacy audit tool that probes public endpoints, calculates an **Exposure Score**, maps identity clusters onto an interactive graph, and generates actionable privacy recommendations to help developers and security-conscious individuals minimize their attack surface.

---

## ✨ Key Features

- **🌐 Live API Probing**: Integrates live REST APIs (e.g., GitHub User API) to fetch real-time public repositories, bios, and geographic signals.
- **🕸 Interactive Footprint Graph**: Real-time dynamic HTML5 Canvas visualization rendering identity nodes, cross-platform relationships, and public signal links.
- **📊 Exposure & Risk Engine**: Calculates a composite risk score based on handle reuse frequency, geo-location leakage, and public repository visibility.
- **🛡️ Remediation Recommendations**: Delivers automated, actionable privacy hardening steps tailored to findings.
- **⚡ Fast & Modern UI**: Built with Next.js 14 App Router, React Hooks, Lucide Icons, and Tailwind CSS with dark-mode cyber aesthetics.
- **💾 Local Scan History**: Persists previous analysis results using browser `localStorage` for quick comparative tracking.

---

## 🏗️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router & API Routes)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Canvas Rendering**: HTML5 Native 2D Context API
- **Deployment**: [Vercel](https://vercel.com/)

---

## 📁 Project Architecture

```text
tracelens/
├── app/
│   ├── api/
│   │   └── analyze/
│   │       └── route.ts     # Backend OSINT correlation API
│   ├── favicon.ico
│   ├── globals.css          # Tailwind CSS directives
│   ├── layout.tsx           # Application root layout
│   └── page.tsx             # Main dashboard UI & Interactive Graph
├── public/                  # Static assets
├── .gitignore
├── next.config.js           # Next.js configuration
├── package.json
├── README.md
└── tsconfig.json


🚀 Getting Started
Prerequisites
Ensure you have the following installed locally:

Node.js: v18.x or higher

npm or yarn / pnpm

Installation & Setup
Clone the Repository

Bash
git clone [https://github.com/YOUR_USERNAME/tracelens.git](https://github.com/YOUR_USERNAME/tracelens.git)
cd tracelens
Install Dependencies

Bash
npm install
Run Development Server

Bash
npm run dev
Access the Application
Open your browser and navigate to http://localhost:3000.

📡 API Endpoint Reference
POST /api/analyze
Analyzes a target username across public platform indexes and computes risk exposure metrics.

Request Body
JSON
{
  "username": "cyber_ninja"
}
Response Example
JSON
{
  "username": "cyber_ninja",
  "timestamp": "2026-10-04T18:30:00.000Z",
  "summary": {
    "accountsFound": 4,
    "signalsCollected": 3,
    "exposureScore": 72,
    "exposureLevel": "HIGH"
  },
  "profiles": [
    {
      "id": "gh-1",
      "platform": "GitHub",
      "username": "cyber_ninja",
      "profileUrl": "[https://github.com/cyber_ninja](https://github.com/cyber_ninja)",
      "confidenceLevel": "High (100%)"
    }
  ],
  "recommendations": [ ... ]
}
⚠️ Safety & Ethical Boundaries
Public Data Only: TraceLens solely queries publicly accessible APIs and endpoints without bypassing authentication or privacy settings.

Educational Purpose: Built exclusively for security research, awareness, and digital hygiene auditing.

📝 License
Distributed under the MIT License. See LICENSE for more information.

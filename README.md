# Data Analytics Frontend

A modern, responsive web application built with Next.js for data analytics and visualization. This frontend provides an intuitive interface for connecting to data sources, querying data with natural language, and creating interactive visualizations.

## Features

- **Connect**: Manage database connections with secure authentication
- **Query**: Natural language data querying with AI-powered insights
- **Visualize**: Create interactive dashboards and data visualizations

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Theme**: Dark/Light mode support with next-themes

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── app/                 # Next.js App Router pages
│   ├── connect/        # Database connection management
│   ├── query/          # Natural language querying
│   └── visualize/      # Data visualization
├── components/         # Reusable React components
└── globals.css        # Global styles
```

## Development

This project uses modern React patterns with TypeScript for type safety and Tailwind CSS for styling. The app features a responsive design with dark/light theme support and smooth animations.

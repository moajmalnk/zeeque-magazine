# ZeeQue Magazine

A digital magazine platform where preschool children can share their stories, poems, and drawings. Celebrating creativity from ZeeQue Preschool students.

## Features

- Interactive post submission system
- Category-based filtering
- Editorial dashboard for content review
- Responsive design with modern UI components
- Real-time content management

## Technologies

This project is built with:

- **Vite** - Fast build tool and development server
- **TypeScript** - Type-safe JavaScript
- **React** - UI library
- **React Router** - Client-side routing
- **shadcn-ui** - High-quality UI components
- **Tailwind CSS** - Utility-first CSS framework
- **TanStack Query** - Data fetching and state management

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn package manager

### Installation

1. Clone the repository:
```sh
git clone <YOUR_GIT_URL>
cd zeeque-magazine
```

2. Install dependencies:
```sh
npm install
```

3. Start the development server:
```sh
npm run dev
```

The application will be available at `http://localhost:8080`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:dev` - Build in development mode
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode

## Project Structure

```
src/
├── components/     # Reusable React components
├── pages/          # Page components
├── hooks/          # Custom React hooks
├── lib/            # Utility functions
├── types/          # TypeScript type definitions
└── data/           # Mock data and constants
```

## Development

The project uses Vite for fast development with hot module replacement (HMR). Changes to source files will automatically reload in the browser.

## Building for Production

To create a production build:

```sh
npm run build
```

The built files will be in the `dist` directory, ready for deployment to any static hosting service.

## License

Copyright © ZeeQue Preschool. All rights reserved.

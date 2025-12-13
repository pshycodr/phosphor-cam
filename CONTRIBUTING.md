# Contributing to Phosphor Cam

Thank you for considering contributing to Phosphor-Cam! This document provides guidelines for contributing to the project.

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Basic knowledge of React, TypeScript, and Canvas API
- A modern browser with camera access

### Development Setup

```bash
# Fork and clone the repository
git clone https://github.com/yourusername/phosphor-cam.git
cd phosphor-cam

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

## Project Structure

```
src/
├── components/        # React components
│   ├── asciiView.tsx     # Core ASCII rendering logic
│   ├── cameraControls.tsx
│   ├── header.tsx
│   └── settings.tsx
├── types/            # TypeScript type definitions
├── utils/            # Utility functions
│   └── asciiUtils.ts     # ASCII conversion algorithms
├── App.tsx           # Main application component
└── index.css         # Global styles
```

## How to Contribute

### Reporting Bugs

- Check if the issue already exists in the issue tracker
- Include browser version, OS, and steps to reproduce
- Provide screenshots or video if applicable

### Suggesting Features

- Open an issue with the `enhancement` label
- Clearly describe the feature and its use case
- Explain why it would benefit the project

### Submitting Pull Requests

1. **Create a branch** from `main`
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Follow the existing code style
   - Add comments for complex logic
   - Test thoroughly on multiple browsers

3. **Commit with clear messages**
   ```bash
   git commit -m "Add: new character set for ASCII rendering"
   ```

4. **Push and create a PR**
   ```bash
   git push origin feature/your-feature-name
   ```

## Code Guidelines

### TypeScript

- Use strict type checking
- Define interfaces for all props and state
- Avoid `any` types unless absolutely necessary

### React

- Use functional components with hooks
- Implement `memo()` for performance-critical components
- Keep components focused and single-purpose

### Performance

- Optimize rendering loops in `asciiView.tsx`
- Use `requestAnimationFrame` for animations
- Minimize canvas operations in hot paths

### Styling

- Use Tailwind utility classes
- Follow the existing green terminal aesthetic
- Ensure responsive design on mobile devices

## Testing

Before submitting a PR:

- [ ] Test on Chrome, Firefox, and Safari
- [ ] Verify camera switching works correctly
- [ ] Check performance (FPS should stay above 30)
- [ ] Test all character sets and settings
- [ ] Ensure snapshot export works properly

## Code Style

- **Formatting**: Run `npm run format` before committing (if Prettier is configured)
- **Naming**: Use camelCase for variables, PascalCase for components
- **Imports**: Group by external libraries, then internal modules
- **Comments**: Explain "why" not "what" for complex logic

## Areas for Contribution

We welcome contributions in these areas:

- **New Character Sets** – Add creative ASCII character mappings
- **Performance Optimization** – Improve rendering speed
- **Export Formats** – Support for GIF, video, or other formats
- **UI/UX Improvements** – Better mobile experience, accessibility
- **Documentation** – Tutorials, API docs, code comments

## Questions?

Feel free to open an issue for any questions about contributing. We're here to help!

---

**Note**: By contributing, you agree that your contributions will be licensed under the project's MIT License.
# Contributing to Sentinel

First off, thank you for considering contributing to Sentinel! 🛡️

## 🚀 Quick Start for Contributors

```bash
# Fork and clone
git clone https://github.com/yourusername/sentinel.git
cd sentinel

# Install dependencies
npm install

# Set up Tambo
npx tambo init

# Start dev server
npm run dev
```

## 📋 Development Guidelines

### Adding a New Component

1. Create your component in `src/components/sentinel/`
2. Define a Zod schema for props validation
3. Export both from `src/components/sentinel/index.ts`
4. Register in `src/lib/tambo.ts` with a clear description

### Component Description Best Practices

The AI uses component descriptions to decide when to render them. Write descriptions that:
- Start with **when** to use the component
- Mention any prerequisites (e.g., "call X tool first")
- Highlight if it requires human approval

### Code Style

- TypeScript strict mode
- Functional components with hooks
- TailwindCSS for styling
- Framer Motion for animations

## 📝 Pull Request Process

1. Create a feature branch: `git checkout -b feature/amazing-component`
2. Make your changes
3. Run linting: `npm run lint`
4. Push and create a PR

## 🐛 Bug Reports

Open an issue with:
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if UI-related

---

Built with ❤️ for the DevOps community

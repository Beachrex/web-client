# Beachrex Frontend Documentation

Welcome to the Beachrex frontend documentation! This directory contains all technical documentation for the Next.js frontend application.

## 📚 Documentation Structure

### 🔧 [Setup](./setup/)
Getting started guides and initial setup documentation.

- **[START_HERE.md](./setup/START_HERE.md)** - Quick start guide for new developers

### 🔌 [Integrations](./integrations/)
Third-party service integrations and API documentation.

- **[JIRA_GITLAB_INTEGRATION.md](./integrations/JIRA_GITLAB_INTEGRATION.md)** - Jira and GitLab integration setup
- **[JIRA_QUICK_SETUP.md](./integrations/JIRA_QUICK_SETUP.md)** - Quick Jira setup guide
- **[ZEPHYR_INTEGRATION.md](./integrations/ZEPHYR_INTEGRATION.md)** - Zephyr test management integration
- **[OPENWEATHER_BACKEND_IMPLEMENTATION.md](./integrations/OPENWEATHER_BACKEND_IMPLEMENTATION.md)** - OpenWeatherMap backend implementation
- **[OPENWEATHER_FRONTEND_IMPLEMENTATION.md](./integrations/OPENWEATHER_FRONTEND_IMPLEMENTATION.md)** - OpenWeatherMap frontend implementation

### 🧪 [Testing](./testing/)
Testing setup, E2E tests, and CI/CD configuration.

- **[GITLAB_E2E_SETUP.md](./testing/GITLAB_E2E_SETUP.md)** - GitLab E2E testing setup
- **[TRIGGER_EXAMPLES.md](./testing/TRIGGER_EXAMPLES.md)** - CI/CD trigger examples

### ✨ [Features](./features/)
Feature-specific implementation guides and documentation.

- **[BEACH_MAP_LINK_FIX.md](./features/BEACH_MAP_LINK_FIX.md)** - Beach map link fix: locale-prefixed URLs, slug corrections (Issues 16/17/18)
- **[GLOBAL_SEARCH.md](./features/GLOBAL_SEARCH.md)** - Global search feature implementation
- **[image-url-encoding-handoff.md](./features/image-url-encoding-handoff.md)** - Image URL encoding implementation

### 🐛 [Bugs](./bugs/)
Bug reports and post-mortems for non-trivial fixes.

*(No entries yet — add here when a bug fix warrants a dedicated write-up.)*

---

## 🚀 Quick Links

### For New Developers
1. Start with **[START_HERE.md](./setup/START_HERE.md)**
2. Review **[DEV_HANDOFF.md](../DEV_HANDOFF.md)** in the root for recent changes
3. Check integration docs for services you'll be working with

### For API Integration
- **Backend API**: See backend documentation at `../Api/docs/`
- **OpenWeather Integration**: [OPENWEATHER_FRONTEND_IMPLEMENTATION.md](./integrations/OPENWEATHER_FRONTEND_IMPLEMENTATION.md)
- **Image Handling**: [image-url-encoding-handoff.md](./features/image-url-encoding-handoff.md)

### For Testing
- **E2E Tests**: [GITLAB_E2E_SETUP.md](./testing/GITLAB_E2E_SETUP.md)
- **CI/CD**: [TRIGGER_EXAMPLES.md](./testing/TRIGGER_EXAMPLES.md)

---

## 📝 Documentation Guidelines

When adding new documentation:

1. **Choose the right folder:**
   - `setup/` - Getting started, installation, configuration
   - `integrations/` - Third-party services, APIs, external tools
   - `testing/` - Test setup, E2E, CI/CD
   - `features/` - Feature-specific implementation details
   - `bugs/` - Non-trivial bug reports, root-cause analyses, post-mortems

2. **Use clear naming:**
   - Use UPPERCASE for major documentation files
   - Use descriptive names (e.g., `OPENWEATHER_FRONTEND_IMPLEMENTATION.md`)
   - Include dates for time-sensitive docs

3. **Update this README:**
   - Add your new document to the appropriate section
   - Include a brief description

4. **Update DEV_HANDOFF.md:**
   - If your changes affect other developers, update the handoff file in the root

---

## 🔄 Recent Updates

See **[DEV_HANDOFF.md](../DEV_HANDOFF.md)** in the root directory for the latest changes and important updates.

---

## 📂 Project Structure

```
Beachrex/Front/
├── README.md                    # Main project README
├── DEV_HANDOFF.md              # Developer handoff (recent changes)
│
├── docs/                        # 📚 All documentation
│   ├── README.md               # This file
│   ├── setup/                  # Getting started guides
│   ├── integrations/           # Third-party integrations
│   ├── testing/                # Testing documentation
│   ├── features/               # Feature-specific docs
│   └── bugs/                   # Bug reports & post-mortems
│
├── src/                         # Source code
│   ├── app/                    # Next.js app directory
│   ├── components/             # React components
│   ├── hooks/                  # Custom React hooks
│   ├── lib/                    # Utilities and libraries
│   └── types/                  # TypeScript types
│
└── public/                      # Static assets
```

---

## 🤝 Contributing

When making changes:

1. ✅ Update relevant documentation
2. ✅ Add entry to `DEV_HANDOFF.md` if it affects other developers
3. ✅ Keep documentation organized in appropriate folders
4. ✅ Use clear, descriptive commit messages

---

## 📞 Need Help?

- Check the **[DEV_HANDOFF.md](../DEV_HANDOFF.md)** for recent changes
- Review the **[START_HERE.md](./setup/START_HERE.md)** guide
- Look for relevant documentation in the appropriate folder
- Check the backend documentation at `../Api/docs/`


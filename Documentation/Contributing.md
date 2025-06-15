# Contributing Guidelines

Willkommen bei der TYPO3 Fluid Storybook Integration! Diese Anleitung hilft Ihnen dabei, erfolgreich zum Projekt beizutragen.

## 🎯 **Wie Sie beitragen können**

### **Arten von Beiträgen**
- 🐛 **Bug Reports & Fixes**
- ✨ **Feature Requests & Implementation**
- 📚 **Dokumentation verbessern**
- 🧪 **Tests schreiben oder erweitern**
- 🌍 **Übersetzungen hinzufügen**
- 🎨 **UX/UI Verbesserungen**

---

## 🚀 **Erste Schritte**

### **1. Repository Setup**
```bash
# Fork und klonen
git clone https://github.com/your-username/fluid_storybook.git
cd fluid_storybook

# Development Branch erstellen
git checkout -b feature/your-feature-name
```

### **2. Entwicklungsumgebung einrichten**
```bash
# TYPO3 Development Setup (DDEV empfohlen)
ddev start
ddev composer install

# JavaScript/Storybook Dependencies
cd Resources/Public/Storybook
npm install

# Tests prüfen
npm test
```

### **3. Code Style Setup**
```bash
# PHP CS Fixer (falls verfügbar)
composer install --dev
./vendor/bin/php-cs-fixer fix --dry-run

# ESLint für JavaScript/TypeScript
cd Resources/Public/Storybook
npm run lint
```

---

## 🐛 **Bug Reports**

### **Vor dem Melden**
- ✅ Durchsuchen Sie [bestehende Issues](https://github.com/your-repo/issues)
- ✅ Prüfen Sie `Documentation/Troubleshooting.md`
- ✅ Testen Sie mit der neuesten Version

### **Bug Report Template**
```markdown
## Bug Description
Kurze, klare Beschreibung des Problems.

## Steps to Reproduce
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

## Expected Behavior
Was sollte passieren?

## Actual Behavior
Was passiert stattdessen?

## Environment
- TYPO3 Version: [e.g. 12.4.8]
- PHP Version: [e.g. 8.1.0]
- Extension Version: [e.g. 1.2.3]
- Browser: [e.g. Chrome 120.0]
- OS: [e.g. macOS Ventura]
- Development Setup: [DDEV/Docker/Local]

## Additional Context
Screenshots, logs, oder andere relevante Informationen.
```

---

## ✨ **Feature Requests**

### **Feature Request Template**
```markdown
## Feature Summary
Ein-Satz Zusammenfassung der gewünschten Funktion.

## Problem/Use Case
Welches Problem löst diese Funktion? Wer würde sie nutzen?

## Proposed Solution
Wie sollte die Funktion funktionieren?

## Alternatives Considered
Welche anderen Ansätze haben Sie erwogen?

## Additional Context
Mockups, Beispiele, oder verwandte Issues.
```

---

## 💻 **Code Contributions**

### **Development Workflow**

#### **1. Issue Assignment**
```bash
# Kommentieren Sie im Issue
"I'd like to work on this. ETA: 2 weeks"
```

#### **2. Branch Naming**
```bash
# Features
git checkout -b feature/template-auto-discovery

# Bug Fixes  
git checkout -b bugfix/cors-headers-missing

# Documentation
git checkout -b docs/troubleshooting-guide

# Performance
git checkout -b perf/cache-optimization
```

#### **3. Commit Messages** (Englisch)
```bash
# Format: type(scope): description
git commit -m "feat(api): add template manifest generation"
git commit -m "fix(storybook): resolve CORS header issue"
git commit -m "docs(readme): update installation instructions"
git commit -m "test(api): add unit tests for FluidRenderApiController"
git commit -m "perf(cache): optimize template rendering cache"
```

**Types**: `feat`, `fix`, `docs`, `test`, `perf`, `refactor`, `style`, `chore`

### **Code Standards**

#### **PHP Code (PSR-12)**
```php
<?php
declare(strict_types=1);

namespace Vendor\FluidStorybook\Controller;

use TYPO3\CMS\Core\Http\ResponseInterface;

/**
 * Controller for Fluid rendering API endpoints
 * 
 * @author Your Name <your.email@example.com>
 */
final class ExampleController extends ActionController
{
    /**
     * Render Fluid template with provided variables
     */
    public function renderAction(): ResponseInterface
    {
        // Implementation with proper error handling
        try {
            $result = $this->performRendering();
            return $this->jsonResponse($result);
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 500);
        }
    }
}
```

#### **JavaScript/TypeScript**
```typescript
/**
 * Configuration class for Fluid Storybook integration
 */
export class FluidStorybookConfig {
  private static readonly CONFIG_KEY = 'fluid_storybook_config';
  
  /**
   * Get configuration value with fallback
   */
  public static get(key: string, defaultValue?: any): any {
    // Implementation with proper type safety
    const config = this.getFullConfig();
    return config[key] ?? defaultValue;
  }
}
```

#### **CSS/SCSS**
```scss
// Use BEM methodology
.fluid-storybook {
  &__component {
    // Component styles
    
    &--variant {
      // Variant styles
    }
  }
  
  &__element {
    // Element styles
  }
}
```

### **Testing Requirements**

#### **PHP Unit Tests**
```php
<?php
declare(strict_types=1);

namespace Vendor\FluidStorybook\Tests\Unit\Controller;

use TYPO3\TestingFramework\Core\Unit\UnitTestCase;

/**
 * Test case for FluidRenderApiController
 */
final class FluidRenderApiControllerTest extends UnitTestCase
{
    protected FluidRenderApiController $subject;
    
    protected function setUp(): void
    {
        parent::setUp();
        $this->subject = new FluidRenderApiController();
    }
    
    /**
     * @test
     */
    public function renderActionReturnsJsonResponse(): void
    {
        // Test implementation
        $result = $this->subject->renderAction();
        self::assertInstanceOf(ResponseInterface::class, $result);
    }
}
```

#### **JavaScript Tests (Jest)**
```typescript
// FluidTemplate.test.ts
import { FluidTemplate, FluidStorybookConfig } from '../FluidTemplate';

describe('FluidTemplate', () => {
  beforeEach(() => {
    // Setup test environment
    global.fetch = jest.fn();
  });
  
  afterEach(() => {
    jest.resetAllMocks();
  });
  
  it('should render template successfully', async () => {
    // Mock API response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve('<div>Test Content</div>')
    });
    
    const result = await FluidTemplate({
      templatePath: 'EXT:test/Templates/Test.html',
      variables: { title: 'Test' }
    });
    
    expect(result).toBe('<div>Test Content</div>');
  });
});
```

### **Performance Guidelines**

#### **Frontend Optimization**
```typescript
// Use proper caching
const getCachedTemplate = (key: string): string | null => {
  const cached = localStorage.getItem(`template_cache_${key}`);
  if (cached) {
    const { content, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp < CACHE_DURATION) {
      return content;
    }
  }
  return null;
};
```

#### **Backend Optimization**
```php
// Use TYPO3 caching framework
public function getCachedRenderResult(string $cacheKey): ?string
{
    try {
        return $this->cache->get($cacheKey);
    } catch (NoSuchCacheException $e) {
        return null;
    }
}
```

---

## 📚 **Dokumentation beitragen**

### **Dokumentations-Standards**
- **Sprache**: Deutsch für User-Dokumentation, Englisch für Code-Kommentare
- **Format**: Markdown mit konsistenter Formatierung
- **Beispiele**: Immer praktische Beispiele einschließen
- **Links**: Relative Links zu anderen Dokumentationsdateien verwenden

### **Dokumentations-Struktur**
```markdown
# Document Title

Brief description of what this document covers.

## Section 1: Overview

### Subsection 1.1
Content with examples.

## Section 2: Implementation
Code examples and explanations.

## Section 3: Troubleshooting  
Common issues and solutions.
```

---

## 🧪 **Testing**

### **Vor dem Pull Request**
```bash
# PHP Tests
composer test

# JavaScript Tests  
cd Resources/Public/Storybook
npm test

# Linting
npm run lint
./vendor/bin/php-cs-fixer fix

# Build Test
npm run build
```

### **Test Coverage**
- **Minimum**: 80% Code Coverage für neue Features
- **Critical Paths**: 100% Coverage für Security-relevante Teile
- **Edge Cases**: Tests für Fehlerbehandlung

---

## 📋 **Pull Request Process**

### **1. PR Vorbereitung**
```bash
# Branch aktualisieren
git checkout main
git pull upstream main
git checkout your-feature-branch
git rebase main

# Tests laufen lassen
npm test && composer test
```

### **2. PR Template**
```markdown
## Changes Made
- List of specific changes
- Why these changes were necessary

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass  
- [ ] Manual testing completed
- [ ] Documentation updated

## Screenshots (if applicable)
Before/after screenshots for UI changes.

## Breaking Changes
List any breaking changes and migration steps.

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No merge conflicts
```

### **3. Review Process**
- **Automated Checks**: CI/CD muss erfolgreich sein
- **Code Review**: Mindestens 1 Maintainer-Approval
- **Testing**: Manuelle Tests in verschiedenen Umgebungen
- **Documentation**: Relevante Docs müssen aktualisiert sein

---

## 🏷️ **Release Process**

### **Versioning (Semantic Versioning)**
- **Major** (1.0.0): Breaking Changes
- **Minor** (1.1.0): Neue Features (backwards compatible)
- **Patch** (1.1.1): Bug Fixes

### **Release Checklist**
- [ ] CHANGELOG.md aktualisiert
- [ ] Version in `ext_emconf.php` aktualisiert
- [ ] Version in `composer.json` aktualisiert
- [ ] Tag erstellt
- [ ] Release Notes geschrieben

---

## 🤝 **Community Guidelines**

### **Code of Conduct**
- **Respektvoll**: Behandeln Sie alle Mitwirkenden mit Respekt
- **Konstruktiv**: Feedback sollte konstruktiv und hilfreich sein
- **Inklusiv**: Willkommen für alle, unabhängig von Erfahrungslevel
- **Professionell**: Halten Sie Diskussionen sachlich und professionell

### **Communication Channels**
- **GitHub Issues**: Bug Reports & Feature Requests
- **Pull Requests**: Code Reviews & Diskussionen
- **Discussions**: Allgemeine Fragen & Ideen

---

## 🎓 **Entwickler-Ressourcen**

### **TYPO3 Development**
- [TYPO3 Coding Guidelines](https://docs.typo3.org/m/typo3/reference-coreapi/master/en-us/CodingGuidelines/)
- [TYPO3 Extension Development](https://docs.typo3.org/m/typo3/reference-coreapi/master/en-us/ExtensionArchitecture/)
- [TYPO3 Testing Framework](https://docs.typo3.org/m/typo3/reference-coreapi/master/en-us/Testing/)

### **Storybook Development**
- [Storybook Documentation](https://storybook.js.org/docs)
- [Writing Stories](https://storybook.js.org/docs/react/writing-stories/introduction)
- [Addons Development](https://storybook.js.org/docs/react/addons/writing-addons)

### **Tools & Setup**
- [DDEV Local](https://ddev.readthedocs.io/)
- [Jest Testing](https://jestjs.io/docs/getting-started)
- [TypeScript](https://www.typescriptlang.org/docs/)

---

## 📞 **Fragen & Hilfe**

Benötigen Sie Hilfe beim Beitragen?

1. **Durchsuchen Sie die Dokumentation** in `/Documentation`
2. **Prüfen Sie bestehende Issues** für ähnliche Fragen
3. **Erstellen Sie ein Discussion** für allgemeine Fragen
4. **Kontaktieren Sie Maintainer** für spezifische Probleme

**Vielen Dank für Ihren Beitrag zur TYPO3 Fluid Storybook Integration!** 🎉 
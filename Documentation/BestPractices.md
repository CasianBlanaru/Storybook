# Best Practices Guide

Diese Anleitung sammelt bewährte Praktiken für die effiziente und sichere Nutzung der TYPO3 Fluid Storybook Integration.

## 🏗️ **Architektur & Code-Organisation**

### **Fluid Template Struktur**

#### ✅ **Empfohlene Template-Organisation**
```
Resources/Private/
├── Templates/
│   ├── Components/          # Wiederverwendbare Komponenten
│   │   ├── Card.html
│   │   ├── Button.html
│   │   └── Navigation.html
│   ├── ContentElements/     # TYPO3 Content Elements
│   │   ├── TextMedia.html
│   │   └── Accordion.html
│   └── Pages/              # Seiten-Templates
│       └── Default.html
├── Partials/               # Template-Teile
│   ├── Header.html
│   └── Footer.html
└── Layouts/               # Layout-Rahmen
    └── Default.html
```

#### ✅ **Template Naming Conventions**
```html
<!-- Verwenden Sie aussagekräftige, deskriptive Namen -->
<!-- ✅ Gut -->
<f:render partial="ProductCard" arguments="{product: product}" />

<!-- ❌ Vermeiden -->
<f:render partial="Card1" arguments="{data: data}" />
```

### **Storybook Stories Organisation**

#### ✅ **Story-Struktur**
```javascript
// stories/
├── Components/
│   ├── Card.stories.js
│   ├── Button.stories.js  
│   └── Navigation.stories.js
├── ContentElements/
│   ├── TextMedia.stories.js
│   └── Accordion.stories.js
└── Pages/
    └── Homepage.stories.js
```

#### ✅ **Story Naming Pattern**
```javascript
// ✅ Konsistente Benennung
export default {
  title: 'Components/Card',                    // Kategorie/Komponente
  component: 'Card',
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text', description: 'Card title' },
    variant: { 
      control: 'select', 
      options: ['default', 'highlighted', 'compact'] 
    }
  }
};

// Story variants mit beschreibenden Namen
export const Default = Template.bind({});
export const Highlighted = Template.bind({});
export const WithLongContent = Template.bind({});
export const Compact = Template.bind({});
```

---

## 🎨 **Template Design Patterns**

### **Komponentisierung**

#### ✅ **Atomare Design-Prinzipien**
```html
<!-- Atom: Button -->
<button class="btn btn--{variant}" type="{type}">
  {content}
</button>

<!-- Molekül: Card mit Button -->
<div class="card">
  <h3>{title}</h3>
  <p>{description}</p>
  <f:render partial="Button" arguments="{
    variant: 'primary',
    type: 'button',
    content: 'Read More'
  }" />
</div>

<!-- Organismus: Product Grid -->
<div class="product-grid">
  <f:for each="{products}" as="product">
    <f:render partial="ProductCard" arguments="{product: product}" />
  </f:for>
</div>
```

### **Props/Variables Design**

#### ✅ **Klare Variable-Strukturen**
```javascript
// ✅ Gut strukturierte Props
Default.args = {
  // Content
  title: 'Product Name',
  description: 'Product description text',
  
  // Behavior  
  variant: 'default',
  size: 'medium',
  disabled: false,
  
  // Data
  product: {
    id: 123,
    price: 29.99,
    image: '/images/product.jpg'
  },
  
  // Actions
  onAddToCart: action('add-to-cart'),
  onFavorite: action('favorite-toggle')
};
```

#### ❌ **Vermeiden Sie unstrukturierte Props**
```javascript
// ❌ Unorganisiert
Default.args = {
  text1: 'Title',
  text2: 'Description',
  flag1: true,
  flag2: false,
  data: { mixed: 'content' }
};
```

---

## 🔧 **Performance Optimierung**

### **Caching-Strategien**

#### ✅ **Smart Caching**
```bash
# Development: Kurze Cache-Zeiten für schnelle Iteration
FLUID_STORYBOOK_CACHE_LIFETIME=300  # 5 Minuten

# Staging: Moderate Cache-Zeiten  
FLUID_STORYBOOK_CACHE_LIFETIME=1800 # 30 Minuten

# Production: Lange Cache-Zeiten
FLUID_STORYBOOK_CACHE_LIFETIME=7200 # 2 Stunden
```

#### ✅ **Cache-Keys optimieren**
```javascript
// ✅ Deterministische Cache-Keys
const cacheKey = createCacheKey({
  templatePath,
  variables: JSON.stringify(sortedVariables), // Sortierte Keys für Konsistenz
  environment: process.env.NODE_ENV
});

// ✅ Cache invalidieren bei Template-Changes
const templateModTime = getTemplateModificationTime(templatePath);
const cacheKeyWithVersion = `${cacheKey}_${templateModTime}`;
```

### **Lazy Loading & Code Splitting**

#### ✅ **Async Template Loading**
```javascript
// ✅ Templates on-demand laden
const LazyTemplate = (args) => {
  const [html, setHtml] = useState('<div>Loading...</div>');
  
  useEffect(() => {
    import('./templateLoader').then(loader => {
      loader.FluidTemplate(args).then(setHtml);
    });
  }, [args]);
  
  return createElementFromHTML(html);
};
```

### **Bundle-Optimierung**

#### ✅ **Selective Imports**
```javascript
// ✅ Nur benötigte Module importieren
import { FluidTemplate } from '../JavaScript/FluidTemplate';
import { config } from '../JavaScript/config';

// ❌ Vermeiden: Ganze Libraries importieren
// import * as utils from '../JavaScript/utils';
```

---

## 🧪 **Testing Best Practices**

### **Unit Tests für Stories**

#### ✅ **Test-Driven Story Development**
```javascript
// Card.test.js
describe('Card Component', () => {
  it('should render with basic props', async () => {
    const html = await FluidTemplate({
      templatePath: 'EXT:my_ext/Resources/Private/Templates/Components/Card.html',
      variables: {
        title: 'Test Card',
        description: 'Test description'
      }
    });
    
    expect(html).toContain('Test Card');
    expect(html).toContain('Test description');
    expect(html).toContain('class="card"');
  });
  
  it('should handle variant classes', async () => {
    const html = await FluidTemplate({
      templatePath: 'EXT:my_ext/Resources/Private/Templates/Components/Card.html',
      variables: {
        title: 'Test',
        variant: 'highlighted'
      }
    });
    
    expect(html).toContain('card--highlighted');
  });
});
```

### **Visual Regression Testing**

#### ✅ **Chromatic Integration**
```javascript
// .storybook/main.js
module.exports = {
  addons: [
    '@storybook/addon-essentials',
    '@chromatic-com/storybook'  // Visual testing
  ]
};

// chromatic.yml workflow
steps:
  - name: Run Chromatic
    uses: chromaui/action@v1
    with:
      token: ${{ secrets.GITHUB_TOKEN }}
      projectToken: ${{ secrets.CHROMATIC_PROJECT_TOKEN }}
      onlyChanged: true  # Nur geänderte Stories testen
```

---

## 🔐 **Security Best Practices**

### **Template Security**

#### ✅ **XSS Prevention**
```html
<!-- ✅ Ausgabe escapen -->
<h1>{title -> f:format.htmlspecialchars()}</h1>

<!-- ✅ HTML-Content explizit als HTML markieren -->
<div class="content">
  <f:format.html>{content}</f:format.html>
</div>

<!-- ❌ Niemals unescaped output für User-Input -->
<!-- <h1>{userInput -> f:format.raw()}</h1> -->
```

#### ✅ **Input Validation**
```javascript
// ✅ Props validieren
const validateProps = (args) => {
  const errors = [];
  
  if (!args.title || typeof args.title !== 'string') {
    errors.push('Title must be a non-empty string');
  }
  
  if (args.variant && !['default', 'primary', 'secondary'].includes(args.variant)) {
    errors.push('Invalid variant specified');
  }
  
  return errors;
};

const Template = (args) => {
  const errors = validateProps(args);
  if (errors.length > 0) {
    return createErrorDisplay(errors);
  }
  
  return renderTemplate(args);
};
```

### **API Security**

#### ✅ **Rate Limiting per Story**
```javascript
// ✅ Request throttling implementieren
const throttledFluidTemplate = throttle(FluidTemplate, 100); // Max 10 req/sec

export const Default = () => {
  return throttledFluidTemplate({
    templatePath: 'EXT:my_ext/Templates/Component.html',
    variables: { title: 'Hello' }
  });
};
```

---

## 📊 **Monitoring & Debugging**

### **Performance Monitoring**

#### ✅ **Rendering Performance tracken**
```javascript
// ✅ Performance-Metriken sammeln
const performanceWrapper = (templateFunction) => {
  return async (args) => {
    const startTime = performance.now();
    
    try {
      const result = await templateFunction(args);
      const endTime = performance.now();
      
      // Metriken loggen
      console.log(`Template rendered in ${endTime - startTime}ms`, {
        templatePath: args.templatePath,
        variableCount: Object.keys(args.variables || {}).length,
        resultSize: result.length
      });
      
      return result;
    } catch (error) {
      console.error('Template rendering failed', {
        templatePath: args.templatePath,
        error: error.message,
        duration: performance.now() - startTime
      });
      throw error;
    }
  };
};

const monitoredFluidTemplate = performanceWrapper(FluidTemplate);
```

### **Error Handling**

#### ✅ **Graceful Degradation**
```javascript
// ✅ Robuste Fehlerbehandlung
const SafeTemplate = (args) => {
  const container = document.createElement('div');
  
  FluidTemplate(args)
    .then(html => {
      container.innerHTML = html;
    })
    .catch(error => {
      console.error('Template rendering failed:', error);
      
      // Fallback content
      container.innerHTML = `
        <div class="error-fallback">
          <h3>Component Preview Unavailable</h3>
          <p>Template: ${args.templatePath}</p>
          <details>
            <summary>Error Details</summary>
            <pre>${error.message}</pre>
          </details>
        </div>
      `;
    });
  
  return container;
};
```

---

## 🌍 **Internationalization (i18n)**

### **Multi-Language Stories**

#### ✅ **Language-aware Stories**
```javascript
// ✅ Mehrsprachige Story-Varianten
export const German = Template.bind({});
German.args = {
  templatePath: 'EXT:my_ext/Templates/Component.html',
  variables: {
    title: 'Hallo Welt',
    description: 'Deutsche Beschreibung',
    locale: 'de-DE'
  }
};

export const English = Template.bind({});
English.args = {
  templatePath: 'EXT:my_ext/Templates/Component.html', 
  variables: {
    title: 'Hello World',
    description: 'English description',
    locale: 'en-US'
  }
};
```

### **Translation Integration**

#### ✅ **TYPO3 Localization**
```html
<!-- ✅ Localization in Templates -->
<h1><f:translate key="LLL:EXT:my_ext/Resources/Private/Language/locallang.xlf:headline" default="{title}" /></h1>

<p>
  <f:translate key="LLL:EXT:my_ext/Resources/Private/Language/locallang.xlf:description" 
               arguments="{0: itemCount}" 
               default="Found {0} items" />
</p>
```

---

## 📝 **Documentation Standards**

### **Story Documentation**

#### ✅ **Comprehensive Story Docs**
```javascript
export default {
  title: 'Components/ProductCard',
  component: 'ProductCard',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
          # Product Card Component
          
          A versatile card component for displaying product information.
          
          ## Usage Guidelines
          - Use for product listings and featured products
          - Always provide alt text for product images
          - Consider accessibility when choosing color variants
          
          ## Design Tokens
          - Card spacing follows 8px grid system
          - Uses semantic color tokens for variants
        `
      }
    }
  },
  argTypes: {
    title: {
      control: 'text',
      description: 'Product title displayed as heading',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'Product Name' }
      }
    },
    variant: {
      control: 'select',
      options: ['default', 'featured', 'sale'],
      description: 'Visual variant of the card',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'default' }
      }
    }
  }
};
```

### **Code Comments**

#### ✅ **Template Documentation**
```html
<!--
  Product Card Component
  
  @param {string} title - Product name
  @param {string} description - Product description
  @param {object} product - Product data object
  @param {string} variant - Card variant (default|featured|sale)
  
  @example
  <f:render partial="ProductCard" arguments="{
    title: 'Amazing Product',
    description: 'This product is amazing',
    product: productObject,
    variant: 'featured'  
  }" />
-->
<div class="product-card product-card--{variant}">
  <!-- Card content -->
</div>
```

---

## 🚀 **Deployment & CI/CD**

### **Automated Testing Pipeline**

#### ✅ **GitHub Actions Workflow**
```yaml
# .github/workflows/storybook-tests.yml
name: Storybook Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 18
          
      - name: Install dependencies
        run: |
          cd Resources/Public/Storybook
          npm ci
          
      - name: Run tests
        run: |
          cd Resources/Public/Storybook
          npm test -- --coverage
          
      - name: Build Storybook
        run: |
          cd Resources/Public/Storybook
          npm run build-storybook
          
      - name: Run visual tests
        run: |
          cd Resources/Public/Storybook
          npm run chromatic -- --project-token=${{ secrets.CHROMATIC_PROJECT_TOKEN }}
```

### **Quality Gates**

#### ✅ **Pre-commit Hooks**
```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "*.{js,ts}": ["eslint --fix", "prettier --write"],
    "*.{html,css,scss}": ["prettier --write"],
    "*.php": ["php-cs-fixer fix"]
  }
}
```

---

## 📈 **Maintenance & Updates**

### **Version Management**

#### ✅ **Semantic Versioning**
```json
// composer.json
{
  "name": "vendor/fluid-storybook",
  "version": "1.2.3",  // MAJOR.MINOR.PATCH
  "require": {
    "typo3/cms-core": "^12.4"
  }
}
```

### **Regular Maintenance Tasks**

#### ✅ **Weekly/Monthly Checklists**
```bash
# Weekly
- [ ] Update npm dependencies
- [ ] Run security audit (npm audit)
- [ ] Check for TYPO3 security updates
- [ ] Review error logs

# Monthly  
- [ ] Update major dependencies
- [ ] Performance review
- [ ] Documentation updates
- [ ] Clean up unused assets
```

---

**Diese Best Practices sollten als lebende Dokumentation behandelt und regelmäßig basierend auf neuen Erkenntnissen und Feedback aktualisiert werden.** 🔄 
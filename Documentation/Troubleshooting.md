# Troubleshooting & FAQ

This document provides solutions to common issues and frequently asked questions about the TYPO3 Fluid Storybook integration.

## 🚨 **Common Issues & Solutions**

### **1. API Endpoint Not Found (404)**

**Problem**: Storybook shows "APIError: API request failed" with status 404.

**Solutions**:
- ✅ **Check Extension Installation**: Ensure `fluid_storybook` extension is installed and activated
- ✅ **Verify TYPO3 Context**: API requires `Development` context
- ✅ **Check Routing**: Verify API routes are loaded:
  ```bash
  # Check if routes are registered
  ./vendor/bin/typo3 routing:list
  ```
- ✅ **Clear Caches**: Clear all TYPO3 caches
- ✅ **Check URL**: Verify the correct API endpoint URL

### **2. CORS Errors in Browser**

**Problem**: "Access to fetch blocked by CORS policy"

**Solutions**:
```bash
# Check your CORS configuration
FLUID_STORYBOOK_CORS_ALLOWED_ORIGINS=http://localhost:6006,https://your-storybook.com

# For DDEV
FLUID_STORYBOOK_CORS_ALLOWED_ORIGINS=http://localhost:6006,https://your-project.ddev.site:6006
```

### **3. Template Not Found**

**Problem**: "Template could not be loaded" errors

**Solutions**:
- ✅ **Check Template Path**: Verify exact `EXT:` syntax:
  ```javascript
  templatePath: 'EXT:my_extension/Resources/Private/Templates/MyTemplate.html'
  ```
- ✅ **File Permissions**: Ensure TYPO3 can read the template files
- ✅ **Extension Key**: Verify extension key spelling
- ✅ **File Extension**: Must be `.html`, not `.fluid`

### **4. Storybook Won't Start**

**Problem**: `npm run storybook` fails or doesn't start

**Solutions**:
```bash
# Navigate to correct directory
cd Resources/Public/Storybook

# Clean install
rm -rf node_modules package-lock.json
npm install

# Check for port conflicts
npm run storybook -- --port 6007

# Check Node.js version (requires 16+)
node --version
```

### **5. Environment Variables Not Working**

**Problem**: Configuration changes don't take effect

**Solutions**:
- ✅ **Restart Services**: Restart TYPO3/web server after .env changes
- ✅ **Check Syntax**: Verify environment variable format:
  ```bash
  FLUID_STORYBOOK_CACHE_LIFETIME=7200  # No spaces around =
  ```
- ✅ **DDEV Integration**: For DDEV, add to `.ddev/config.yaml`:
  ```yaml
  web_environment:
    - FLUID_STORYBOOK_TYPO3_BASE_URL=https://my-project.ddev.site
  ```

### **6. JavaScript/TypeScript Errors**

**Problem**: TypeScript compilation errors or runtime JavaScript errors

**Solutions**:
```bash
# Check TypeScript compilation
cd Resources/Public/Storybook
npm run build

# Update dependencies
npm update

# Check for conflicting versions
npm ls
```

### **7. Performance Issues**

**Problem**: Slow rendering or high memory usage

**Solutions**:
```bash
# Enable production settings
FLUID_STORYBOOK_CACHE_LIFETIME=7200
FLUID_STORYBOOK_PERFORMANCE_MONITORING=false
FLUID_STORYBOOK_RATE_LIMIT_MAX_REQUESTS=50

# Clear old cache entries
./vendor/bin/typo3 cache:flush
```

---

## ❓ **Frequently Asked Questions**

### **Q: Can I use this extension in production?**
**A**: The extension is designed for development. The API endpoints are restricted to `Development` context for security. For production Storybook deployments, use static builds or CDN hosting.

### **Q: Which TYPO3 versions are supported?**
**A**: Currently supports TYPO3 v12 LTS. See `Documentation/TYPO3VersionCompatibility.md` for detailed version compatibility analysis.

### **Q: How do I add custom ViewHelpers?**
**A**: Custom ViewHelpers registered in your TYPO3 installation work automatically. See `Documentation/FluidViewHelpers.md` for details and limitations.

### **Q: Can I preview content elements with real data?**
**A**: Yes! Use the Dynamic Data API feature. See `Documentation/DynamicData.md` for setup and security considerations.

### **Q: How do I contribute to this project?**
**A**: See `Documentation/Contributing.md` for contribution guidelines and development setup.

### **Q: Why are my styles not applying in Storybook?**
**A**: Ensure your CSS is loaded in Storybook. Add CSS imports to `.storybook/preview.js` or use the theming system described in `Documentation/Theming.md`.

### **Q: How do I handle complex Fluid templates with layouts and partials?**
**A**: The extension supports full Fluid features including layouts and partials. See `Documentation/FluidViewHelpers.md` for examples.

### **Q: Can I automatically generate stories from my templates?**
**A**: Use the CLI command to generate a template manifest:
```bash
./vendor/bin/typo3 storybook:generate-manifest
```
Then use the "Manifest Driven Story" feature.

### **Q: How do I optimize performance for large projects?**
**A**: 
- Enable caching in production
- Use environment-specific settings
- Implement proper CORS configuration
- See `Documentation/EnvironmentConfiguration.md` for optimization tips

### **Q: What security considerations should I be aware of?**
**A**: 
- Never enable in production without security hardening
- API endpoints are Development-context only
- Dynamic Data API has strict table allowlists
- See `Documentation/Security.md` for complete security guidelines

---

## 🔧 **Debug Mode & Logging**

### **Enable Debug Logging**
```bash
# Enable performance monitoring and verbose logging
FLUID_STORYBOOK_PERFORMANCE_MONITORING=true

# Check browser console for detailed error messages
# Check TYPO3 logs in var/log/ for server-side errors
```

### **Debug Template Rendering**
```javascript
// In your story, add error handling
window.FluidTemplate({
  templatePath: 'EXT:my_ext/Resources/Private/Templates/Debug.html',
  variables: { debug: true }
})
.then(html => console.log('Rendered HTML:', html))
.catch(error => console.error('Full error details:', error));
```

### **API Endpoint Testing**
```bash
# Test API directly
curl "http://localhost/api/fluid/render?templatePath=EXT:my_ext/Resources/Private/Templates/Test.html&variables={}"
```

---

## 📞 **Getting Help**

1. **Check this troubleshooting guide first**
2. **Review relevant documentation** in the `Documentation/` folder
3. **Search existing GitHub issues** for similar problems
4. **Create a new GitHub issue** with:
   - TYPO3 version
   - Extension version  
   - Full error messages
   - Steps to reproduce
   - Environment details (DDEV, Docker, local server)

---

## 🚀 **Performance Monitoring**

Enable performance monitoring to identify bottlenecks:

```bash
FLUID_STORYBOOK_PERFORMANCE_MONITORING=true
```

Check browser console for performance logs and server logs for detailed timing information. 
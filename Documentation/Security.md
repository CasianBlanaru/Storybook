# Security Guidelines

This document outlines important security considerations for the TYPO3 Fluid Storybook integration.

## 🔒 **Security Overview**

The `fluid_storybook` extension is **designed for development environments only**. It provides powerful features that can expose internal system information, making security hardening essential for any production-like usage.

## ⚠️ **Critical Security Warnings**

### **1. Development Context Only**
```php
// API endpoints are restricted to Development context
if (!Environment::getContext()->isDevelopment()) {
    throw new \RuntimeException('API only available in Development context');
}
```

**Never override this restriction without thorough security hardening.**

### **2. Database Access Restrictions**
The Dynamic Data API is limited to specific tables:
```php
private const ALLOWED_TABLES = [
    'tt_content',
    'pages',
    'sys_file',
    'sys_file_reference'
];
```

### **3. CORS Configuration**
Strictly control which domains can access your API:
```bash
# Production: Only specific domains
FLUID_STORYBOOK_CORS_ALLOWED_ORIGINS=https://storybook.yourdomain.com

# Development: Localhost only
FLUID_STORYBOOK_CORS_ALLOWED_ORIGINS=http://localhost:6006,http://localhost:6007
```

---

## 🛡️ **Security Best Practices**

### **Environment Separation**

#### ✅ **Recommended Setup**
```bash
# .env.development
TYPO3_CONTEXT=Development
FLUID_STORYBOOK_PERFORMANCE_MONITORING=true
FLUID_STORYBOOK_RATE_LIMIT_MAX_REQUESTS=200

# .env.production  
TYPO3_CONTEXT=Production  # API will be disabled
FLUID_STORYBOOK_PERFORMANCE_MONITORING=false
FLUID_STORYBOOK_RATE_LIMIT_MAX_REQUESTS=50
```

#### ❌ **Avoid These Practices**
```bash
# DON'T: Enable in production without hardening
TYPO3_CONTEXT=Production  # With API endpoints active

# DON'T: Open CORS to all domains
FLUID_STORYBOOK_CORS_ALLOWED_ORIGINS=*

# DON'T: Disable rate limiting
FLUID_STORYBOOK_RATE_LIMIT_MAX_REQUESTS=999999
```

### **Rate Limiting**

Configure appropriate rate limits for different environments:

```bash
# Development (permissive)
FLUID_STORYBOOK_RATE_LIMIT_MAX_REQUESTS=200
FLUID_STORYBOOK_RATE_LIMIT_WINDOW_MINUTES=15

# Staging (moderate)
FLUID_STORYBOOK_RATE_LIMIT_MAX_REQUESTS=100
FLUID_STORYBOOK_RATE_LIMIT_WINDOW_MINUTES=10

# Production (restrictive)
FLUID_STORYBOOK_RATE_LIMIT_MAX_REQUESTS=50
FLUID_STORYBOOK_RATE_LIMIT_WINDOW_MINUTES=10
```

### **File System Security**

#### **Template Path Validation**
```javascript
// Only allow EXT: paths
const isValidPath = (path) => {
  return path.startsWith('EXT:') && !path.includes('..');
};
```

#### **File Permissions**
```bash
# Ensure proper file permissions
chmod 644 Resources/Private/Templates/*.html
chmod 755 Resources/Private/Templates/
```

---

## 🌐 **Network Security**

### **HTTPS Requirements**

For any production-like environment:
```bash
# Force HTTPS for all endpoints
FLUID_STORYBOOK_TYPO3_BASE_URL=https://your-secure-domain.com
FLUID_STORYBOOK_STORYBOOK_BASE_URL=https://storybook.your-secure-domain.com
```

### **IP Restrictions**

Consider implementing IP-based restrictions in your web server:

```nginx
# Nginx example
location /api/fluid/ {
    allow 192.168.1.0/24;  # Internal network
    allow 127.0.0.1;       # Localhost
    deny all;
    # ... rest of configuration
}
```

```apache
# Apache example
<Location "/api/fluid/">
    Require ip 192.168.1
    Require ip 127.0.0.1
</Location>
```

### **Firewall Rules**

```bash
# UFW example - restrict Storybook port
sudo ufw allow from 192.168.1.0/24 to any port 6006
sudo ufw deny 6006
```

---

## 🔍 **Security Monitoring**

### **Enable Security Logging**

```bash
# Enhanced monitoring for security events
FLUID_STORYBOOK_PERFORMANCE_MONITORING=true
```

### **Log Analysis**

Monitor these log patterns:
```bash
# Check for suspicious API usage
grep "fluid/render" var/log/typo3_*.log

# Monitor rate limit hits
grep "Rate limit exceeded" var/log/typo3_*.log

# Check for invalid template paths
grep "Template not found" var/log/typo3_*.log
```

### **Automated Alerts**

Set up alerts for:
- Excessive API requests from single IP
- Invalid template path attempts
- CORS violations
- Unusual response times

---

## 🏗️ **Advanced Security Hardening**

### **1. API Authentication** (Future Enhancement)

For production-like usage, consider implementing:
```bash
# JWT token authentication
FLUID_STORYBOOK_JWT_SECRET=your-strong-secret-key
FLUID_STORYBOOK_JWT_EXPIRY=3600
```

### **2. Request Signing**

Implement HMAC request signing:
```javascript
// Generate signed requests
const signature = hmacSha256(`${timestamp}${templatePath}${variables}`, secretKey);
```

### **3. Content Security Policy**

```html
<!-- In your Storybook HTML -->
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline'; 
               style-src 'self' 'unsafe-inline';
               connect-src 'self' https://your-typo3-api.com;">
```

### **4. API Gateway**

Use an API gateway for additional security:
- Request throttling
- IP whitelisting  
- Authentication
- Request/response filtering

---

## 🚨 **Incident Response**

### **Security Breach Detection**

Signs of potential security issues:
- Unusual API request patterns
- High server load from API endpoints
- Template path traversal attempts
- CORS errors from unknown domains

### **Immediate Response Steps**

1. **Disable API Access**:
   ```bash
   # Emergency: Switch to Production context
   echo "TYPO3_CONTEXT=Production" >> .env
   ```

2. **Block Suspicious IPs**:
   ```bash
   # Add firewall rules
   sudo ufw deny from [suspicious-ip]
   ```

3. **Review Logs**:
   ```bash
   # Analyze access patterns
   tail -f var/log/typo3_*.log | grep "fluid"
   ```

4. **Clear Caches**:
   ```bash
   # Clear all caches
   ./vendor/bin/typo3 cache:flush
   ```

---

## ✅ **Security Checklist**

### **Development Environment**
- [ ] TYPO3_CONTEXT set to Development
- [ ] CORS limited to localhost
- [ ] Rate limiting configured
- [ ] File permissions correct
- [ ] HTTPS enabled (recommended)

### **Staging Environment**
- [ ] API access restricted by IP
- [ ] CORS limited to staging domains
- [ ] Enhanced monitoring enabled
- [ ] Regular security scans

### **Production Environment**
- [ ] API completely disabled OR
- [ ] Extensive security hardening implemented
- [ ] Authentication required
- [ ] All traffic over HTTPS
- [ ] Comprehensive monitoring
- [ ] Regular security audits

---

## 📚 **Security Resources**

- [TYPO3 Security Guidelines](https://docs.typo3.org/m/typo3/reference-coreapi/master/en-us/Security/)
- [OWASP API Security Top 10](https://owasp.org/www-project-api-security/)
- [Storybook Security Best Practices](https://storybook.js.org/docs/react/writing-docs/build-documentation)

---

## 📞 **Reporting Security Issues**

If you discover a security vulnerability:

1. **Do NOT create a public GitHub issue**
2. **Email security details privately** to the maintainers
3. **Include**: 
   - Detailed description
   - Steps to reproduce
   - Potential impact
   - Suggested fixes (if any)

We will respond promptly and coordinate responsible disclosure. 
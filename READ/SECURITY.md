# Security Guidelines - FTOH Haxball Bot

## 🔐 Security Best Practices

### **1. Environment Variables Management**

**✅ Safe to Commit (.env.example):**
```bash
# Server Configuration
NODE_ENV=production
PORT=3001
BACKEND_URL=https://your-domain.com
FRONTEND_URL=https://your-frontend-domain.com

# Security (use strong values in production)
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
CORS_ORIGIN=https://your-frontend-domain.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Database Configuration (placeholders only)
DATABASE_URL=postgresql://postgres:YOUR_DB_PASSWORD@YOUR_DB_HOST:5432/YOUR_DB_NAME
DB_HOST=your-db-host.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=your-database-password

# Supabase Configuration (placeholders only)
SUPABASE_PROJECT_ID=your-project-id
SUPABASE_API_URL=https://your-project-id.supabase.co
SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
SUPABASE_SECRET_KEY=your-supabase-secret-key
SUPABASE_JWT_SECRET=your-supabase-jwt-secret
```

**❌ Never Commit (.env):**
```bash
# REAL VALUES - NEVER COMMIT THESE
JWT_SECRET=super-secret-real-key-32-chars-minimum
DATABASE_URL=postgresql://postgres:realpassword@realhost:5432/realdatabase
SUPABASE_SECRET_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
HAXBALL_TOKEN=real-haxball-token
```

### **2. Git Security Rules**

**Files to NEVER commit:**
- ✅ `.env` - Contains real secrets
- ✅ `.env.local` - Local development secrets
- ✅ `.env.production.local` - Production secrets
- ✅ `*.key` - Private keys
- ✅ `*.pem` - Certificate files
- ✅ `secrets/` - Directory with secrets
- ✅ `credentials/` - Directory with credentials

**Files SAFE to commit:**
- ✅ `.env.example` - Template with placeholders only
- ✅ `.gitignore` - Git ignore rules
- ✅ `SECURITY.md` - This security documentation

### **3. Production Deployment Checklist**

**Before deploying to production:**

1. **🔐 Environment Variables:**
   ```bash
   # Check .env contains real values, not placeholders
   grep "your-" .env  # Should return nothing
   grep "YOUR_" .env  # Should return nothing
   ```

2. **🚀 Database Security:**
   - ✅ Use strong database passwords
   - ✅ Enable SSL connections
   - ✅ Restrict database access to application servers only
   - ✅ Use connection pooling

3. **🔑 JWT Security:**
   - ✅ Use minimum 32-character JWT secret
   - ✅ Set reasonable token expiry (24h recommended)
   - ✅ Use HTTP-only cookies for token storage
   - ✅ Implement token refresh mechanism

4. **🛡️ API Security:**
   - ✅ Enable CORS with specific origins
   - ✅ Implement rate limiting
   - ✅ Use HTTPS in production
   - ✅ Validate all input parameters
   - ✅ Sanitize user inputs

5. **📊 Logging & Monitoring:**
   - ✅ Log security events (failed logins, etc.)
   - ✅ Monitor for suspicious activity
   - ✅ Set up alerts for security incidents
   - ✅ Use structured logging

### **4. Development Security**

**Local Development:**
```bash
# 1. Copy template
cp .env.example .env

# 2. Fill with real values (never commit .env)
# Edit .env with your actual credentials

# 3. Verify .gitignore is working
git status  # Should NOT show .env file
```

**Team Development:**
- ✅ Share credentials securely (password manager, encrypted chat)
- ✅ Never share .env files via email or chat
- ✅ Use environment-specific .env files
- ✅ Rotate secrets regularly

### **5. GitHub Security Features**

**Enable in Repository Settings:**
- ✅ **Secret Scanning** - Detects committed secrets
- ✅ **Push Protection** - Blocks pushes with secrets
- ✅ **Dependabot** - Checks for vulnerable dependencies
- ✅ **Branch Protection** - Requires PR reviews

**If Push is Blocked:**
1. **Remove secrets from commits:**
   ```bash
   # Remove sensitive file from history
   git filter-branch --force --index-filter \
     'git rm --cached --ignore-unmatch .env' \
     --prune-empty --tag-name-filter cat -- --all
   ```

2. **Use GitHub's secret unblock URL** (temporarily allow)

3. **Force push cleaned history:**
   ```bash
   git push origin --force-with-lease
   ```

### **6. Secret Management Services**

**For Production:**
- ✅ **AWS Secrets Manager** - Store and rotate secrets
- ✅ **GitHub Secrets** - CI/CD environment variables
- ✅ **Docker Secrets** - Container secret management
- ✅ **Kubernetes Secrets** - Orchestration secrets

**Example GitHub Actions:**
```yaml
env:
  JWT_SECRET: ${{ secrets.JWT_SECRET }}
  DATABASE_URL: ${{ secrets.DATABASE_URL }}
  SUPABASE_SECRET_KEY: ${{ secrets.SUPABASE_SECRET_KEY }}
```

### **7. Regular Security Audits**

**Monthly Checklist:**
- ✅ Rotate all secrets and passwords
- ✅ Review .gitignore for completeness
- ✅ Audit GitHub repository security
- ✅ Check for committed secrets in history
- ✅ Update dependencies to latest secure versions
- ✅ Review access permissions

**Commands to Check for Secrets:**
```bash
# Check for common secret patterns in repository
git grep -i "password\|secret\|key\|token" --name-only

# Check for environment files that shouldn't be committed
git ls-files | grep -E "\.env|\.key|\.pem"

# Check for potential secrets in commit history
git log --all --full-history -- **/.env*
```

---

## 🚨 Emergency Response

**If Secrets Are Exposed:**

1. **🔒 Immediately rotate all exposed secrets**
2. **📢 Notify team members about exposure**
3. **🗑️ Remove secrets from repository history**
4. **🔍 Audit for unauthorized access**
5. **📋 Document incident and response**
6. **🔄 Update security practices**

**Contact Information:**
- **Security Team:** [security@your-domain.com]
- **GitHub Support:** For repository security issues
- **Supabase Support:** For database security incidents

---

## 📋 Quick Reference

| File | Safe to Commit? | Purpose |
|------|----------------|---------|
| `.env.example` | ✅ Yes | Template with placeholders |
| `.env` | ❌ No | Real environment variables |
| `.gitignore` | ✅ Yes | Git ignore rules |
| `SECURITY.md` | ✅ Yes | Security documentation |
| `*.key` | ❌ No | Private keys |
| `secrets/` | ❌ No | Directory with secrets |

**Remember:** If in doubt, don't commit it! Use environment variables and secret management services for all sensitive data.

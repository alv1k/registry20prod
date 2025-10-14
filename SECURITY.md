# Security Policy

## Security Incident Report

### Incident Details
- **Date**: October 14, 2025
- **Issue**: Google Cloud Service Account Key accidentally committed to public repository
- **Affected Commit**: a749623584e9ba9b78d818091a476fa0bdca0053
- **File**: `admin/sampleserviceAccountKey.json`

### Resolution Steps
1. ✅ Removed sensitive file from git history using `git filter-branch`
2. ✅ Force pushed updated history to remote repository
3. ✅ Updated `.gitignore` to prevent future accidental commits
4. ✅ Added security notices to README
5. ✅ Documented security best practices

### Immediate Actions Required
1. **Invalidate the compromised service account key** in Google Cloud Console
2. Generate a new service account key if needed
3. Review all Google Cloud resources for unauthorized access
4. Enable key rotation policies

## Security Best Practices

### Credential Management
- ❌ Never commit credentials to version control
- ✅ Use environment variables for secrets
- ✅ Store sensitive files in `.gitignore`
- ✅ Use secret management systems for production

### Service Account Keys
- ✅ Rotate keys every 90 days
- ✅ Enable expiration dates
- ✅ Limit key permissions to minimum required
- ✅ Use Workload Identity Federation when possible

### Git Security
- ✅ Regularly audit repository for sensitive data
- ✅ Use pre-commit hooks to scan for secrets
- ✅ Enable GitHub secret scanning
- ✅ Train team members on security practices

### Access Control
- ✅ Implement principle of least privilege
- ✅ Use IAM conditions for fine-grained access
- ✅ Regularly review access permissions
- ✅ Enable audit logging

## Reporting Security Issues

If you discover a security vulnerability in this project, please report it privately.

Contact: [alekseevaalena442@gmail.com](mailto:alekseevaalena442@gmail.com)

Please do not create public GitHub issues for security vulnerabilities.

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Additional Resources

- [Google Cloud Security Best Practices](https://cloud.google.com/security-best-practices)
- [GitHub Security Guide](https://docs.github.com/en/github/getting-started-with-github/learning-about-github/githubs-security-features)
- [Firebase Security Rules](https://firebase.google.com/docs/rules)
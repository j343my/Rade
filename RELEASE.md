# Release Process

## How to publish a new version

```bash
# 1. Bump the version (edits package.json + creates commit + tag)
npm version patch   # 0.1.0 → 0.1.1  (bug fix)
npm version minor   # 0.1.0 → 0.2.0  (new feature)
npm version major   # 0.1.0 → 1.0.0  (breaking change)

# 2. Push code + tag → triggers publish.yml on GitHub Actions
git push && git push --tags
```

GitHub Actions then:
- Runs `npm test`
- Publishes to npm via OIDC (no token needed — trusted publisher)
- Creates a GitHub Release with auto-generated notes

## Prerequisites

Trusted publisher must be configured on npmjs.com:
```
npmjs.com → rade-cli → Settings → Trusted Publishers
  Owner:    j343my
  Repo:     Rade
  Workflow: publish.yml
```

## Update CHANGELOG.md before releasing

Document what changed under the new version heading before pushing the tag.

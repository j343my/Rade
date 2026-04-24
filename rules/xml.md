---
description: "XML coding standards"
globs: "*.xml"
---

# XML — Coding Standards

## Generation
- Use **`text/template`** (Go) or equivalent templating engines for XML generation.
- **Never use regex** to parse XML — always use a proper parser (DOM or SAX).
- Escape special characters properly (`&amp;`, `&lt;`, `&gt;`, `&quot;`, `&apos;`).

## Structure
- Always include the XML declaration: `<?xml version="1.0" encoding="UTF-8"?>`.
- Use **2-space indentation**.
- Use **lowercase** for element and attribute names.
- Close all tags explicitly — avoid self-closing shortcuts unless they are standard (e.g., `<br/>` in XHTML).

## Validation
- Validate against **XSD** (XML Schema Definition) when available.
- If no XSD exists, document the expected structure in comments or a companion doc.
- Use DTD or RelaxNG as alternatives if XSD is not suitable.

## Testing
- Use **golden files** (expected output snapshots) for testing XML generation.
- Compare generated XML structurally (not string equality) when possible.
- Test with edge cases: empty elements, special characters, deeply nested structures.

## Namespaces
- Declare namespaces on the root element.
- Use short, meaningful prefixes (e.g., `xs:`, `soap:`, `app:`).
- Avoid default namespace changes in nested elements (confusing).

## Comments
- Add comments for non-obvious structures or business logic embedded in XML.
- Use `<!-- comment -->` syntax — never embed comments inside tags.

## Performance
- For large XML files, prefer SAX/streaming parsers over DOM.
- Avoid deeply nested structures (max 6–7 levels) for readability.

#!/usr/bin/env bash
#
# Rade — Setup Script
# Generates agent configuration files for Cursor, Claude Code, and Antigravity
# from your skills/ and rules/ definitions.
#
set -euo pipefail

RADE_DIR="$(cd "$(dirname "$0")" && pwd)"
RULES_DIR="$RADE_DIR/rules"
IMPORTED_RULES_DIR="$RULES_DIR/imported"
SKILLS_DIR="$RADE_DIR/skills"

# ── Colors ────────────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

info()  { echo -e "${CYAN}ℹ ${NC} $*"; }
ok()    { echo -e "${GREEN}✔ ${NC} $*"; }
warn()  { echo -e "${YELLOW}⚠ ${NC} $*"; }
err()   { echo -e "${RED}✖ ${NC} $*" >&2; }

# ── Usage ─────────────────────────────────────────────────────────────────────
usage() {
  cat <<EOF
${BOLD}Rade Setup${NC} — Generate agent config from skills & rules.

${BOLD}Usage:${NC}
  ./setup.sh <target-project-path> [options]

${BOLD}Options:${NC}
  --tool <name>    Agent tool(s): cursor | claude | antigravity | agents-md | all
                   Can be comma-separated or repeated. Default: all
  --context        Also generate a PROJECT_CONTEXT.md from template
  -h, --help       Show this help

${BOLD}Examples:${NC}
  ./setup.sh ~/projects/my-app                          # all tools
  ./setup.sh ~/projects/my-app --tool cursor             # cursor only
  ./setup.sh ~/projects/my-app --import https://github.com/PatrickJS/awesome-cursorrules
  ./setup.sh . --context                                 # all + project context
EOF
}

# ── Helpers ───────────────────────────────────────────────────────────────────

# Extract a frontmatter field from a rule .md file (e.g., description, globs)
extract_frontmatter_field() {
  local file="$1"
  local field="$2"
  awk -v field="$field" '
    /^---$/ { fm++; next }
    fm == 1 && $0 ~ "^"field":" {
      sub("^"field": *\"?", ""); sub("\"? *$", ""); print
    }
  ' "$file"
}

# Get the rule body (everything after the closing --- of frontmatter)
rule_body() {
  local file="$1"
  awk '
    /^---$/ { fm++; next }
    fm >= 2 { print }
  ' "$file"
}

# Extract the `instructions:` block from a YAML skill file (everything in the | block)
extract_instructions() {
  local yaml_file="$1"
  awk '
    /^instructions: \|/ { found=1; next }
    found && /^[a-z_]+:/ { exit }
    found { sub(/^  /, ""); print }
  ' "$yaml_file"
}

# Extract a simple field from YAML (e.g., display_name, short_description)
extract_field() {
  local yaml_file="$1"
  local field="$2"
  grep "^${field}:" "$yaml_file" | sed "s/^${field}: *\"\\{0,1\\}//; s/\"$//"
}

# ── Cursor Setup ──────────────────────────────────────────────────────────────
# Generates .mdc files with proper frontmatter (globs, description, alwaysApply)
setup_cursor() {
  local target="$1"
  local cursor_dir="$target/.cursor/rules"
  mkdir -p "$cursor_dir"

  # 1. Generate .mdc for all rules (local + imported)
  find "$RULES_DIR" -type f \( -name "*.md" -o -name "*.mdc" \) | while read -r rule_file; do
    local basename
    basename="$(basename "$rule_file")"
    [[ "$basename" == *.template ]] && continue

    local globs description mdc_name body
    globs=$(extract_frontmatter_field "$rule_file" "globs")
    description=$(extract_frontmatter_field "$rule_file" "description")
    body=$(rule_body "$rule_file")
    mdc_name="${basename%.md}.mdc"

    {
      echo "---"
      echo "description: \"${description:-Coding standards}\""
      if [ -n "$globs" ]; then
        echo "globs: \"$globs\""
      fi
      echo "alwaysApply: false"
      echo "---"
      echo ""
      echo "$body"
    } > "$cursor_dir/$mdc_name"
  done

  # 2. Generate one .mdc per skill (instructions injected, alwaysApply: true)
  for skill_file in "$SKILLS_DIR"/*.yaml; do
    [ -f "$skill_file" ] || continue
    local skill_name display_name short_desc instructions
    skill_name="$(basename "$skill_file" .yaml)"
    display_name=$(extract_field "$skill_file" "display_name")
    short_desc=$(extract_field "$skill_file" "short_description")
    instructions=$(extract_instructions "$skill_file")

    {
      echo "---"
      echo "description: \"${display_name}: ${short_desc}\""
      echo "alwaysApply: true"
      echo "---"
      echo ""
      echo "# ${display_name}"
      echo ""
      echo "$instructions"
    } > "$cursor_dir/rade-skill-${skill_name}.mdc"
  done

  # 3. If project context template exists, generate an alwaysApply context rule
  if [ -f "$RULES_DIR/00-project-context.md.template" ]; then
    {
      echo "---"
      echo "description: \"Project context — always loaded\""
      echo "alwaysApply: true"
      echo "---"
      echo ""
      cat "$RULES_DIR/00-project-context.md.template"
    } > "$cursor_dir/00-project-context.mdc"
  fi

  ok "Cursor: generated .mdc files in ${BOLD}.cursor/rules/${NC}"
  info "  Rules: $(ls "$cursor_dir"/*.mdc 2>/dev/null | wc -l) files"
}

# ── Claude Code Setup ─────────────────────────────────────────────────────────
# Generates a single CLAUDE.md with skills instructions + all rules
setup_claude() {
  local target="$1"
  local claude_file="$target/CLAUDE.md"

  {
    echo "<!-- Auto-generated by Rade on $(date -u +%Y-%m-%dT%H:%M:%SZ) -->"
    echo ""

    # Inject skill instructions
    for skill_file in "$SKILLS_DIR"/*.yaml; do
      [ -f "$skill_file" ] || continue
      local display_name instructions
      display_name=$(extract_field "$skill_file" "display_name")
      instructions=$(extract_instructions "$skill_file")

      echo "# ${display_name}"
      echo ""
      echo "$instructions"
      echo ""
    done

    # Inject project context template
    if [ -f "$RULES_DIR/00-project-context.md.template" ]; then
      echo "---"
      echo ""
      cat "$RULES_DIR/00-project-context.md.template"
      echo ""
    fi

    # Inject all rules (strip frontmatter)
    # Inject all rules (strip frontmatter)
    find "$RULES_DIR" -type f \( -name "*.md" -o -name "*.mdc" \) | while read -r rule_file; do
      [[ "$(basename "$rule_file")" == *.template ]] && continue
      echo "---"
      echo ""
      rule_body "$rule_file"
      echo ""
    done
  } > "$claude_file"

  ok "Claude Code: generated ${BOLD}CLAUDE.md${NC} (skills + rules)"
}

# ── Antigravity Setup ─────────────────────────────────────────────────────────
# Copies rules and skills natively (Antigravity reads YAML and .md directly)
setup_antigravity() {
  local target="$1"
  local ag_rules="$target/.agents/rules"
  local ag_skills="$target/.agents/skills"
  mkdir -p "$ag_rules" "$ag_skills"

  find "$RULES_DIR" -type f \( -name "*.md" -o -name "*.mdc" \) | while read -r rule_file; do
    [[ "$(basename "$rule_file")" == *.template ]] && continue
    # For imported rules, keep the folder structure if possible or flatten
    cp "$rule_file" "$ag_rules/"
  done

  cp "$SKILLS_DIR"/*.yaml "$ag_skills/" 2>/dev/null || true

  if [ -f "$RULES_DIR/00-project-context.md.template" ]; then
    cp "$RULES_DIR/00-project-context.md.template" "$ag_rules/"
  fi

  ok "Antigravity: installed in ${BOLD}.agents/{rules,skills}/${NC}"
}

# ── AGENTS.md Setup ───────────────────────────────────────────────────────────
# Generates a single AGENTS.md at project root (simple alternative to .cursor/rules)
setup_agents_md() {
  local target="$1"
  local agents_file="$target/AGENTS.md"

  {
    echo "<!-- Auto-generated by Rade on $(date -u +%Y-%m-%dT%H:%M:%SZ) -->"
    echo ""

    # Inject skill instructions
    for skill_file in "$SKILLS_DIR"/*.yaml; do
      [ -f "$skill_file" ] || continue
      local display_name instructions
      display_name=$(extract_field "$skill_file" "display_name")
      instructions=$(extract_instructions "$skill_file")

      echo "# ${display_name}"
      echo ""
      echo "$instructions"
      echo ""
    done

    # Inject project context template
    if [ -f "$RULES_DIR/00-project-context.md.template" ]; then
      echo "---"
      echo ""
      cat "$RULES_DIR/00-project-context.md.template"
      echo ""
    fi

    # Inject all rules (strip frontmatter)
    # Inject all rules (strip frontmatter)
    find "$RULES_DIR" -type f \( -name "*.md" -o -name "*.mdc" \) | while read -r rule_file; do
      [[ "$(basename "$rule_file")" == *.template ]] && continue
      echo "---"
      echo ""
      rule_body "$rule_file"
      echo ""
    done
  } > "$agents_file"

  ok "AGENTS.md: generated at project root (${BOLD}AGENTS.md${NC})"
}

# ── Rule Importer ─────────────────────────────────────────────────────────────
import_rules_from_url() {
  local url="$1"
  local repo_name
  repo_name=$(basename "$url" .git)
  local target_dir="$IMPORTED_RULES_DIR/$repo_name"

  info "Importing rules from $url..."
  mkdir -p "$target_dir"

  local tmp_dir
  tmp_dir=$(mktemp -d)
  
  if git clone --depth 1 "$url" "$tmp_dir" >/dev/null 2>&1; then
    # Find .md, .mdc, or .cursorrules files
    find "$tmp_dir" -maxdepth 3 -type f \( -name "*.md" -o -name "*.mdc" -o -name ".cursorrules" \) | while read -r src; do
      local name
      name=$(basename "$src")
      # Rename .cursorrules to something more explicit if needed, but Rade likes .md
      [[ "$name" == ".cursorrules" ]] && name="cursorrules.md"
      
      cp "$src" "$target_dir/$name"
    done
    ok "Imported rules into ${BOLD}rules/imported/$repo_name/${NC}"
  else
    err "Failed to clone repository: $url"
  fi
  rm -rf "$tmp_dir"
}

# ── Context generator ─────────────────────────────────────────────────────────
generate_context() {
  local target="$1"
  local context_file="$target/PROJECT_CONTEXT.md"

  if [ -f "$context_file" ]; then
    warn "PROJECT_CONTEXT.md already exists — skipping"
    return
  fi

  cp "$RULES_DIR/00-project-context.md.template" "$context_file"
  ok "Generated ${BOLD}PROJECT_CONTEXT.md${NC} — fill it with your project details"
}

# ── Helpers: run a single tool ────────────────────────────────────────────────
run_tool() {
  local tool_name="$1"
  local target="$2"
  case "$tool_name" in
    cursor)       setup_cursor "$target" ;;
    claude)       setup_claude "$target" ;;
    antigravity)  setup_antigravity "$target" ;;
    agents-md)    setup_agents_md "$target" ;;
    *)
      err "Unknown tool: $tool_name (expected: cursor, claude, antigravity, agents-md)"
      exit 1
      ;;
  esac
}

# ── Main ──────────────────────────────────────────────────────────────────────
main() {
  local target=""
  local tools=()
  local with_context=false

  while [[ $# -gt 0 ]]; do
    case "$1" in
      -h|--help) usage; exit 0 ;;
      --tool)
        # Split comma-separated values and append
        IFS=',' read -ra parts <<< "${2:-}"
        for part in "${parts[@]}"; do
          tools+=("$(echo "$part" | xargs)") # trim whitespace
        done
        shift 2
        ;;
      --import)
        import_rules_from_url "${2:-}"
        shift 2
        ;;
      --context) with_context=true; shift ;;
      *)
        if [ -z "$target" ]; then
          target="$1"; shift
        else
          err "Unknown argument: $1"; usage; exit 1
        fi
        ;;
    esac
  done

  # Default to all if no --tool specified
  if [ ${#tools[@]} -eq 0 ]; then
    tools=("all")
  fi

  if [ -z "$target" ]; then
    err "Missing target project path"
    echo ""; usage; exit 1
  fi

  target="$(cd "$target" 2>/dev/null && pwd)" || {
    err "Target directory does not exist: $target"
    exit 1
  }

  echo ""
  echo -e "${BOLD}🤖 Rade Setup${NC}"
  echo -e "   Source:  $RADE_DIR"
  echo -e "   Target:  $target"
  echo -e "   Tools:   ${tools[*]}"
  echo ""

  for tool in "${tools[@]}"; do
    if [ "$tool" = "all" ]; then
      run_tool "cursor" "$target"
      run_tool "claude" "$target"
      run_tool "antigravity" "$target"
    else
      run_tool "$tool" "$target"
    fi
  done

  if $with_context; then
    generate_context "$target"
  fi

  echo ""
  ok "Done! Your project is now Rade-powered. 🚀"
  echo ""
}

main "$@"

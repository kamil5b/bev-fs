#!/bin/bash

# Parse command line arguments for per-package bump flags
declare -A BUMP_OVERRIDES

for arg in "$@"; do
  case $arg in
    --bump-major=*)
      PKG="${arg#*=}"
      BUMP_OVERRIDES["$PKG"]="major"
      ;;
    --bump-minor=*)
      PKG="${arg#*=}"
      BUMP_OVERRIDES["$PKG"]="minor"
      ;;
    --bump-patch=*)
      PKG="${arg#*=}"
      BUMP_OVERRIDES["$PKG"]="patch"
      ;;
  esac
done

check_and_publish() {
    
    cd "$1" || { echo "Error: Directory '$1' not found." >&2; exit 1; }


    local package_info=$(bun run node -e "
        const pkg = require('./package.json');
        console.log(\`\${pkg.version} \${pkg.name}\`);
    " 2>/dev/null)
    
    if [ $? -ne 0 ] || [ -z "$package_info" ]; then
        echo "Error: Could not read or parse package.json in '$1'." >&2
        cd - > /dev/null
        return 1
    fi

    local local_pkg_version=$(echo "$package_info" | awk '{print $1}')
    local pkg_name=$(echo "$package_info" | awk '{print $2}')


    
    local latest_version_json=$(bun info "$pkg_name" --json 2>/dev/null)
    
    
    local latest_version=$(echo "$latest_version_json" | bun run node -e "
        try {
            const data = JSON.parse(require('fs').readFileSync(0, 'utf8'));
            if (data && data.versions && data.versions.length > 0) {
                console.log(data.versions[data.versions.length - 1]);
            }
            // If the package is not found, 'data.versions' will be null/undefined, resulting in empty output, which is handled below.
        } catch (e) {}
    " 2>/dev/null)


    local display_latest="${latest_version:-none}"

    if [[ "$local_pkg_version" == "$latest_version" ]]; then
        echo "$pkg_name: Version **$local_pkg_version** is already published. Bumping version..."
        
        # Determine bump type: use override if set, otherwise skip
        local bump_type="${BUMP_OVERRIDES[$pkg_name]:-}"
        
        if [ -z "$bump_type" ]; then
            echo "$pkg_name: No bump specified. Use --bump-major=$pkg_name, --bump-minor=$pkg_name, or --bump-patch=$pkg_name"
            cd - > /dev/null
            return 1
        fi
        
        # Bump version using npm version
        npm version "$bump_type" --no-git-tag-version --silent 2>/dev/null || true
        
        bun run build || { echo "Build failed for $pkg_name"; cd - > /dev/null; return 1; }
        bun publish --no-git-checks || { echo "Publish failed for $pkg_name"; cd - > /dev/null; return 1; }
    else
        echo "$pkg_name: Local version **$local_pkg_version** differs from latest **$display_latest**. Publishing..."
        
        bun run build || { echo "Build failed for $pkg_name"; cd - > /dev/null; return 1; }
        bun publish --no-git-checks || { echo "Publish failed for $pkg_name"; cd - > /dev/null; return 1; }
    fi

    cd - > /dev/null
}

# Calculate absolute path to workspace (go up one level from scripts dir)
WORKSPACE_ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." && pwd )"

# Map package names to directories
declare -A PKG_DIRS
PKG_DIRS["create-bev-fs"]="$WORKSPACE_ROOT/packages/cli"
PKG_DIRS["bev-fs"]="$WORKSPACE_ROOT/packages/framework"

check_and_publish "$WORKSPACE_ROOT/packages/cli"
check_and_publish "$WORKSPACE_ROOT/packages/framework"
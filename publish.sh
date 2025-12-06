#!/bin/bash

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
        echo "$pkg_name: Version **$local_pkg_version** is already published. Skipping."
    else
        echo "$pkg_name: Local version **$local_pkg_version** differs from latest **$display_latest**. Publishing..."
        
        bun run build
        bun publish --no-git-checks
    fi

    cd - > /dev/null
}

check_and_publish "$(dirname "$0")/packages/cli"
check_and_publish "$(dirname "$0")/packages/framework"
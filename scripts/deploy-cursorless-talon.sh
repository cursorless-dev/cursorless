# Check out staging branch
git switch -c cursorless-talon-staging origin/cursorless-talon-staging

# Fetch current cursorless-talon main
git remote add cursorless-talon 'https://github.com/cursorless-dev/cursorless-talon.git'
git fetch cursorless-talon

# Sanity check that cursorless-talon/main is identical to cursorless-talon-staging
[[ "$(git rev-parse cursorless-talon/main^{tree})" == "$(git rev-parse cursorless-talon-staging^{tree})" ]]

# Tag previous version of staging branch
git tag cursorless-talon-staging-previous cursorless-talon-staging

# Update the staging branch
git subtree split --prefix=cursorless-talon --branch=cursorless-talon-staging

# Checkout and cherry-pick commits onto cursorless-talon/main
git switch -c cursorless-talon-main cursorless-talon/main
git cherry-pick cursorless-talon-staging-previous..cursorless-talon-staging

# Push to cursorless-talon
git push

# Checkout and push staging branch
git switch cursorless-talon-staging
git push
# This script is used to push the cursorless.nvim
# see https://github.com/orgs/community/discussions/26615
# see https://github.com/cursorless-dev/cursorless/blob/main/.github/workflows/deploy.yaml
# see https://github.com/hands-free-vim/github-app-test-1/blob/main/.github/workflows/deploy.yaml
# see https://github.com/cursorless-dev/cursorless/blob/main/scripts/build-and-assemble-website.sh

set -euo pipefail

root_dir=dist/cursorless.nvim
mkdir -p "$root_dir"

# Merge the build .js and the static files
mkdir workdir
cd workdir

mkdir -p "$root_dir/assets/cursorless-snippets"

# copy .lua and .vim dependencies as well as other static files
cp -r cursorless.nvim/* "$root_dir"

# copy the built .js file
mkdir -p "$root_dir/node/cursorless-neovim/out"
cp packages/cursorless-neovim/package.json "$root_dir/node/cursorless-neovim/"
cp packages/cursorless-neovim/out/index.cjs "$root_dir/node/cursorless-neovim/out/"

# command-server if done from cursorless mono repo?
# cp -r command-server.nvim "$root_dir/node/"

cd "$root_dir"
git add *
git commit -m "Deploy cursorless.nvim"
git push
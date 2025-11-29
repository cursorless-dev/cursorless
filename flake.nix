{
  description = "A Nix-flake-based development environment for Cursorless";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
  };

  outputs =
    { self, nixpkgs }:
    let
      supportedSystems = [
        "x86_64-linux"
        "aarch64-linux"
        "x86_64-darwin"
        "aarch64-darwin"
      ];
      forEachSupportedSystem =
        f:
        nixpkgs.lib.genAttrs supportedSystems (
          system:
          f {
            pkgs = import nixpkgs {
              inherit system;
              overlays = [
                (final: prev: {
                  neovim = prev.neovim.override { withNodeJs = true; };
                })
              ];
            };
          }
        );
      pythonVersion = builtins.replaceStrings [ "py" ] [
        "python"
      ] (nixpkgs.lib.importTOML ./pyproject.toml).tool.ruff.target-version;
    in
    {
      devShells = forEachSupportedSystem (
        { pkgs }:
        {
          default = pkgs.mkShell {
            packages =
              let
                python = pkgs.${pythonVersion};
                pythonPackages = pkgs."${pythonVersion}Packages";
              in
              [
                pkgs.corepack
                pkgs.vsce
                pkgs.nodejs_20

                python
                pkgs.lua-language-server # language server used by pre-commit hooks

                pkgs.neovim
                pkgs.luajitPackages.busted # for lua testing
                pkgs.luarocks # pre-commit doesn't auto-install luarocks
                pkgs.ps
              ];
            # To prevent weird broken non-interactive bash terminal
            buildInputs = [ pkgs.bashInteractive ];
            shellHook = ''
              if [ ! -f .git/hooks/pre-commit ]; then
                echo "You can run 'pre-commit install' to install git commit hooks if you want them."
              fi
              pnpm install

              PATH=${pkgs.lib.getBin pkgs.neovim}/bin:$PATH}
            '';
          };
        }
      );
    };
}

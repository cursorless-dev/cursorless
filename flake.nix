{
  description = "A Nix-flake-based development environment for Cursorless";

  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";

  outputs = { self, nixpkgs }:
    let
      overlays = [
        (final: prev: rec {
          nodejs = prev.nodejs-18_x;
          pnpm = prev.nodePackages.pnpm;
        })
      ];
      supportedSystems =
        [ "x86_64-linux" "aarch64-linux" "x86_64-darwin" "aarch64-darwin" ];
      forEachSupportedSystem = f:
        nixpkgs.lib.genAttrs supportedSystems (system:
          f {
            pkgs = import nixpkgs {
              inherit overlays system;
              config.allowUnfree = true;
            };
          });
      pythonVersion = builtins.replaceStrings
        [ "py" ]
        [ "python" ]
        (nixpkgs.lib.importTOML ./pyproject.toml).tool.ruff.target-version;
    in
    {
      devShells = forEachSupportedSystem ({ pkgs }: {
        default = pkgs.mkShell {
          packages = with pkgs; [
            nodejs
            pnpm
            pkgs.${pythonVersion}
            vsce
            pre-commit
          ];
          # To prevent weird broken non-interactive bash terminal
          buildInputs = [ pkgs.bashInteractive ];
          shellHook = ''
            if [ ! -f .git/hooks/pre-commit ]; then
              pre-commit install
            fi
          '';
        };
      });
    };
}

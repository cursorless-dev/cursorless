{
  description = "A Nix-flake-based development environment for Cursorless";

  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";

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
        f: nixpkgs.lib.genAttrs supportedSystems (system: f { pkgs = import nixpkgs { inherit system; }; });
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
                # https://github.com/NixOS/nixpkgs/pull/251418
                (pkgs.pre-commit.overrideAttrs (previousAttrs: {
                  makeWrapperArgs = ''
                    --set PYTHONPATH $PYTHONPATH
                  '';
                }))

                python
              ];
            # To prevent weird broken non-interactive bash terminal
            buildInputs = [ pkgs.bashInteractive ];
            shellHook = ''
              if [ ! -f .git/hooks/pre-commit ]; then
                echo "You can run 'pre-commit install' to install git commit hooks if you want them."
              fi

              pnpm install
            '';
          };
        }
      );
    };
}

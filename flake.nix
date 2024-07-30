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
                # Updated neovim-node-client is pending merge:
                # https://github.com/NixOS/nixpkgs/pull/317333
                (final: prev: {
                  nodePackages = prev.nodePackages // {
                    neovim = prev.buildNpmPackage rec {
                      pname = "neovim-node-client";
                      version = "5.1.1-dev.0";
                      src = prev.fetchFromGitHub {
                        owner = "neovim";
                        repo = "node-client";
                        rev = "d99ececf115ddc8ade98467417c1bf0120b676b5";
                        hash = "sha256-eiKyhJNz7kH2iX55lkn7NZYTj6yaSZLMZxqiqPxDIPs=";
                      };
                      npmDeps = prev.fetchNpmDeps {
                        inherit src;
                        hash = "sha256-UoMq+7evskxtZygycxLBgeUtwrET8jYKeZwMiXdBMAw=";
                      };
                      postInstall = ''
                        mkdir -p $out/bin
                        ln -s $out/lib/node_modules/neovim/node_modules/.bin/neovim-node-host $out/bin
                      '';
                    };
                  };
                  neovim = prev.neovim.override { withNodeJs = true; };
                  # There is a recent bug that prevents cli --check invocation:
                  # See: https://github.com/LuaLS/lua-language-server/pull/2775
                  lua-language-server = prev.lua-language-server.overrideAttrs {
                    postPatch =
                      let
                        patch = prev.fetchurl {
                          url = "https://github.com/LuaLS/lua-language-server/pull/2775.patch";
                          sha256 = "sha256-5hjuNzBHLp9kiD6O8jTL5YlvaqR8IuJPHchIZE2/p/Q=";
                        };
                      in
                      ''
                        patch -p1 < ${patch}
                      ''
                      + prev.lua-language-server.postPatch;
                  };
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
      packages = forEachSupportedSystem (
        { pkgs }:
        {
          lua-language-server = pkgs.lua-language-server;
        }
      );
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
                pkgs.nodejs

                # https://github.com/NixOS/nixpkgs/pull/251418
                (pkgs.pre-commit.overrideAttrs (previousAttrs: {
                  makeWrapperArgs = ''
                    --set PYTHONPATH $PYTHONPATH
                  '';
                }))
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

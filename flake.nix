{
  description = "Morpheum development";
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
    systems.url = "github:nix-systems/default";
    flake-utils = {
      url = "github:numtide/flake-utils";
      inputs.systems.follows = "systems";
    };
  };

  outputs = {
    nixpkgs,
    flake-utils,
    ...
  }:
    flake-utils.lib.eachDefaultSystem (
      system: let
        pkgs = import nixpkgs {
          inherit system;
          config = {
            allowUnfree = true;
          };
        };
      in {
        devShells.default = pkgs.mkShell {
          packages = with pkgs; [
            bun 
            claude-code 
            ollama
            python3
            python3Packages.pip
            python3Packages.psutil
          ];
          shellHook = ''
            # Install mlx-knife for MLX model management and execution
            echo "Installing mlx-knife..."
            pip install --user mlx-knife
          '';
        };
      }
    );
}

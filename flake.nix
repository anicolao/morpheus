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
            python3Packages.numpy
            python3Packages.transformers
            python3Packages.torch
            python3Packages.psutil
          ];
          shellHook = ''
            # Install MLX packages that may not be available in nixpkgs
            echo "Installing MLX packages..."
            pip install --user mlx mlx-lm
          '';
        };
      }
    );
}

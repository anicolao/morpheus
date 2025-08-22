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
            (python3.withPackages (ps: with ps; [
              pip
              psutil
              # We'll create a virtual environment for mlx-knife since it's not in nixpkgs
            ]))
          ];
          shellHook = ''
            # Create and activate a virtual environment for mlx-knife
            if [ ! -d ".venv" ]; then
              echo "Creating virtual environment for mlx-knife..."
              python3 -m venv .venv
            fi
            
            source .venv/bin/activate
            
            # Install mlx-knife in the virtual environment (Apple Silicon only)
            if [[ "$(uname -m)" == "arm64" ]] || [[ "$(uname -m)" == "aarch64" ]]; then
              if ! python -c "import mlx_knife" 2>/dev/null; then
                echo "Installing mlx-knife for Apple Silicon..."
                pip install mlx-knife
              else
                echo "mlx-knife already installed"
              fi
            else
              echo "Warning: mlx-knife requires Apple Silicon (ARM64). Skipping installation on $(uname -m)."
              echo "MLX benchmark will not be available on this platform."
            fi
          '';
        };
      }
    );
}

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
            
            # Install required packages in the virtual environment
            if ! python -c "import psutil" 2>/dev/null; then
              echo "Installing psutil in virtual environment..."
              pip install psutil
            fi
            
            # Install mlx-knife in the virtual environment (Apple Silicon only)
            if [[ "$(uname -m)" == "arm64" ]] || [[ "$(uname -m)" == "aarch64" ]]; then
              echo "Detected Apple Silicon - installing MLX and mlx-knife..."
              
              # Install MLX framework first
              if ! python -c "import mlx" 2>/dev/null; then
                echo "Installing MLX framework..."
                pip install mlx
              fi
              
              # Install MLX language models
              if ! python -c "import mlx_lm" 2>/dev/null; then
                echo "Installing MLX-LM..."
                pip install mlx-lm
              fi
              
              # Install mlx-knife
              if ! python -c "import mlx_knife" 2>/dev/null; then
                echo "Installing mlx-knife..."
                pip install mlx-knife
              fi
              
              # Verify installation
              if command -v mlxk >/dev/null 2>&1; then
                echo "✅ mlx-knife installed successfully"
                echo "   Run 'mlxk --help' to see available commands"
              else
                echo "⚠️  mlx-knife installation may have issues"
                echo "   Try running: source .venv/bin/activate && mlxk --help"
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

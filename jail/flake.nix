{
  description = "A Nix-built, jailed container environment for the Morpheum project";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
    systems.url = "github:nix-systems/default";
    flake-utils = {
      url = "github:numtide/flake-utils";
      inputs.systems.follows = "systems";
    };
  };

  outputs = { self, nixpkgs, flake-utils, ... }:
    flake-utils.lib.eachDefaultSystem (system: let
      pkgs = nixpkgs.legacyPackages.${system};
    in {
      # This shell provides the tools needed on the HOST machine to run the jail.
      devShells.default = pkgs.mkShell {
        packages = with pkgs; [ colima docker dtach bun nmap ];
        shellHook = ''
          # Point the Docker CLI to the socket managed by Colima.
          export DOCKER_HOST="unix://$HOME/.colima/default/docker.sock"
          echo "✅ DOCKER_HOST automatically set to Colima's socket."
        '';
      };
    });
}

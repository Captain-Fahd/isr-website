# Dev shell for NixOS users.
# Prisma doesn't publish engine binaries for NixOS, so we use the ones from nixpkgs.
# Keep the nixpkgs prisma-engines version in sync with the `prisma` version in package.json.
#
# Usage: `nix-shell` in backend/, then run prisma commands as usual.
{ pkgs ? import <nixpkgs> { } }:

pkgs.mkShell {
  packages = [
    pkgs.prisma-engines
    pkgs.openssl
  ];

  shellHook = ''
    export PRISMA_SCHEMA_ENGINE_BINARY="${pkgs.prisma-engines}/bin/schema-engine"
    export PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1
  '';
}

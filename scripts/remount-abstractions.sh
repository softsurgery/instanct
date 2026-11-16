#!/usr/bin/env bash
set -euo pipefail

SUBMODULE_PATH="packages/softsurgery-abstractions"
SUBMODULE_URL="git@github.com:softsurgery/softsurgery-abstractions.git"

MODE="pinned"
FORCE=0
RUN_INSTALL=1
RUN_BUILD=1

usage() {
  cat <<EOF
Usage: $(basename "$0") [options]

Remounts the ${SUBMODULE_PATH} git submodule, installs workspace links, and
builds shared abstractions packages in a single step.

Options:
  --remote       Update the submodule to the latest commit on the remote branch
  --force        Force deinit and clean re-mount (discards local submodule changes)
  --no-install   Skip running 'pnpm install'
  --no-build     Skip building shared abstractions packages
  -h, --help     Show this help message
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --remote|-r)
      MODE="remote"
      shift
      ;;
    --force|-f)
      FORCE=1
      shift
      ;;
    --no-install)
      RUN_INSTALL=0
      shift
      ;;
    --no-build)
      RUN_BUILD=0
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown option: $1" >&2
      usage >&2
      exit 1
      ;;
  esac
done

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(git -C "${SCRIPT_DIR}/.." rev-parse --show-toplevel)"
cd "${REPO_ROOT}"

echo "==> Repository root: ${REPO_ROOT}"

# Ensure .gitmodules entry exists
if ! git config --file .gitmodules --get "submodule.${SUBMODULE_PATH}.url" >/dev/null 2>&1; then
  echo "==> Registering ${SUBMODULE_PATH} in .gitmodules..."
  if [[ -d "${SUBMODULE_PATH}" && ! -e "${SUBMODULE_PATH}/.git" ]]; then
    rmdir "${SUBMODULE_PATH}" 2>/dev/null || true
  fi
  git submodule add "${SUBMODULE_URL}" "${SUBMODULE_PATH}"
fi

# Check for dirty submodule before any destructive reset
if [[ -e "${SUBMODULE_PATH}/.git" ]]; then
  if [[ -n "$(git -C "${SUBMODULE_PATH}" status --porcelain 2>/dev/null || true)" ]]; then
    if [[ "${FORCE}" -eq 1 ]]; then
      echo "==> Discarding local changes in ${SUBMODULE_PATH} (--force)..."
      git -C "${SUBMODULE_PATH}" reset --hard HEAD
      git -C "${SUBMODULE_PATH}" clean -fd
    else
      echo "Error: ${SUBMODULE_PATH} has uncommitted changes. Commit/stash them or re-run with --force." >&2
      exit 1
    fi
  fi
fi

if [[ "${FORCE}" -eq 1 ]]; then
  echo "==> Force deinitializing ${SUBMODULE_PATH}..."
  git submodule deinit -f -- "${SUBMODULE_PATH}" || true
  rm -rf ".git/modules/${SUBMODULE_PATH}" "${SUBMODULE_PATH}"
elif [[ -d "${SUBMODULE_PATH}" && ! -e "${SUBMODULE_PATH}/.git" ]]; then
  # Clean up an empty placeholder directory left by a plain git clone
  if [[ -z "$(ls -A "${SUBMODULE_PATH}")" ]]; then
    rmdir "${SUBMODULE_PATH}"
  else
    echo "Error: ${SUBMODULE_PATH} exists and is not a git submodule. Re-run with --force to replace it." >&2
    exit 1
  fi
fi

echo "==> Syncing submodule configuration..."
git submodule sync --recursive -- "${SUBMODULE_PATH}"

if [[ "${MODE}" == "remote" ]]; then
  echo "==> Remounting and updating ${SUBMODULE_PATH} from remote..."
  git submodule update --init --recursive --remote -- "${SUBMODULE_PATH}"
else
  echo "==> Remounting ${SUBMODULE_PATH} at tracked commit..."
  git submodule update --init --recursive -- "${SUBMODULE_PATH}"
fi

if [[ "${RUN_INSTALL}" -eq 1 ]]; then
  if command -v pnpm >/dev/null 2>&1; then
    echo "==> Syncing workspace links with pnpm install..."
    pnpm install --prefer-offline
  else
    echo "==> Warning: pnpm not found on PATH; skipping pnpm install." >&2
  fi
fi

if [[ "${RUN_BUILD}" -eq 1 ]]; then
  BUILD_SCRIPT="${SUBMODULE_PATH}/scripts/mjs/build-softsurgery-abstractions.mjs"
  if [[ -f "${BUILD_SCRIPT}" ]] && command -v node >/dev/null 2>&1; then
    echo "==> Building shared abstractions packages..."
    node "${BUILD_SCRIPT}"
  fi
fi

COMMIT_SHA="$(git -C "${SUBMODULE_PATH}" rev-parse --short HEAD)"
echo "==> Done: ${SUBMODULE_PATH} mounted at ${COMMIT_SHA}"

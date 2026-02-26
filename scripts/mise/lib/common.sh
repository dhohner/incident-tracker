#!/usr/bin/env bash
set -euo pipefail

readonly DEFAULT_COMPOSE_FILE="compose.local.yml"

die() {
  echo "$*" >&2
  exit 1
}

has_command() {
  command -v "$1" >/dev/null 2>&1
}

require_env() {
  local env_name="$1"
  local error_message="$2"

  if [ -z "${!env_name:-}" ]; then
    die "$error_message"
  fi
}

ensure_env_file() {
  if [ ! -f .env.local ]; then
    die ".env.local not found. Create it or pass envs manually."
  fi
}

using_self_hosted_env() {
  [ -n "${CONVEX_SELF_HOSTED_URL:-}" ] && [ -n "${CONVEX_SELF_HOSTED_ADMIN_KEY:-}" ]
}

compose_file() {
  echo "${CONVEX_COMPOSE_FILE:-$DEFAULT_COMPOSE_FILE}"
}

detect_container_tool() {
  if [ -n "${CONTAINER_TOOL:-}" ]; then
    case "$CONTAINER_TOOL" in
      docker|podman)
        if has_command "$CONTAINER_TOOL"; then
          echo "$CONTAINER_TOOL"
        else
          die "CONTAINER_TOOL=$CONTAINER_TOOL is set but not installed."
        fi
        ;;
      *)
        die "Invalid CONTAINER_TOOL=$CONTAINER_TOOL. Use docker or podman."
        ;;
    esac
    return
  fi

  if has_command docker; then
    echo "docker"
    return
  fi

  if has_command podman; then
    echo "podman"
    return
  fi

  die "No container runtime found. Install Docker or Podman, or set CONTAINER_TOOL=docker|podman."
}

detect_compose_tool() {
  local oci_bin
  oci_bin="$(detect_container_tool)"

  if [ "$oci_bin" = "docker" ]; then
    if has_command docker-compose; then
      echo "docker-compose"
    elif docker compose version >/dev/null 2>&1; then
      echo "docker compose"
    else
      die "Docker compose not found. Install docker-compose or Docker Compose plugin."
    fi
    return
  fi

  if has_command podman-compose; then
    echo "podman-compose"
  elif podman compose version >/dev/null 2>&1; then
    echo "podman compose"
  else
    die "Podman compose not found. Install podman-compose or podman compose."
  fi
}

set_compose_cmd_array() {
  local compose_cmd
  compose_cmd="$(detect_compose_tool)"
  IFS=' ' read -r -a COMPOSE <<< "$compose_cmd"
}

run_compose() {
  set_compose_cmd_array
  "${COMPOSE[@]}" -f "$(compose_file)" "$@"
}

rewrite_localhost_url_for_container_runtime() {
  local input_url="$1"
  local oci_bin="$2"
  local host_gateway_name

  host_gateway_name="host.docker.internal"
  if [ "$oci_bin" = "podman" ]; then
    host_gateway_name="host.containers.internal"
  fi

  if echo "$input_url" | grep -Eq 'https?://(127\.0\.0\.1|localhost)(:|/|$)'; then
    echo "$input_url" | sed -E "s#(https?://)(127\\.0\\.0\\.1|localhost)#\\1${host_gateway_name}#"
    return
  fi

  echo "$input_url"
}

generate_secret() {
  local bytes="$1"

  if has_command openssl; then
    openssl rand -hex "$bytes"
  else
    uuidgen | tr -d '-'
  fi
}

ensure_env_var_in_file() {
  local file="$1"
  local key="$2"
  local value="$3"

  if ! grep -q "^${key}=" "$file"; then
    printf '%s=%s\n' "$key" "$value" >> "$file"
  fi
}

print_convex_endpoints() {
  echo "Convex backend:   http://127.0.0.1:${PORT:-3210}"
  echo "Convex dashboard: http://127.0.0.1:${DASHBOARD_PORT:-6791}"
}

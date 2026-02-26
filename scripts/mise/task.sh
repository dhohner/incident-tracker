#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
readonly ROOT_DIR="$(cd -- "$SCRIPT_DIR/../.." && pwd)"
# shellcheck source=./lib/common.sh
source "$SCRIPT_DIR/lib/common.sh"

log_step() {
  printf '\n==> %s\n' "$*"
}

list_tasks_with_descriptions() {
  awk '
    /^\[tasks\./ {
      gsub(/^\[tasks\.|]$/, "", $0)
      task=$0
      next
    }
    /^description = / {
      if (task != "") {
        desc=$0
        sub(/^description = "/, "", desc)
        sub(/"$/, "", desc)
        printf "%s\t%s\n", task, desc
      }
    }
  ' "$ROOT_DIR/mise.toml"
}

print_help_section() {
  local title="$1"
  shift

  if [ "$#" -eq 0 ]; then
    return
  fi

  printf '%s:\n' "$title"

  local line
  for line in "$@"; do
    printf '%s\n' "$line"
  done

  printf '\n'
}

show_help() {
  local show_internal=false
  if [ "${1:-}" = "--all" ]; then
    show_internal=true
  fi

  local -a common_tasks=()
  local -a convex_tasks=()
  local -a advanced_tasks=()
  local -a internal_tasks=()
  local -a other_tasks=()

  local task desc line
  while IFS=$'\t' read -r task desc; do
    [ -z "$task" ] && continue
    line="$(printf '  %-24s %s' "$task" "$desc")"

    case "$task" in
      _*)
        internal_tasks+=("$line")
        ;;
      help|dev|start|down|convex-init)
        common_tasks+=("$line")
        ;;
      convex-*)
        convex_tasks+=("$line")
        ;;
      build|run|rebuild|run-dev)
        advanced_tasks+=("$line")
        ;;
      *)
        other_tasks+=("$line")
        ;;
    esac
  done < <(list_tasks_with_descriptions)

  printf 'Usage: mise run <task>\n\n'

  printf 'Aliases:\n'
  printf '  %-24s %s\n' "mise dev" "Run the common local dev workflow"
  printf '  %-24s %s\n' "mise up" "Run the self-hosted app stack"
  printf '  %-24s %s\n' "mise down" "Stop the app and self-hosted Convex containers"
  printf '  %-24s %s\n' "mise init" "Bootstrap self-hosted Convex and Jira envs"
  printf '  %-24s %s\n\n' "mise help" "Show this task help"

  printf 'Examples:\n'
  printf '  %-24s %s\n' "mise run dev" "Start self-hosted Convex + app hot reload"
  printf '  %-24s %s\n' "mise run start" "Build and run the app container with self-hosted Convex"
  printf '  %-24s %s\n\n' "mise run convex-init" "First-time self-hosted Convex + Jira setup"

  if [ "${#common_tasks[@]}" -gt 0 ]; then
    print_help_section "Common Tasks" "${common_tasks[@]}"
  fi
  if [ "${#convex_tasks[@]}" -gt 0 ]; then
    print_help_section "Convex Tasks" "${convex_tasks[@]}"
  fi
  if [ "${#advanced_tasks[@]}" -gt 0 ]; then
    print_help_section "Advanced Tasks" "${advanced_tasks[@]}"
  fi
  if [ "${#other_tasks[@]}" -gt 0 ]; then
    print_help_section "Other Tasks" "${other_tasks[@]}"
  fi

  if [ "$show_internal" = true ]; then
    if [ "${#internal_tasks[@]}" -gt 0 ]; then
      print_help_section "Internal Tasks" "${internal_tasks[@]}"
    fi
  else
    printf 'Internal tasks are hidden (show %d). Run `scripts/mise/task.sh help --all` to include them.\n' "${#internal_tasks[@]}"
  fi
}

set_default_image() {
  IMAGE="${IMAGE:-incident-tracker}"
  export IMAGE
}

require_cloud_or_self_hosted() {
  if [ -z "${CONVEX_DEPLOYMENT:-}" ]; then
    if using_self_hosted_env; then
      echo "CONVEX_DEPLOYMENT is not set. Using self-hosted Convex env (CONVEX_SELF_HOSTED_URL/CONVEX_SELF_HOSTED_ADMIN_KEY)."
    else
      die "CONVEX_DEPLOYMENT is not set. Add it to .env.local or pass it via CONVEX_DEPLOYMENT=..."
    fi
  else
    require_env "CONVEX_DEPLOY_KEY" "CONVEX_DEPLOY_KEY is not set. Create a deploy key and add it to .env.local or pass it via CONVEX_DEPLOY_KEY=..."
  fi
}

require_instance_secret() {
  require_env "INSTANCE_SECRET" "INSTANCE_SECRET is not set. Add it to .env.local or pass it via INSTANCE_SECRET=..."
}

remove_container_if_present() {
  local oci_bin="$1"
  local container_name="$2"

  if "$oci_bin" container inspect "$container_name" >/dev/null 2>&1; then
    "$oci_bin" rm -f "$container_name" >/dev/null
  fi
}

remove_network_if_present() {
  local oci_bin="$1"
  local network_name="$2"

  if "$oci_bin" network inspect "$network_name" >/dev/null 2>&1; then
    "$oci_bin" network rm "$network_name" >/dev/null
  fi
}

fallback_convex_down() {
  local oci_bin="$1"

  remove_container_if_present "$oci_bin" "${DASHBOARD_CONTAINER:-incident-tracker-convex-dashboard}"
  remove_container_if_present "$oci_bin" "${BACKEND_CONTAINER:-incident-tracker-convex-backend}"
  remove_container_if_present "$oci_bin" "${POSTGRES_CONTAINER:-incident-tracker-postgres}"
  remove_network_if_present "$oci_bin" "${CONVEX_NETWORK:-incident-tracker-convex}"
}

is_expected_podman_compose_missing_app_container_error() {
  local line="$1"

  case "$line" in
    *'no container with name or ID "'*_app_1'" found: no such container'*) return 0 ;;
    *'no container with ID or name "'*_app_1'" found: no such container'*) return 0 ;;
    *) return 1 ;;
  esac
}

run_compose_down_with_filtered_stderr() {
  local oci_bin="$1"

  if [ "$oci_bin" != "podman" ]; then
    run_compose down
    return $?
  fi

  local status=0
  set +e
  run_compose down 2> >(
    while IFS= read -r line; do
      if is_expected_podman_compose_missing_app_container_error "$line"; then
        continue
      fi
      printf '%s\n' "$line" >&2
    done
  )
  status=$?
  set -e
  return "$status"
}

run_dev_server() {
  local status=0
  local react_router_bin="$ROOT_DIR/node_modules/.bin/react-router"

  if [ ! -x "$react_router_bin" ]; then
    die "React Router CLI not found at $react_router_bin. Run bun install first."
  fi

  set +e
  # Run React Router directly (instead of `bun dev`) so the process keeps a TTY.
  # Bun's script runner prints an extra "exited with code 130" line on Ctrl-C.
  "$react_router_bin" dev
  status=$?
  set -e

  if [ "${RUN_DEV_INTERRUPTED:-0}" -eq 1 ] || [ "$status" -eq 130 ]; then
    return 0
  fi

  return "$status"
}

write_or_extend_local_env() {
  local admin_key="$1"
  local env_file=".env.local"

  if [ ! -f "$env_file" ]; then
    cat <<ENV_FILE > "$env_file"
INSTANCE_NAME=$INSTANCE_NAME
INSTANCE_SECRET=$INSTANCE_SECRET
POSTGRES_USER=$POSTGRES_USER
POSTGRES_PASSWORD=$POSTGRES_PASSWORD
POSTGRES_DB=$POSTGRES_DB
CONVEX_SELF_HOSTED_URL=$CONVEX_SELF_HOSTED_URL
CONVEX_SELF_HOSTED_ADMIN_KEY=$admin_key
VITE_CONVEX_URL=$VITE_CONVEX_URL
ENV_FILE
    return
  fi

  while IFS='=' read -r key value; do
    ensure_env_var_in_file "$env_file" "$key" "$value"
  done <<ENV_VALUES
INSTANCE_NAME=$INSTANCE_NAME
INSTANCE_SECRET=$INSTANCE_SECRET
POSTGRES_USER=$POSTGRES_USER
POSTGRES_PASSWORD=$POSTGRES_PASSWORD
POSTGRES_DB=$POSTGRES_DB
CONVEX_SELF_HOSTED_URL=$CONVEX_SELF_HOSTED_URL
CONVEX_SELF_HOSTED_ADMIN_KEY=$admin_key
VITE_CONVEX_URL=$VITE_CONVEX_URL
ENV_VALUES
}

set_jira_envs() {
  local jira_pat_email=""
  local jira_pat_token=""
  local jira_project_key=""
  local jira_site_url=""

  echo "Enter the following Convex environment values."
  read -r -p "JIRA_PAT_EMAIL: " jira_pat_email
  read -r -s -p "JIRA_PAT_TOKEN: " jira_pat_token
  echo ""
  read -r -p "JIRA_PROJECT_KEY: " jira_project_key
  read -r -p "JIRA_SITE_URL: " jira_site_url

  bunx convex env set JIRA_PAT_EMAIL "$jira_pat_email"
  bunx convex env set JIRA_PAT_TOKEN "$jira_pat_token"
  bunx convex env set JIRA_PROJECT_KEY "$jira_project_key"
  bunx convex env set JIRA_SITE_URL "$jira_site_url"
}

set_convex_init_defaults() {
  INSTANCE_NAME="${INSTANCE_NAME:-convex_self_hosted}"
  POSTGRES_USER="${POSTGRES_USER:-convex}"
  POSTGRES_DB="${POSTGRES_DB:-convex_self_hosted}"
  CONVEX_SELF_HOSTED_URL="${CONVEX_SELF_HOSTED_URL:-http://127.0.0.1:3210}"
  VITE_CONVEX_URL="${VITE_CONVEX_URL:-http://127.0.0.1:3210}"

  INSTANCE_SECRET="${INSTANCE_SECRET:-$(generate_secret 32)}"
  POSTGRES_PASSWORD="${POSTGRES_PASSWORD:-$(generate_secret 24)}"

  export INSTANCE_SECRET
  export POSTGRES_USER
  export POSTGRES_PASSWORD
  export POSTGRES_DB
}

generate_convex_admin_key() {
  local oci_bin
  oci_bin="$(detect_container_tool)"

  local backend_container admin_key
  backend_container="${BACKEND_CONTAINER:-incident-tracker-convex-backend}"
  admin_key="$("$oci_bin" exec "$backend_container" ./generate_admin_key.sh | tr -d '\r\n')"

  if [ -z "$admin_key" ]; then
    die "Failed to generate admin key."
  fi

  echo "$admin_key"
}

persist_convex_init_env() {
  local admin_key="$1"

  log_step "Writing local Convex values to .env.local"
  write_or_extend_local_env "$admin_key"
  chmod 600 .env.local
}

prompt_convex_init_jira_envs() {
  log_step "Prompting for Jira values and writing them to Convex"
  set_jira_envs
}

cmd_help() {
  show_help "${1:-}"
}

cmd_build() {
  require_env "VITE_CONVEX_URL" "VITE_CONVEX_URL is not set. Add it to .env.local or pass it via VITE_CONVEX_URL=..."
  require_cloud_or_self_hosted

  set_default_image

  local oci_bin
  oci_bin="$(detect_container_tool)"

  if [ -n "${CONVEX_SELF_HOSTED_URL:-}" ]; then
    CONVEX_SELF_HOSTED_BUILD_URL="$(rewrite_localhost_url_for_container_runtime "$CONVEX_SELF_HOSTED_URL" "$oci_bin")"
    export CONVEX_SELF_HOSTED_BUILD_URL
  fi

  if [ "$oci_bin" = "docker" ]; then
    export DOCKER_BUILDKIT=1
  fi

  log_step "Building app container image ($IMAGE) with $oci_bin"
  run_compose build app
}

cmd_run() {
  set_default_image
  log_step "Running app container ($IMAGE) with published service ports"
  run_compose run --rm --service-ports app
}

cmd_run_dev() {
  RUN_DEV_INTERRUPTED=0
  trap 'RUN_DEV_INTERRUPTED=1' INT TERM

  require_env "VITE_CONVEX_URL" "VITE_CONVEX_URL is not set. Add it to .env.local or pass it via VITE_CONVEX_URL=..."

  if using_self_hosted_env; then
    echo "Using self-hosted Convex env (CONVEX_SELF_HOSTED_URL/CONVEX_SELF_HOSTED_ADMIN_KEY)."
    export CONVEX_DEPLOYMENT=""
  else
    require_env "CONVEX_DEPLOYMENT" "CONVEX_DEPLOYMENT is not set. Add it to .env.local or pass it via CONVEX_DEPLOYMENT=..."
    require_env "CONVEX_DEPLOY_KEY" "CONVEX_DEPLOY_KEY is not set. Create a deploy key and add it to .env.local or pass it via CONVEX_DEPLOY_KEY=..."
  fi

  log_step "Starting app dev server (react-router dev)"
  local status=0
  if run_dev_server; then
    status=0
  else
    status=$?
  fi

  trap - INT TERM
  return "$status"
}

cmd_check_env_file() {
  ensure_env_file
}

cmd_detect_container_tool() {
  detect_container_tool
}

cmd_check_container_tool() {
  detect_container_tool >/dev/null
}

cmd_detect_compose_tool() {
  detect_compose_tool
}

cmd_check_compose_tool() {
  detect_compose_tool >/dev/null
}

cmd_convex_up() {
  require_instance_secret
  log_step "Starting self-hosted Convex services (postgres, backend, dashboard)"
  run_compose up -d postgres convex-backend convex-dashboard
  print_convex_endpoints
}

cmd_convex_up_postgres() {
  run_compose up -d postgres
}

cmd_convex_up_backend() {
  require_instance_secret
  run_compose up -d postgres convex-backend
}

cmd_convex_up_dashboard() {
  run_compose up -d convex-dashboard
  print_convex_endpoints
}

cmd_convex_down() {
  local oci_bin
  oci_bin="$(detect_container_tool)"

  log_step "Stopping self-hosted Convex services"
  if run_compose_down_with_filtered_stderr "$oci_bin"; then
    return
  fi

  log_step "Compose down failed; falling back to direct container cleanup ($oci_bin)"
  fallback_convex_down "$oci_bin"
}

cmd_convex_init() {
  log_step "Preparing default self-hosted Convex settings"
  set_convex_init_defaults

  cmd_convex_up

  log_step "Generating a self-hosted Convex admin key"
  local admin_key
  admin_key="$(generate_convex_admin_key)"

  persist_convex_init_env "$admin_key"
  export CONVEX_SELF_HOSTED_ADMIN_KEY="$admin_key"

  prompt_convex_init_jira_envs
}

main() {
  local command="${1:-}"
  shift || true

  case "$command" in
    help) cmd_help "$@" ;;
    build) cmd_build ;;
    run) cmd_run ;;
    run-dev) cmd_run_dev ;;
    check-env-file) cmd_check_env_file ;;
    detect-container-tool) cmd_detect_container_tool ;;
    check-container-tool) cmd_check_container_tool ;;
    detect-compose-tool) cmd_detect_compose_tool ;;
    check-compose-tool) cmd_check_compose_tool ;;
    convex-up) cmd_convex_up ;;
    convex-up-postgres) cmd_convex_up_postgres ;;
    convex-up-backend) cmd_convex_up_backend ;;
    convex-up-dashboard) cmd_convex_up_dashboard ;;
    convex-down) cmd_convex_down ;;
    convex-init) cmd_convex_init ;;
    "") die "Missing task name. Usage: scripts/mise/task.sh <task>" ;;
    *) die "Unknown task: $command" ;;
  esac
}

main "$@"

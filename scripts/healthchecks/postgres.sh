#!/usr/bin/env sh
set -eu

pg_isready -U "${POSTGRES_USER:-convex}" -d "${POSTGRES_DB:-convex_self_hosted}"

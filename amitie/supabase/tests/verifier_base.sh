#!/usr/bin/env bash
# Vérifie les migrations sur un Postgres local jetable :
# imitation de Supabase → migrations → données de départ → tests de sécurité.
# Usage : npm run db:verifier (depuis le dossier amitie/)
set -euo pipefail

ICI="$(cd "$(dirname "$0")" && pwd)"
SUPABASE="$(dirname "$ICI")"

# Binaires Postgres (Linux : /usr/lib/postgresql/<version>/bin ; sinon dans le PATH)
PG_BIN="$(ls -d /usr/lib/postgresql/*/bin 2>/dev/null | sort -V | tail -1 || true)"
[ -n "$PG_BIN" ] && export PATH="$PG_BIN:$PATH"
command -v initdb >/dev/null || { echo "Postgres n'est pas installé (initdb introuvable)"; exit 1; }

DOSSIER="$(mktemp -d)"
chmod 755 "$DOSSIER"
PORT=54329

# Postgres refuse de tourner en root : on passe par l'utilisateur « postgres » si besoin
lancer() {
  if [ "$(id -u)" = "0" ]; then su postgres -s /bin/bash -c "PATH='$PATH' $*"; else bash -c "$*"; fi
}
[ "$(id -u)" = "0" ] && chown postgres "$DOSSIER"

nettoyer() { lancer "pg_ctl -D '$DOSSIER/data' stop -m immediate" >/dev/null 2>&1 || true; rm -rf "$DOSSIER"; }
trap nettoyer EXIT

lancer "initdb -D '$DOSSIER/data' -U postgres --auth=trust -E UTF8 --locale=C.UTF-8" >/dev/null
lancer "pg_ctl -D '$DOSSIER/data' -o '-p $PORT -k $DOSSIER -c listen_addresses=' -l '$DOSSIER/log' -w start" >/dev/null

PSQL=(psql -h "$DOSSIER" -p "$PORT" -U postgres -d postgres -v ON_ERROR_STOP=1 -q -X)

echo "→ Imitation de Supabase"
"${PSQL[@]}" -f "$ICI/imitation_supabase.sql"
for f in "$SUPABASE"/migrations/*.sql; do
  echo "→ Migration $(basename "$f")"
  "${PSQL[@]}" -f "$f"
done
echo "→ Données de départ"
"${PSQL[@]}" -f "$SUPABASE/seed.sql"
echo "→ Tests de sécurité"
"${PSQL[@]}" -f "$ICI/securite.sql" 2>&1 | sed 's/^psql:[^ ]* NOTICE:  /  /'

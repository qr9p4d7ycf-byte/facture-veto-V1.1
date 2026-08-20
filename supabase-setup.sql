-- À coller dans Supabase : Project > SQL Editor > New query > Run

create table if not exists kv_store (
  key text primary key,
  value text,
  updated_at timestamptz default now()
);

-- La sécurité au niveau ligne (RLS) reste désactivée ici car cette table
-- n'est JAMAIS appelée directement par le navigateur : seule la fonction
-- serveur /api/storage.js y accède, avec la clé secrète "service_role"
-- qui contourne RLS de toute façon. Ne jamais utiliser la clé "anon"
-- publique pour cette table depuis le frontend.

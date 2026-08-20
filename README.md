# Facturation Vétérinaire — application autonome

Cette version fonctionne sans passer par Claude : le code habite sur GitHub,
Vercel l'héberge et exécute deux petites fonctions serveur, et Supabase stocke
les données. Une fois en ligne, elle s'installe sur iPhone comme une vraie
application via Safari.

Coût : Vercel et Supabase sont gratuits pour ce niveau d'usage. Seule l'API
Anthropic est payante à l'usage (quelques centimes par facture générée).

## 1. Créer la clé API Anthropic

1. Va sur **console.anthropic.com** et crée un compte (différent de ton compte
   claude.ai).
2. Ajoute un moyen de paiement dans *Billing* (l'API ne fonctionne pas sans,
   même pour de très petits montants).
3. Va dans *API Keys* → *Create Key*, donne-lui un nom (ex : "facturation-veto")
   et copie la clé (elle commence par `sk-ant-...`). Garde-la de côté, tu ne
   pourras plus la revoir ensuite.

## 2. Créer la base de données (Supabase)

1. Va sur **supabase.com** → *Start your project* → connecte-toi (avec GitHub
   par exemple) → *New project* (choisis un mot de passe de base de données,
   région proche de toi, plan gratuit).
2. Une fois le projet créé, ouvre **SQL Editor** → *New query*, colle le
   contenu du fichier `supabase-setup.sql` fourni, et clique *Run*.
3. Va dans **Project Settings → API**. Note deux valeurs :
   - *Project URL* (ex : `https://xxxxx.supabase.co`)
   - *service_role* key, dans "Project API keys" (⚠️ pas la clé "anon" —
     la clé *service_role* est secrète, ne la mets jamais dans du code
     visible du navigateur, seulement dans les variables d'environnement
     Vercel à l'étape 4).

## 3. Mettre le code sur GitHub

1. Sur **github.com**, crée un nouveau dépôt (ex : `facturation-veto`), vide,
   sans README.
2. Depuis ton ordinateur, dans le dossier de ce projet :
   ```
   git init
   git add .
   git commit -m "Première version"
   git branch -M main
   git remote add origin https://github.com/TON-COMPTE/facturation-veto.git
   git push -u origin main
   ```
   (Remplace l'URL par celle de ton dépôt, affichée sur la page GitHub après
   sa création.)

## 4. Déployer sur Vercel

1. Va sur **vercel.com** → connecte-toi avec ton compte GitHub.
2. *Add New* → *Project* → choisis le dépôt `facturation-veto` → *Import*.
3. Dans **Environment Variables**, ajoute :
   - `ANTHROPIC_API_KEY` = ta clé `sk-ant-...`
   - `SUPABASE_URL` = ton *Project URL* Supabase
   - `SUPABASE_SERVICE_KEY` = ta clé *service_role* Supabase
4. Clique *Deploy*. Après une minute, Vercel te donne une URL du type
   `https://facturation-veto.vercel.app` — c'est ton application, en ligne,
   accessible depuis n'importe quel appareil.

## 5. Installer sur iPhone comme une vraie app

1. Ouvre l'URL Vercel dans **Safari** sur iPhone (l'installation ne
   fonctionne qu'avec Safari, pas Chrome, sur iOS).
2. Appuie sur le bouton **Partager** (le carré avec la flèche vers le haut).
3. Choisis **Sur l'écran d'accueil**, puis **Ajouter**.
4. Une icône dédiée apparaît sur l'écran d'accueil, avec son propre écran de
   lancement — une vraie application, indépendante de Claude et de Safari.

Sur Mac, ouvre la même URL dans Safari et utilise **Fichier → Ajouter au
Dock** pour le même résultat.

## Pour relier plusieurs appareils/collègues

Au premier lancement sur chaque appareil, choisis "Créer un nouveau cabinet"
une seule fois (sur le tout premier appareil), puis "Rejoindre un cabinet
existant" avec le même code sur tous les autres appareils. Tous verront les
mêmes tarifs, factures et historique.

## Si quelque chose ne marche pas

- **Écran blanc ou erreur au chargement** : vérifie les 3 variables
  d'environnement dans Vercel (Project → Settings → Environment Variables),
  puis redéploie (Deployments → ⋯ → Redeploy).
- **"Configuration serveur manquante"** : une variable d'environnement est
  mal orthographiée ou absente.
- **La génération de facture échoue** : vérifie que le moyen de paiement est
  bien actif sur console.anthropic.com.

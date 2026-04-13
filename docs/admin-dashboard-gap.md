# Écart tableau de bord admin — WAXTU (état du code)

Document de référence : ce qui **existe déjà** dans le repo vs ce qui **manque** pour un back-office e-commerce  professionnel (commandes, CA, suivi, etc.).

_Mise à jour : persistance des commandes (fichier `.data/waxtu-orders.json`), API admin, écrans commandes, agrégats dashboard, alertes stock, contrôle optionnel du montant IPN._

---

## 1. Ce qui existe aujourd’hui

### Pages admin

| Chemin | Rôle |
|--------|------|
| `pages/admin/login.vue` | Connexion → JWT (`POST /api/auth/admin-login`) |
| `pages/admin/index.vue` | Tableau de bord : `GET /api/admin/dashboard` (catalogue + ventes + alertes + dernières commandes) + liens modules |
| `pages/admin/orders/index.vue` | Liste des commandes payées (`GET /api/orders/admin`) |
| `pages/admin/orders/[ref].vue` | Détail d’une commande (`GET /api/orders/admin/:ref`) |
| `pages/admin/landing.vue` | CRUD sections landing |
| `pages/admin/products.vue` | CRUD produits (prix, stock, `forSale`, médias, textes) |
| `pages/admin/promotions.vue` | CRUD bandeau promo (code, %, activation) |
| `pages/admin/paytech.vue` | Config PayTech (env, URLs, IPN, mobile) |

### Shell UX

| Fichier | Rôle |
|---------|------|
| `layouts/admin.vue` | Layout console (sidebar + zone principale, mobile drawer) |
| `components/admin/AdminSidebar.vue` | Navigation : dashboard, **commandes**, landing, produits, promos, PayTech |

### API serveur (liste exhaustive Nitro)

| Route | Rôle |
|-------|------|
| `POST /api/auth/admin-login` | Auth admin → token |
| `GET/PUT /api/cms/admin` | Lecture / écriture du **CMS entier** (fichier via `cms-store`) |
| `GET /api/cms/public` | CMS public vitrine |
| `GET /api/admin/dashboard` | Stats agrégées (CMS + commandes + alertes stock), protégé admin |
| `GET /api/orders/admin` | Liste commandes (pagination `?limit=`), protégé admin |
| `GET /api/orders/admin/:ref` | Détail une commande, protégé admin |
| `POST /api/paytech/init` | Init paiement PayTech (lignes panier validées) |
| `POST /api/paytech/ipn` | IPN : paiement OK → **décrément stock** + **enregistrement commande** (`.data/waxtu-orders.json`) + anti-doublon (`ref_command` + présence commande) ; si `item_price` / équivalent présent dans le corps, comparaison au total recalculé (tolérance 2 XOF) |

### Modèle de données

- **`WaxtuCms`** (`types/cms.ts`) : `global`, `promotions`, `paytech`, `sections[]`, `products[]`.
- **`WaxtuStoredOrder`** (`types/orders.ts`) : lignes figées, sous-total, remise, total, `paidAt`, `ref`.

### Indicateurs dashboard

- **Catalogue** : produits, en vente avec stock, sections, promo (via `GET /api/admin/dashboard`).
- **Ventes** : nombre de commandes, commandes 30 jours, CA 30 jours, CA total.
- **Alertes** : produits en rupture / stock ≤ 3 (parmi `forSale`).
- **Dernières commandes** : liens vers le détail.

---

## 2. Ce qui manque encore (par rapport à un dashboard e-commerce pro)

### Priorité haute — cœur métier

| Manque | Contexte WAXTU |
|--------|----------------|
| **Statuts commande** (en attente / payé / expédié / remboursé) | Aujourd’hui seul le flux  payé via IPN est modélisé. |
| **Données client** (email, téléphone, adresse) | Checkout sans collecte structurée ; rien dans l’ordre persisté. |
| **Signature / secret officiel IPN PayTech** | Contrôle de montant si champ présent ; **signature documentée PayTech** à brancher selon leur doc. |

### Priorité moyenne — opérations & catalogue

| Manque | Contexte |
|--------|----------|
| **Qualité catalogue** (sans image, `forSale` mais stock 0, etc.) | Données présentes dans le CMS, pas encore surfacées en alertes. |
| **Journal d’activité admin** (qui a modifié quoi) | Un seul fichier CMS ; pas d’audit log. |
| **Export** (commandes, produits) | Pas d’export CSV côté admin. |
| **Vue synthèse PayTech** | Pas de liste des derniers IPN dans l’UI (hors logs serveur). |

### Priorité basse — équipe, conformité, UX avancée

| Manque | Contexte |
|--------|----------|
| **Comptes clients** + historique d’achat | Checkout actuel orienté panier + PayTech ; pas de modèle « compte client » dans le CMS. |
| **Rôles** (lecture seule vs admin) | Auth binaire : JWT admin unique (`admin-auth`). |
| **Livraison / expédition** | Aucun workflow colis / tracking. |
| **Recherche globale** dans l’admin | Pas implémentée. |
| **Brouillon / publication** landing | Sections ont `enabled` ; pas de notion de brouillon global ou preview signée. |

---

## 3. Pistes techniques (suite)

1. **Frais de port** : champs et calcul dans le panier / commande.
2. **Base SQLite** (ou managée) si le volume de commandes dépasse le confort du fichier JSON — l’export CSV est déjà disponible (`GET /api/orders/admin/export`).
3. **`@nuxt/image`** (ou CDN dédié) si vous voulez aller plus loin que les attributs `width` / `height` / `loading` sur les balises `img`.
4. **Tests IPN** : scénarios Vitest avec payloads PayTech factices (HMAC valide / invalide).

---

## 4. Synthèse en une phrase

WAXTU couvre désormais **CMS + paiement + stock + historique des ventes (CA agrégé) + alertes stock** ; il manque surtout **fulfilment / client / conformité IPN avancée** pour un back-office e-commerce complet.

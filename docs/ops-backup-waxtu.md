# Sauvegarde et restauration des données WAXTU

Les données d’exploitation (hors dépôt Git) vivent dans le répertoire **`.data/`** à la racine du projet (ou du déploiement Node).

## Fichiers concernés

| Fichier | Contenu |
|---------|---------|
| `waxtu-cms.json` | Catalogue, landing, promos, config PayTech CMS |
| `waxtu-orders.json` | Commandes enregistrées après IPN |
| `paytech-ipn-refs.log` | Références IPN déjà traitées (idempotence) |

## Sauvegarde recommandée

1. **Fréquence** : au minimum quotidienne en production ; avant toute mise à jour majeure ou migration.
2. **Méthode** : copie du dossier `.data/` vers un stockage externe (S3, autre serveur, disque réseau) avec horodatage, par exemple :
   - `tar czf waxtu-data-$(date +%Y%m%d).tar.gz .data`
3. **Sécurité** : ces archives contiennent des données commerciales — chiffrez-les au repos et limitez les accès.

## Restauration

1. Arrêter l’application Node.
2. Remplacer le dossier `.data/` par la copie sauvegardée (ou fusionner les fichiers si besoin ponctuel).
3. Redémarrer l’application.

## Variables d’environnement (production)

Le plugin [`server/plugins/env-validate.ts`](../server/plugins/env-validate.ts) vérifie au démarrage (en `NODE_ENV=production`) :

- `NUXT_PUBLIC_SITE_URL` en **HTTPS**
- `NUXT_PAYTECH_API_KEY` / `NUXT_PAYTECH_API_SECRET`
- `NUXT_ADMIN_EMAIL` / `NUXT_ADMIN_PASSWORD`
- `NUXT_ADMIN_SESSION_SECRET` (≥ 32 caractères) **ou** `NUXT_ADMIN_TOKEN` (≥ 16 caractères)

## IPN PayTech en développement

Si les callbacks de test n’incluent pas encore `hmac_compute` / hashes, définir temporairement :

`NUXT_PAYTECH_IPN_SKIP_VERIFY=true`

**Ne jamais activer en production.**

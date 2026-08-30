# Déploiement Caddy + DuckDNS — VELMIRYS

Objectif : servir l'app Next.js (Docker sur le port 3000) en HTTPS via
`https://velmirys.duckdns.org`, avec certificat Let's Encrypt automatique.

---

## 1. DuckDNS — créer le sous-domaine

1. Sur https://www.duckdns.org → se connecter (Google/GitHub).
2. Créer le sous-domaine **`velmirys`** → `velmirys.duckdns.org`.
3. Noter le **token** affiché en haut de la page (UUID à copier).

## 2. Script de mise à jour IP (cron)

DuckDNS ne nécessite pas de client lourd : un `curl` suffit.

```bash
sudo tee /usr/local/bin/duckdns-update.sh > /dev/null <<'EOF'
#!/bin/bash
DOMAIN="velmirys"
TOKEN="05c2cb9f-3f03-4864-afce-74025b1182e2"
echo url="https://www.duckdns.org/update?domains=$DOMAIN&token=$TOKEN&ip=" | curl -k -o /var/log/duckdns.log -K -
EOF
sudo chmod +x /usr/local/bin/duckdns-update.sh
```

> `ip=` vide → DuckDNS détecte automatiquement l'IP publique du droplet.

Cron toutes les 5 minutes :

```bash
sudo tee /etc/cron.d/duckdns > /dev/null <<'EOF'
*/5 * * * * root /usr/local/bin/duckdns-update.sh >/dev/null 2>&1
EOF
```

Vérifier :

```bash
/usr/local/bin/duckdns-update.sh && cat /var/log/duckdns.log   # doit afficher OK
dig +short velmirys.duckdns.org                                # doit rendre l'IP du droplet
```

## 3. Installer Caddy (Ubuntu/Debian)

```bash
sudo apt update
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.list.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo chmod o+r /usr/share/keyrings/caddy-stable-archive-keyring.gpg
sudo apt update
sudo apt install -y caddy
```

## 4. Configurer Caddy — proxy vers Docker :3000

```bash
sudo tee /etc/caddy/Caddyfile > /dev/null <<'EOF'
velmirys.duckdns.org {
    reverse_proxy 127.0.0.1:3000
}
EOF
sudo systemctl reload caddy
```

HTTPS automatique via **Let's Encrypt (challenge HTTP sur le port 80)**.
Suivre la génération du certificat :

```bash
journalctl -u caddy -f
```

## 5. Firewall

Si `ufw` actif :

```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw reload
```

Penser aussi au firewall cloud DigitalOcean (si configuré) : ouvrir 80/443 en inbound.

> ⚠️ Sans le port 80 accessible, la demande de certificat Let's Encrypt échoue
> et Caddy reste en HTTP.

## 6. (Optionnel) Durcir le port 3000

Aujourd'hui le conteneur publie `3000:3000` sur toutes les interfaces. Comme
Caddy ne parle qu'en local, on peut le limiter :

```yaml
# docker-compose.yml
ports:
  - "127.0.0.1:3000:3000"
```

Caddy continue de fonctionner (même hôte).

## 7. Vérifier

```bash
curl -I https://velmirys.duckdns.org
# attendu : HTTP/2 200 (+ certificat Let's Encrypt valide)
```

Puis dans le navigateur : le site doit répondre en HTTPS, et le panier doit
se charger (CORS ajouté pour cette origine).

## 8. Après coup

- `NEXT_PUBLIC_SITE_URL=https://velmirys.duckdns.org` — déjà mis à jour dans
  `.env` (racine) et `web/.env.production`. Rebuild via `./deploy.ps1`.
- Origine CORS de transition `http://198.199.82.42` : conserver tant que
  l'IP directe sert le site, la supprimer ensuite via
  `sanity_cors_origins_delete`.

## Dépannage

| Symptôme | Cause probable | Vérification |
|---|---|---|
| `curl` répond en HTTP 308/301 permanent vers HTTPS | Caddy fonctionne | OK, comportement normal |
| Certificat non émis | Port 80 bloqué | `sudo ufw status` + firewall DO |
| `OK` absent dans `/var/log/duckdns.log` | Token/domaine invalide | Vérifier le token sur duckdns.org |
| 502 Bad Gateway | Conteneur down | `docker compose ps` sur le droplet |

# Deployment Guide - caspercooks.tech na Mikrus

## Wymagania

- Docker zainstalowany lokalnie
- SSH dostęp do serwera Mikrus
- Docker zainstalowany na serwerze Mikrus
- Wykupiona domena caspercooks.tech

## Szybki start

### 1. Konfiguracja skryptu deployment

Edytuj `deploy.sh` i zaktualizuj następujące zmienne:

```bash
SSH_HOST="your-mikrus-server.mikr.us"  # Twój adres serwera Mikrus
SSH_USER="your-username"                # Twoja nazwa użytkownika
SSH_PORT="22"                          # Port SSH (zazwyczaj 22)
```

### 2. Uruchomienie deployment

```bash
./deploy.sh
```

Skrypt automatycznie:
- Zbuduje obraz Docker
- Przesle go na serwer
- Uruchomi nowy kontener
- Posprzata stare wersje

## Konfiguracja serwera Mikrus

### A. Instalacja Docker (jeśli nie jest zainstalowany)

Zaloguj się na serwer przez SSH:

```bash
ssh -p PORT user@your-server.mikr.us
```

Zainstaluj Docker:

```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

Wyloguj się i zaloguj ponownie, aby zmiany weszły w życie.

### B. Konfiguracja Nginx jako reverse proxy

Zainstaluj Nginx:

```bash
sudo apt update
sudo apt install nginx
```

Utwórz konfigurację dla caspercooks.tech:

```bash
sudo nano /etc/nginx/sites-available/caspercooks.tech
```

Dodaj następującą konfigurację:

```nginx
server {
    listen 80;
    server_name caspercooks.tech www.caspercooks.tech;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Aktywuj konfigurację:

```bash
sudo ln -s /etc/nginx/sites-available/caspercooks.tech /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### C. Konfiguracja SSL z Let's Encrypt

Zainstaluj Certbot:

```bash
sudo apt install certbot python3-certbot-nginx
```

Uzyskaj certyfikat SSL:

```bash
sudo certbot --nginx -d caspercooks.tech -d www.caspercooks.tech
```

Certbot automatycznie skonfiguruje odnowienie certyfikatu.

### D. Konfiguracja DNS

W panelu zarządzania domeną (np. nazwa.pl, cloudflare) dodaj rekordy:

```
A     @              IP_SERWERA_MIKRUS
A     www            IP_SERWERA_MIKRUS
```

Poczekaj na propagację DNS (może trwać do 24h, zwykle 15-30 minut).

## Zarządzanie aplikacją na serwerze

### Sprawdzenie statusu kontenera

```bash
docker ps
docker logs caspercooks-io
```

### Restart kontenera

```bash
docker restart caspercooks-io
```

### Stop kontenera

```bash
docker stop caspercooks-io
```

### Zobacz logi w czasie rzeczywistym

```bash
docker logs -f caspercooks-io
```

### Usunięcie kontenera

```bash
docker stop caspercooks-io
docker rm caspercooks-io
```

## Aktualizacja aplikacji

Po wprowadzeniu zmian w kodzie:

```bash
./deploy.sh
```

Skrypt automatycznie:
1. Zbuduje nową wersję
2. Zatrzyma starą
3. Uruchomi nową wersję

## Troubleshooting

### Problem: Port 3000 już zajęty

```bash
# Znajdź proces
sudo lsof -i :3000
# Lub
sudo netstat -tulpn | grep :3000

# Zatrzymaj konfliktujący kontener
docker stop $(docker ps -q --filter "publish=3000")
```

### Problem: Aplikacja nie odpowiada

```bash
# Sprawdź logi
docker logs caspercooks-io

# Sprawdź czy kontener działa
docker ps -a | grep caspercooks-io

# Sprawdź nginx
sudo nginx -t
sudo systemctl status nginx
```

### Problem: Brak połączenia SSH

Sprawdź czy używasz poprawnego portu i użytkownika:
```bash
ssh -v -p PORT user@server.mikr.us
```

## Monitoring

### Sprawdzenie zasobów

```bash
docker stats caspercooks-io
```

### Sprawdzenie miejsca na dysku

```bash
df -h
docker system df
```

### Czyszczenie nieużywanych obrazów

```bash
docker system prune -a
```

## Bezpieczeństwo

1. **Firewall** - upewnij się że tylko porty 22, 80, 443 są otwarte:
   ```bash
   sudo ufw allow 22
   sudo ufw allow 80
   sudo ufw allow 443
   sudo ufw enable
   ```

2. **Aktualizacje** - regularnie aktualizuj system:
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

3. **Backup** - regularnie twórz kopie zapasowe:
   ```bash
   docker export caspercooks-io > backup-$(date +%Y%m%d).tar
   ```

## Kontakt

W razie problemów sprawdź:
- Logi kontenera: `docker logs caspercooks-io`
- Logi nginx: `sudo tail -f /var/log/nginx/error.log`
- Status serwera: `systemctl status nginx docker`

# CALLME - Operátorská aplikace pro volání zákazníkům

Webová aplikace pro call centrum operátory, která umožňuje volat zákazníkům bez zobrazení jejich telefonních čísel.

## Vlastnosti

- **Ochrana soukromí zákazníků** - Operátor nevidí telefonní čísla zákazníků, pouze jejich ID a jméno
- **VoIP volání** - Integrace s Twilio API pro volání přes internet
- **Seznam zákazníků** - Přehledný seznam s vyhledáváním
- **Historie hovorů** - Sledování všech uskutečněných hovorů
- **Demo režim** - Aplikace funguje i bez Twilio konfigurace pro testování

## Barevné schéma

Aplikace používá elegantní barevné schéma:
- **Černá** - Hlavní pozadí
- **Bílá** - Text a prvky
- **Zlatá** - Akcenty a zvýraznění
- **Růžová** - Sekundární akcenty

## Rychlý start

### 1. Instalace závislostí

```bash
npm install
```

### 2. Konfigurace prostředí

```bash
cp .env.example .env
```

Upravte `.env` soubor s vašimi Twilio údaji (volitelné pro demo režim).

### 3. Spuštění serveru

```bash
# Produkční režim
npm start

# Vývojový režim s hot-reload
npm run dev
```

### 4. Otevření aplikace

Přejděte na `http://localhost:3000` v prohlížeči.

## Konfigurace Twilio

Pro plnou funkčnost volání je nutné nakonfigurovat Twilio:

1. Vytvořte účet na [Twilio](https://www.twilio.com)
2. Získejte Account SID a Auth Token z [konzole](https://console.twilio.com)
3. Kupte si telefonní číslo pro odchozí hovory
4. Nastavte proměnné prostředí v `.env`:

```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+420123456789
```

## API Endpointy

| Endpoint | Metoda | Popis |
|----------|--------|-------|
| `/api/health` | GET | Kontrola stavu serveru |
| `/api/twilio/status` | GET | Stav Twilio konfigurace |
| `/api/customers` | GET | Seznam zákazníků (bez tel. čísel) |
| `/api/customers/:id` | GET | Detail zákazníka |
| `/api/call/initiate` | POST | Zahájení hovoru |
| `/api/call/end` | POST | Ukončení hovoru |
| `/api/call/status/:callSid` | GET | Stav hovoru |

## Struktura projektu

```
CALLME/
├── server/
│   ├── index.js          # Hlavní server (Express)
│   ├── database.js       # Mock databáze zákazníků
│   └── twilioService.js  # Twilio integrace
├── public/
│   ├── index.html        # Hlavní HTML stránka
│   ├── css/
│   │   └── styles.css    # Styly aplikace
│   └── js/
│       └── app.js        # Frontend JavaScript
├── .env.example          # Vzorová konfigurace
├── .gitignore
├── package.json
└── README.md
```

## Bezpečnostní poznámky

- Telefonní čísla zákazníků jsou uložena pouze na serveru
- API nikdy nevrací telefonní čísla na frontend
- Volání je iniciováno server-side přes Twilio
- V produkci doporučujeme přidat autentizaci operátorů

## Rozšíření pro produkci

Pro nasazení v produkčním prostředí zvažte:

1. **Databáze** - Nahraďte mock databázi reálnou (PostgreSQL, MongoDB)
2. **Autentizace** - Přidejte přihlašování operátorů (JWT, OAuth)
3. **HTTPS** - Zajistěte šifrované spojení
4. **Logging** - Implementujte centralizované logování
5. **Monitoring** - Přidejte sledování výkonu a chyb

## Licence

MIT

# CALLME - Operátorská aplikace pro volání zákazníkům

Webová aplikace pro call centrum operátory, která umožňuje volat zákazníkům bez zobrazení jejich telefonních čísel.

**Live Demo:** [https://radecek222-boop.github.io/CALLME/](https://radecek222-boop.github.io/CALLME/)

## Vlastnosti

- **Ochrana soukromí zákazníků** - Operátor nevidí telefonní čísla zákazníků, pouze jejich ID a jméno
- **VoIP volání** - Připraveno pro integraci s Twilio API
- **Seznam zákazníků** - Přehledný seznam s vyhledáváním
- **Demo režim** - Plně funkční ukázka bez nutnosti konfigurace

## Barevné schéma

Aplikace používá elegantní barevné schéma:
- **Černá** (#1a1a1a) - Hlavní pozadí
- **Bílá** (#ffffff) - Text a prvky
- **Zlatá** (#d4af37) - Akcenty a zvýraznění
- **Růžová** (#e91e8c) - Sekundární akcenty

## Struktura projektu

```
CALLME/
├── index.html    # Hlavní HTML stránka
├── styles.css    # CSS styly
├── app.js        # JavaScript aplikace
└── README.md
```

## Použití

1. Otevřete aplikaci v prohlížeči
2. Vyberte zákazníka ze seznamu
3. Klikněte na "Zavolat zákazníkovi"
4. Telefonní číslo zůstává skryté - operátor vidí pouze ID a jméno

## Rozšíření pro produkci

Pro nasazení s reálným voláním:

1. Přidejte backend server (Node.js/Express)
2. Nakonfigurujte Twilio API
3. Přidejte autentizaci operátorů
4. Připojte reálnou databázi zákazníků

## Licence

MIT

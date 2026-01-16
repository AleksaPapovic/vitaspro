# Google Drive Image Upload Setup

Ovaj vodič će vam pomoći da namestite upload slika na Google Drive kroz Google Apps Script.

## Koraci za podešavanje:

### 1. Ažurirajte Google Apps Script

1. Idite na [script.google.com](https://script.google.com)
2. Otvorite vaš postojeći projekat (ili kreirajte novi)
3. Kopirajte ceo kod iz `google-apps-script.js` fajla
4. Zamenite kod u vašem Apps Script projektu
5. **VAŽNO**: `FILE_ID` je sada dinamički i automatski se ekstraktuje iz Google Drive URL-a koji unesete u konfiguraciji. Ako želite da koristite drugačiji FILE_ID, možete ga proslediti u request-u ili postaviti u PropertiesService.

### 2. Deploy Web App

1. Kliknite na "Deploy" → "New deployment"
2. Izaberite tip: "Web app"
3. Postavite sledeće opcije:
   - **Execute as**: "Me"
   - **Who has access**: "Anyone"
4. Kliknite "Deploy"
5. Kopirajte **Web app URL** (izgleda ovako: `https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec`)

### 3. Konfigurišite AdminNew stranicu

1. Otvorite `/adminnew` stranicu u vašoj aplikaciji
2. Kliknite na "Prikaži Google Drive podešavanja"
3. Nalepite vaš **Google Apps Script Web App URL** u polje "Google Apps Script Web App URL"
4. Kliknite "Sačuvaj konfiguraciju"

### 4. Kako funkcioniše

- Kada upload-ujete sliku u AdminNew formi, slika se:
  1. Konvertuje u base64 format
  2. Šalje na Google Apps Script
  3. Apps Script kreira folder "VitasPro_Images" u vašem Google Drive-u (ako ne postoji)
  4. Upload-uje sliku u taj folder
  5. Postavlja dozvole da bude javno dostupna (Anyone with link)
  6. Vraća Google Drive share URL nazad u aplikaciju
  7. URL se čuva u `products.json` fajlu

### 5. Folder za slike

Sve slike će biti sačuvane u folderu **"VitasPro_Images"** u vašem Google Drive-u. Ovaj folder se automatski kreira pri prvom upload-u.

### 6. Testiranje

1. Otvorite `/adminnew` stranicu
2. Popunite formu za novi proizvod
3. Upload-ujte glavnu sliku i dodatne slike
4. Kliknite "Dodaj proizvod"
5. Proverite da li su slike upload-ovane u Google Drive folder "VitasPro_Images"

## Troubleshooting

### Problem: "Google Apps Script URL nije konfigurisan"
**Rešenje**: Unesite Google Apps Script Web App URL u podešavanjima AdminNew stranice.

### Problem: "Error uploading image to Google Drive" ili "Failed to fetch"
**Rešenje**: 
- Proverite da li je Apps Script pravilno deploy-ovan
- Proverite da li je "Who has access" postavljen na "Anyone"
- Proverite da li je "Execute as" postavljen na "Me"
- Proverite da li je Google Drive file URL pravilno unet u konfiguraciji (FILE_ID se automatski ekstraktuje iz URL-a)
- Proverite da li je Apps Script URL pravilno kopiran (mora da se završava sa `/exec`)
- Pokušajte da redeploy-ujete Apps Script sa novim verzijom

### Problem: Slike se ne prikazuju
**Rešenje**: 
- Proverite da li su dozvole na slikama postavljene na "Anyone with link"
- Proverite da li su URL-ovi pravilno sačuvani u `products.json`

### Problem: CORS greške
**Rešenje**: 
- Proverite da li je Apps Script deploy-ovan kao Web app sa "Anyone" pristupom
- Pokušajte da redeploy-ujete Apps Script

## Napomene

- Slike se čuvaju u base64 formatu tokom upload-a, što može biti sporo za velike slike
- Preporučeno je da kompresujete slike pre upload-a za bolje performanse
- Google Drive ima ograničenja na broj fajlova i veličinu, proverite [Google Drive kvote](https://support.google.com/drive/answer/6374270)

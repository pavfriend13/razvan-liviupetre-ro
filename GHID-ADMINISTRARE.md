# Website Răzvan-Liviu Petre: ghid de publicare și administrare

Website-ul este construit cu **Eleventy** (generator de site static) și are un panou de administrare **Decap CMS** la adresa `/admin`. Găzduirea recomandată este **Netlify** (gratuită pentru acest volum), iar conținutul este păstrat într-un depozit **GitHub**.

Cum funcționează: modificați ceva în panou → panoul salvează modificarea în GitHub → Netlify reconstruiește automat website-ul în aproximativ un minut.

---

## 1. Publicarea pentru prima dată (o singură dată)

### Pasul 1: Cont GitHub și depozit
1. Creați un cont gratuit pe github.com.
2. Creați un depozit nou (**New repository**), de exemplu `razvan-liviupetre-ro`. Îl puteți face **Private**.
3. Încărcați fișierele proiectului în depozit. Cel mai simplu este cu aplicația **GitHub Desktop** (File → Add local repository → alegeți folderul „Karate Website” → Publish).
   - Folderele `node_modules`, `_site` și `Media` **nu** se încarcă (sunt excluse automat prin `.gitignore`).

### Pasul 2: Site nou pe Netlify
1. Creați un cont pe netlify.com, folosind opțiunea „Sign up with GitHub”.
2. **Add new site → Import an existing project → GitHub** și alegeți depozitul.
3. Setările de build sunt citite automat din `netlify.toml` (comanda `npm run build`, folderul `_site`). Apăsați **Deploy**.
4. Notați adresa primită, de forma `https://ceva.netlify.app`.

### Pasul 3: Autentificarea în panou (GitHub OAuth)
1. Pe GitHub: **Settings → Developer settings → OAuth Apps → New OAuth App**.
   - Homepage URL: adresa site-ului (de ex. `https://razvan-liviupetre.ro` sau adresa `.netlify.app`)
   - Authorization callback URL: `https://api.netlify.com/auth/done`
2. Copiați **Client ID** și generați un **Client secret**.
3. Pe Netlify: **Site configuration → Access & security → OAuth → Install provider → GitHub**. Lipiți Client ID și Client secret.

### Pasul 4: Legați panoul de depozit
Făcut: în fișierul `src/admin/config.yml` este setat depozitul real:
```yaml
repo: pavfriend13/razvan-liviupetre-ro
```
Dacă depozitul se mută sau se redenumește, actualizați această linie și încărcați modificarea în GitHub.

### Pasul 5: Formularul de contact (Netlify Forms)
1. Pe Netlify: **Forms → Enable form detection**, apoi redeploy (Deploys → Trigger deploy).
2. **Forms → Form notifications → Add notification → Email notification** și introduceți adresa de e-mail la care Senseiul vrea să primească mesajele.
3. Trimiteți un mesaj de test de pe website-ul publicat.

> Pe calculatorul local, formularul nu trimite mesaje și afișează explicit acest lucru. Trimiterea funcționează doar pe website-ul publicat.

### Pasul 6: Domeniul razvan-liviupetre.ro
1. Verificați disponibilitatea și cumpărați domeniul de la un registrar `.ro`.
2. Pe Netlify: **Domain management → Add a domain** și urmați instrucțiunile DNS.
3. Certificatul HTTPS este emis automat și gratuit (Let's Encrypt).
4. Dacă adresa finală diferă, actualizați câmpul „Adresa website-ului” din panou (Pagini → Setări generale).

### Pasul 7: Acces pentru Sensei
Adăugați contul GitHub al Senseiului ca **Collaborator** în depozit (Settings → Collaborators). Doar persoanele cu acces la depozit se pot autentifica în panou.

---

## 2. Folosirea panoului de administrare

Intrați la `https://razvan-liviupetre.ro/admin` și apăsați **Autentifică-te**. Interfața este în limba română.

### Articole
1. **Articole → + articol**.
2. Completați titlul, data, categoria, imaginea, rezumatul și textul. Textul se scrie într-un editor vizual (titluri, liste, citate, linkuri, imagini).
3. **Salvează**: articolul rămâne **ciornă** și nu apare pe website.
4. Fila **Flux editorial** arată ciornele. Mutați articolul în „În revizuire”, apoi „Pregătit”, apoi apăsați **Publică**.
5. Previzualizarea este disponibilă în partea dreaptă a editorului.

Fiecare articol primește automat o adresă permanentă, de exemplu `/articole/titlul-articolului/`, apare în lista de articole, pe pagina principală (ultimele trei), în sitemap și la „Articole similare”.

### Evenimente
**Evenimente → + eveniment.** Evenimentele cu dată din trecut apar automat la „Evenimente trecute”. După desfășurare, adăugați fotografii în câmpul „Galerie foto după desfășurare”. Bifați „Eveniment demonstrativ” doar pentru exemple.

### Pagini
**Pagini** conține textele fiecărei pagini: Acasă, Despre, Corp–Minte–Spirit, Programe, Afilieri și realizări, Galerie, Contact, Confidențialitate și **Setări generale** (telefon, e-mail, adresă, rețele sociale, logo). Fiecare pagină are câmpuri **Titlu SEO** și **Descriere SEO**.

### Imagini
- Încărcați fotografii direct din câmpurile de imagine. Este recomandat ca fotografiile să aibă maximum 2000 px pe latura mare.
- Completați întotdeauna descrierea imaginii, pentru accesibilitate și SEO.
- **Nu publicați fotografii cu participanți sau minori fără acordul acestora sau al părinților.**

### Texte între paranteze drepte
Orice text de forma `[De completat: ...]` apare pe website **evidențiat cu roșu**, ca să fie ușor de găsit. După ce înlocuiți textul cu informația confirmată, evidențierea dispare automat.

---

## 3. Siguranță și backup
- Fiecare modificare făcută din panou este salvată ca versiune separată în GitHub. Orice versiune anterioară poate fi recuperată.
- Panoul este protejat prin autentificare GitHub. Activați autentificarea în doi pași (2FA) pe contul GitHub.
- Website-ul nu are bază de date sau server propriu care să poată fi atacat. Antetele de securitate HTTP sunt configurate în `netlify.toml`.
- Nu există cookies de marketing, analytics sau trackere. Dacă adăugați ulterior un serviciu de analiză, este necesar un banner de consimțământ.

---

## 4. Lucru pe calculator (opțional, pentru dezvoltator)
Necesită Node.js.
```
npm install
npm start          # website-ul la http://localhost:8080
npm run cms        # (într-o a doua fereastră) panoul local la http://localhost:8080/admin
npm run build      # generează website-ul în folderul _site
```

---

## 5. Ce trebuie completat sau confirmat înainte de lansare
- [x] Telefonul și e-mailul (Setări generale)
- [ ] Linkurile Facebook, Instagram, TikTok (Setări generale)
- [x] Indicațiile de acces la WeHeal Medical (Setări generale)
- [ ] Aprobarea textului de prezentare redactat pe baza CV-ului (Despre)
- [x] Cronologia, activitatea academică, experiența sportivă, studiile și publicațiile, din CV (Despre)
- [ ] Confirmarea rezultatelor „Locuri I–III la Campionatele Naționale”: ca sportiv sau ca antrenor (Afilieri și realizări)
- [ ] CV public (opțional): secțiunea apare automat doar după încărcarea unui fișier (Despre → CV)
- [ ] Logo-urile instituționale, doar cu drept de utilizare
- [ ] Reflecții și citate originale (Corp–Minte–Spirit)
- [ ] Ștergerea articolelor și evenimentelor marcate „[Exemplu]” și publicarea celor reale
- [ ] Politica de confidențialitate: datele operatorului, verificată de un specialist
- [ ] Fotografii suplimentare. Cele 5 fotografii cu copii din folderul `Media` nu sunt publicate până la confirmarea acordurilor.
- [ ] Logo-ul personal, dacă se dorește în locul logo-ului FRC (Setări generale → Logo)
- [ ] Disponibilitatea domeniului razvan-liviupetre.ro

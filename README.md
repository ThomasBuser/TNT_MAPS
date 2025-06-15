# TNT_MAPS

## Beschreibung der Anwendung

**TNT\_MAPS** ist eine moderne, datenbankgestützte Webanwendung, die es registrierten Nutzerinnen und Nutzern erlaubt, persönliche Standorte auf einer interaktiven Karte zu speichern, anzuzeigen, zu verwalten und zu löschen. Ziel der Anwendung ist es, eine einfache, zugängliche und zugleich technisch stabile Lösung für Menschen zu bieten, die sich leicht auf einer digitalen Karte orientieren und wichtige Orte im Alltag wiederfinden möchten – etwa den Lieblingsbäcker, den Parkplatz, eine Arztpraxis oder ein Reiseziel. Zusätzlich zur Standortverwaltung unterstützt TNT\_MAPS die Navigation mit Google Maps und bietet eine direkte Verlinkung zu Informationen des öffentlichen Verkehrs in der jeweiligen Region.Die Applikation richtet sich insbesondere auch an eine Zielgruppe über 50 Jahre, die durch eine aufgeräumte Benutzeroberfläche, klare Struktur, kontrastreiche Gestaltung und einfache Bedienung besonders angesprochen werden soll. Die Kombination aus bewährten Webtechnologien (HTML, CSS, JavaScript) und serverseitiger Datenverarbeitung mit PHP macht TNT\_MAPS zu einer sicheren und gleichzeitig leicht erweiterbaren Plattform.

## Hauptfunktionen

* **Benutzerregistrierung und -anmeldung**
  Nutzer können sich registrieren und mit E-Mail und Passwort einloggen. Dabei wird zusätzlich der Vorname erfasst, um eine personalisierte Nutzeransprache auf der Startseite zu ermöglichen.

* **Speichern von benutzerdefinierten Standorten**
  Durch Klicken auf die interaktive Karte oder durch die Verwendung von GPS (auf unterstützten Geräten) kann der Nutzer Orte hinzufügen. Diese werden in einer serverseitigen MySQL-Datenbank gespeichert.

* **Anzeige gespeicherter Standorte auf der Karte**
  Nach dem Login zeigt die Anwendung alle gespeicherten Standorte des angemeldeten Nutzers visuell auf der Google Maps-Karte an. Diese Markierungen können beliebig ergänzt oder entfernt werden.

* **Löschen von Standorten**
  Jeder gespeicherte Standort kann gezielt entfernt werden. Dies erfolgt sowohl auf der Benutzeroberfläche als auch serverseitig in der Datenbank.

* **Navigation und Integration öffentlicher Verkehrsmittel**
  TNT\_MAPS bietet die Möglichkeit, per Klick Navigation zu einem Ziel über Google Maps zu starten. Ergänzend wird eine Verlinkung zur Darstellung von ÖV-Verbindungen angeboten (z. B. via Google Transit).

* **Dynamisches Footer-Verhalten**
  Der Footer der Website wird nur dann eingeblendet, wenn der Nutzer sich nicht ganz oben auf der Seite befindet. Dieses Verhalten wird durch das Skript `footerScroll.js` ermöglicht und sorgt für ein aufgeräumtes Layout.

* **Responsive Design und Barrierefreiheit**
  Die Anwendung ist mobilfähig und nutzt einfache, kontrastreiche Farben und große Buttons. Die Benutzeroberfläche ist bewusst schlicht gehalten und orientiert sich an UI-Prinzipien, die besonders für ältere Nutzer geeignet sind.


## Technische Umsetzung

* **Frontend-Technologien:**
  HTML, CSS, JavaScript (ES6), Material Icons, responsives Layout

* **Backend-Technologien:**
  PHP (serverseitige Datenverarbeitung), MySQL (Datenbank)

* **Kartendienst:**
  Google Maps JavaScript API – für Kartenanzeige, Marker-Management, Routenplanung

* **Datenmanagement:**
  Speicherung und Verarbeitung aller Standortdaten erfolgt über PHP-Skripte, die auf JSON-Requests reagieren und via AJAX angesprochen werden.

* **Sicherheit & Validierung:**
  Die Anwendung prüft sämtliche Benutzereingaben auf Serverseite, verhindert doppelte Registrierung und speichert Passwörter sicher gehasht. E-Mail-Adressen müssen eindeutig sein, Passwörter bestimmte Kriterien erfüllen.


## Hinweise zur Standortbestimmung & Fehlerbehandlung

Die Standortbestimmung in modernen Browsern (insbesondere auf dem Mac) kann nach mehrmaligem Neuladen der Seite oder beim schnellen Hinzufügen mehrerer Standorte zeitweise ausfallen oder keine Position mehr liefern. Dies ist häufig auf Browserschutzmechanismen, Geolocation-Rate-Limits oder lokale Cache-Probleme zurückzuführen und stellt ein generelles Verhalten der Geolocation-API dar.

**Folgende Maßnahmen und Fallbacks wurden in TNT_MAPS implementiert, um eine möglichst stabile Standortbestimmung zu gewährleisten:**

- **Mehrstufige Standortermittlung:**  
  Es wird zunächst mit hoher Genauigkeit (GPS/WiFi) versucht, die Position zu bestimmen. Schlägt dies fehl, wird mit reduzierter Genauigkeit ein weiterer Versuch unternommen.

- **Dritter Fallback: IP-basierte Standortermittlung:**  
  Sollte auch die niedrige Genauigkeit scheitern, wird eine ungefähre Standortermittlung über einen externen IP-Geolocation-Dienst durchgeführt.

- **Cache-Leerung beim Laden:**  
  Zur Vermeidung von Caching-Problemen werden beim Laden der Seite `sessionStorage` und `localStorage` geleert.

- **Automatischer Retry bei temporärem Fehler:**  
  Tritt ein Fehler vom Typ `POSITION_UNAVAILABLE` auf, wird der Nutzer gebeten, kurz zu warten. Nach 3 Sekunden erfolgt ein erneuter Versuch der Standortermittlung.

- **Manuelle Eingabe als Alternative:**  
  Wenn alle automatischen Methoden scheitern, kann der Nutzer seinen Standort direkt eingeben (z. B. Ort, Adresse, Postleitzahl).

- **Deutliche Fehleranzeigen und Hilfetexte:**  
  Sämtliche Fehlerfälle werden dem Nutzer verständlich erklärt und mit klaren Handlungsempfehlungen ergänzt (z. B. Hinweis auf Browserberechtigungen oder das erneute Laden nach kurzer Wartezeit).

- **HTTPS-Voraussetzung:**  
  Die Anwendung benötigt für die Standortabfrage ein sicheres Protokoll (HTTPS). Bei lokalem Testen können Einschränkungen auftreten.

Diese Maßnahmen sorgen dafür, dass TNT_MAPS auch bei häufigem Seiten-Reload oder schlechten Empfangsbedingungen eine möglichst zuverlässige Standortbestimmung und gute Benutzerführung gewährleistet.

## Dateistruktur und Funktionen

-	index.html: Hauptseite der Anwendung (Start nach Login)           
-	login/index.html: Login-Formular für bestehende Nutzer             
-	register/index.html: Registrierungsformular mit Namens- und E-Mail-Feld      
-	add.php/api/add.php: PHP-Skripte zur Speicherung von Standorten            
-	delete.php: Löschen von gespeicherten Standorten                    
-	get_coordinates.php: Gibt Standortdaten in JSON-Format aus                   
-	js/maps.js: Hauptskript für Kartenanzeige und Marker-Funktionen     
-	js/footerScroll.js: JavaScript für dynamisches Ein-/Ausblenden des Footers  
-	js/login.js/js/register.js: Formulare mit Validierung, Fehlermeldungen und Feedback 
-	resources/sql/movies.sql: Beispiel-SQL-Struktur für Datenbankanbindung            
-	resources/assets/phpmyadmin_*.png: Screenshots zur Veranschaulichung der Datenbankstruktur 

Außerdem befinden sich mehrere Alternativversionen und Testskripte im Projektverzeichnis, z. B. verschiedene Varianten von `maps.js` (mit GPS-Unterstützung, Walking-Modus, ÖV-Modus etc.), die im Rahmen der Entwicklung erstellt und getestet wurden.

## Verwendete Templates und individuelle Anpassungen

Die Login- und Registrierungsformulare basieren auf vorgegebenen Unterrichtsvorlagen, wurden jedoch deutlich überarbeitet, erweitert und auf die Bedürfnisse der Anwendung abgestimmt:
-	 Nach erfolgreicher Registrierung wird der Nutzer automatisch eingeloggt und zur Startseite weitergeleitet – eine erneute Anmeldung ist nicht notwendig.
-	Das Registrierungsformular wurde um ein Namensfeld erweitert. Der Name wird später zur persönlichen Begrüßung verwendet.
-	Eingaben im Formular werden direkt überprüft (Client- und Server-seitig) – bei Fehlern erscheint eine unmittelbare Rückmeldung.
-	Die visuelle Gestaltung wurde überarbeitet, sodass die Formulare auf allen Bildschirmgrößen und Geräten gut lesbar und einfach bedienbar sind.
-	Der Code wurde aufgeräumt, kommentiert und modularisiert, um die Wartbarkeit zu verbessern.

## Einsatz künstlicher Intelligenz (KI)
Während der Entwicklung kamen verschiedene KI-Tools unterstützend zum Einsatz. Dabei lag der Fokus auf:
* **Fehleranalyse und Debugging:** KI half beim Identifizieren typischer JavaScript- und PHP-Fehler, die in der Entwicklung auftraten.
* **Codeoptimierung (Clean Code):** Vorschläge zur Umstrukturierung von Funktionsblöcken oder zur besseren Lesbarkeit wurden übernommen.
* **Hilfestellung bei API-Integration:** Die Google Maps API wurde mithilfe von KI schneller und effizienter eingebunden.
* **Dokumentation:** Teile dieses README-Texts wurden KI-unterstützt formuliert und strukturiert.

### Verwendete Tools:
* **ChatGPT (OpenAI):** Hilfestellung bei JavaScript/PHP-Logik, UX-Verbesserungen
* **GitHub Copilot:** Vervollständigung und Optimierung von Funktionsblöcken im Code
* **Claude (Anthropic):** Ergänzende Formulierungsvorschläge und Review-Ansätze

## Quellen
-	Hintergrundbild für die Karte:**
 [Pixabay – Regenwald](https://pixabay.com/de/photos/regenwald-weg-morgennebel-asahi-4350845/) – unter freier Lizenz nutzbar.

-	Google Maps API
- Dokumentation](https://developers.google.com/maps/documentation/javascript/)
  * [PHP Manual](https://www.php.net/manual/de/)
  * [MDN Web Docs](https://developer.mozilla.org/)
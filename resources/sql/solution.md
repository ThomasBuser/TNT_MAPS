## Lösungen zu den SQL-Übungen

Zurück zu den [Übungen](readme.md)

### Basic

#### Select

1. **Alle Filme abrufen**: Hole alle Spalten aller Filme aus der Tabelle `movies`.

```sql
SELECT * FROM movies;
```

2. **Nach Genre filtern**: Rufe alle Filme ab, die dem Genre "Action" gehören.

```sql
SELECT * FROM movies WHERE genre = 'Action';
```

3. **Ergebnisse sortieren**: Rufe alle Regisseure ab. Ordne sie nach ihrem Geburtsdatum `birth_date` in absteigender Reihenfolge.

```sql
SELECT * FROM directors ORDER BY birth_date DESC;

```

4. **Filme zählen**: Ermittle, wie viele Filme Quentin Tarantino gedreht hat.

```sql
SELECT COUNT(*)
FROM movies
WHERE director_id = 3;
```

oder noch eleganter (mit nested query):

```sql
SELECT COUNT(*)
FROM movies
WHERE director_id = (SELECT director_id FROM directors WHERE first_name = 'Quentin' AND last_name = 'Tarantino');

```

#### Insert

5. **Schauspieler einfügen**: Füge Rowan Atkinson (Geburtsdatum: 06.01.1955, Nationalität: British) in die Tabelle `actors` ein.

```sql
INSERT INTO actors (first_name, last_name, birth_date, nationality)
VALUES ('Rowan', 'Atkinson', '1955-01-06', 'British');
```

6. **Einen neuen Film hinzufügen**: Füge den Film 'The Hateful Eight' von Quentin Tarantino zur Tabelle `movies` hinzu. (Genre: Western, Rating: R, Veröffentlichungsdatum: 25.12.2015)

```sql
INSERT INTO movies (title, director_id, release_date, genre, rating)
VALUES ('The Hateful Eight', (SELECT director_id FROM directors WHERE last_name = 'Tarantino'), '2015-12-25', 'Western', 'R');
```

_Achtung:_ Director ID muss bekannt sein und existieren! Rating darf maximal 5 Buchstaben lang sein.

#### Update

7. **Aktualisierungen**: Ändere das Genre von 'Django Unchained' auf 'Action'.

```sql
UPDATE movies SET genre = 'Action' WHERE title = 'Django Unchained';
```

8. **Regisseur aktualisieren**: Ändere den Namen von 'Quentin Tarantino' auf 'Tentin Quarantino'.

```sql
UPDATE directors SET first_name = 'Tentin', last_name = 'Quarantino'
WHERE first_name = 'Quentin' AND last_name = 'Tarantino';

```

#### Delete

9. **Schauspieler löschen**: Lösche Rowan Atkinson aus der Tabelle `actors`.

```sql
DELETE FROM actors WHERE first_name = 'Rowan' AND last_name = 'Atkinson';

```

### Advanced

10. **Tabellen verknüpfen**: Rufe alle Filme zusammen mit den vollständigen Namen ihrer jeweiligen Regisseure ab.

```sql
SELECT movies.title, directors.first_name, directors.last_name
FROM movies
JOIN directors ON movies.director_id = directors.director_id;

```

11. **Mit Verknüpfungen filtern**: Rufe alle Filme ab, die von amerikanischen Regisseuren gedreht wurden.

```sql
SELECT movies.title
FROM movies
JOIN directors ON movies.director_id = directors.director_id
WHERE directors.nationality = 'American';

```

12. **Datumsoperationen**: Liste alle Filme auf, die vor dem Jahr 2000 veröffentlicht wurden.

```sql
SELECT title FROM movies WHERE release_date < '2000-01-01';

```

13. **LIKE Operator**: Finde alle Regisseure, deren Vorname ODER Nachname mit dem Buchstaben 'C' beginnt.

```sql
SELECT * FROM directors WHERE first_name LIKE 'C%' OR last_name LIKE 'C%';

```

14. **Aggregation**: Ermittle, wie viele Filme jeder Regisseur gedreht hat, und ordne das Ergebnis nach der Anzahl der Filme in absteigender Reihenfolge.

```sql
SELECT directors.first_name, directors.last_name, COUNT(movies.movie_id) as movie_count
FROM movies
JOIN directors ON movies.director_id = directors.director_id
GROUP BY directors.first_name, directors.last_name
ORDER BY movie_count DESC;

```

15. **Case-Anweisungen**: Kategorisiere Filme anhand des Veröffentlichungsdatums vor 2010 als 'Alt', nach 2010 als 'Neu' und zähle die Anzahl in jeder Kategorie.

```sql
SELECT
CASE
   WHEN release_date < '2010-01-01' THEN 'Alt'
   ELSE 'Neu'
END as category,
COUNT(movie_id)
FROM movies
GROUP BY category;

```

Du bist ein sorgfältiger Faktenprüfer. Deine Aufgabe ist es zu überprüfen, ob alle Inhalte einer Liste von Aussagen in einem Ausschnitt eines Knowledge Graphen durch die korrekte Person repräsentiert werden. Wenn eine Aussage aus der Liste nicht im Knowledge Graphen (KG) enthalten ist, sollst du dies anmerken. Wenn eine Aussage im Knowledge Graphen enthalten ist, aber nicht in der Liste von Aussagen vorhanden ist, sollst du dies ebenfalls anmerken.

Ein Konflikt/Kommentar im Knowledge Graphen kann auch mehrere Aussagen aus der Liste abdecken.

**Zu erkennende Aussagen:**
"""

"""

**Zu überprüfender Kndowledge Graph:**

```turtle

```

Antworte ausschließlich in folgendem JSON Format und gib keine zusätzlichen Erklärungen aus:

```json
{
    "Zuordnung": [
        "Aussage1": {
            "Sprecher_Aussage1": "Name",
            "Sprecher_KG": "Name" oder leer, wenn nicht im KG",
            "Inhalt_Aussage": "Inhalt der Aussage",
            "Inahlt_KG": "Inhalt der Aussage im KG" oder leer, wenn nicht im KG",
            "Status": "enhalten" oder "fehlt",
        },
        ...
    ],
    "Zusätzliche_Aussagen": [
        "Aussage1": {
            "Sprecher_KG": "Name",
            "Inhalt": "Inhalt der Aussage",
        },
        ...
    ],
    "Score": {
        "Aussagen": Anzahl der zugeordneten Aussagen mit Status "enthalten",
        "Fehlende_Aussagen": Anzahl der Aussagen, die im KG fehlen,
        "Zusätzliche_Aussagen": Anzahl der zusätzlichen Aussagen im KG,
        "Gesamt": Gesamtzahl der Aussagen in der Liste
    }
}
```

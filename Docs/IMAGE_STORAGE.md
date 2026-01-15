# Stockage des Images - Base64 vs Fichiers

## ✅ Solution actuelle : Stockage en Base64 dans la base de données

### Pourquoi Base64 ?

Les images d'occlusion sont maintenant stockées directement dans la base de données en format **Base64** (Data URL) plutôt que comme fichiers sur le système de fichiers.

### Avantages

1. **✅ Backup automatique**
   - Les images sont sauvegardées avec la base de données
   - Pas besoin de gérer séparément les fichiers

2. **✅ Déploiement simplifié**
   - Pas de dossier `uploads/` à synchroniser
   - Fonctionne parfaitement avec Docker
   - Idéal pour les environnements cloud (Render, Heroku, etc.)

3. **✅ Portabilité**
   - Export/import de decks inclut automatiquement les images
   - Pas de liens cassés si les fichiers sont déplacés

4. **✅ Atomicité**
   - Suppression d'une carte = suppression automatique de l'image
   - Pas de fichiers orphelins

### Format de stockage

Les images sont stockées comme **Data URLs** :
```
data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...
```

Structure :
- `data:` - Préfixe Data URL
- `image/png` - Type MIME de l'image
- `base64,` - Encodage
- `iVBORw0KGgo...` - Données de l'image encodées en Base64

### Limites

- **Taille maximale** : 10 MB par image (configuré dans le contrôleur)
- **Type de colonne** : `TEXT` (illimité dans PostgreSQL)

### Performance

**Impact minimal** :
- Les images sont chargées uniquement quand nécessaire
- Le navigateur met en cache les Data URLs
- PostgreSQL gère efficacement les colonnes TEXT

### Migration

Si vous avez des cartes existantes avec des fichiers :
1. Les anciennes cartes avec chemins de fichiers continueront de fonctionner
2. Les nouvelles cartes utiliseront Base64
3. Pour convertir les anciennes : supprimez et recréez les cartes

### Code

**Contrôleur (card_controller.ts)** :
```typescript
// Lire l'image et la convertir en Base64
const fs = await import('node:fs/promises')
const imageBuffer = await fs.readFile(image.tmpPath!)
const base64Image = imageBuffer.toString('base64')
const mimeType = image.type || 'image/png'

// Créer un Data URL
const imageDataUrl = `data:${mimeType};base64,${base64Image}`

// Stocker dans la DB
await Card.create({
  imagePath: imageDataUrl, // Data URL au lieu du chemin fichier
  // ...
})
```

**Vue (present_question_with_time.edge)** :
```javascript
// L'image peut être utilisée directement
img.src = imagePath; // Fonctionne avec Data URL ou chemin fichier
```

### Nettoyage

Le dossier `public/uploads/occlusion-images/` n'est plus utilisé et peut être supprimé.

---

**Cette approche garantit que vos images sont toujours disponibles, sauvegardées et portables ! 🎉**

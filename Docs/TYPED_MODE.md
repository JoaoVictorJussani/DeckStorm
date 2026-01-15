# Mode "Réponse Tapée" (Typed Answer)

## Description
Le mode "Réponse Tapée" oblige l'utilisateur à saisir manuellement la réponse avant de voir la correction. Cela favorise la **mémorisation active**, car l'utilisateur doit produire l'information plutôt que de simplement la reconnaître.

## Fonctionnement

1. **Saisie** : L'utilisateur voit la question et un champ de texte.
2. **Validation** : L'utilisateur tape sa réponse et appuie sur "Vérifier" (ou Entrée).
3. **Comparaison** :
   - Le système compare la réponse saisie avec la réponse attendue.
   - La comparaison ignore la casse (majuscules/minuscules) et la ponctuation de base.
4. **Feedback** :
   - ✅ **Correct** : Message vert, bouton "Continuer" (compte comme une réussite).
   - ❌ **Incorrect** : Message rouge, affiche la bonne réponse, bouton "Continuer (Incorrect)" ou "Forcer Correct" (si l'utilisateur juge que sa réponse était acceptable malgré la différence stricte).

## Technique

- **Stockage** : Aucune modification de base de données nécessaire. Le mode utilise les champs `question` et `answer` existants.
- **Occlusion d'image** : Compatible ! L'utilisateur voit l'image cachée et doit taper ce qui se trouve derrière le masque.
- **Vérification** : Effectuée côté client (JavaScript) pour une réactivité immédiate.

## Activation

Le propriétaire du deck doit activer ce mode dans la configuration du deck ("Modifier le Deck").
L'utilisateur peut ensuite le sélectionner au lancement de la session.

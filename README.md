# 🧬 Écosystème Numérique - Simulation de Boids

Une simulation interactive de vie artificielle développée en JavaScript pur, illustrant les comportements émergents d'un essaim (algorithme de Reynolds).

## Démo en direct
[Insérez votre lien GitHub Pages ici]

## Aperçu du projet
Ce projet va au-delà d'une simple animation. Il s'agit d'un moteur de comportement où chaque entité (Boid) prend des décisions autonomes basées sur son environnement immédiat, les obstacles créés par l'utilisateur et les sources de nourriture.

## Fonctionnalités Clés
- **Algorithme de Boids complet :** Gestion fluide de la séparation (éviter les voisins), de l'alignement (suivre la direction du groupe) et de la cohésion (rester proche du centre).
- **Environnement Destructible :** L'utilisateur peut dessiner des murs. Les boids évitent ces obstacles, mais une collision répétée finit par détruire le mur (système de points de vie).
- **Système de Score & Persistance :** Intégration du `localStorage` pour sauvegarder le record (High Score) entre les sessions.
- **Rendu Performant :** Utilisation intensive de **HTML5 Canvas** et `requestAnimationFrame` pour garantir une fluidité constante (60 FPS).
- **Effets Visuels :** Système de particules pour les explosions lors de la destruction des obstacles.

## Stack Technique
- **Logic :** JavaScript (ES6+) - Programmation Orientée Objet (POO).
- **Graphics :** HTML5 Canvas API.
- **Styling :** CSS3 (Glassmorphism & Design Responsif).

## Défis Techniques résolus
- **Calcul Vectoriel :** Implémentation d'une classe `Vector` personnalisée pour gérer les forces de direction (Steering Forces).
- **Optimisation du Rendu :** Gestion du cycle de vie des particules et des boids pour éviter les fuites de mémoire (Memory Leaks).
- **Interaction Temps Réel :** Synchronisation entre les événements de souris (dessin dynamique) et la logique de détection de collision des entités.

## Installation
1. Clonez le dépôt : `git clone https://github.com/Tran-Ch/Digital-Ecosystem.git`
2. Ouvrez `index.html` dans votre navigateur. Aucun serveur ou dépendance n'est requis.

---
*Projet développé dans le cadre d'un portfolio de développement Web Front-end.*
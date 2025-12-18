🚀 HAPPI DEMO - Factory Project

Bienvenue dans le dépôt du projet HAPPI DEMO. Ce projet est une implémentation de la structure "Factory", conçue pour séparer le Site Global (le wrapper) des Services Portables.

🏗️ Structure du Projet

GLOBAL_news/ : Le socle technique (Django/Wagtail) qui accueille les services.

site_conf/ : Configuration centralisée des environnements (base, dev, prod).

factory_setup.sh : Le script d'automatisation utilisé pour générer cette base.

🛠️ Installation Rapide (Local)

Pour faire tourner cette démo sur votre machine :

Cloner le projet

git clone [https://github.com/VOTRE_NOM/VOTRE_REPO.git](https://github.com/VOTRE_NOM/VOTRE_REPO.git)
cd GLOBAL_news


Lancer le serveur

source .venv/bin/activate
python manage.py runserver


Accéder aux interfaces

Site : http://127.0.0.1:8000

Admin Django : http://127.0.0.1:8000/admin/ (admin/admin)

💡 Philosophie

Ce projet démontre qu'un Site Global doit rester minimaliste. Il ne contient pas d'application métier par défaut, mais il est prêt à recevoir n'importe quel "Service Portable" de la Factory.

Généré avec l'assistance de Gemini - Architecture Factory v6.

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Politique de Confidentialité - HikmaClips',
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-8">
            <a href="/" className="text-xl font-bold bg-gradient-to-r from-islamic-green to-islamic-gold bg-clip-text text-transparent">HikmaClips</a>
        </div>
      </header>
      <main className="container mx-auto p-4 sm:p-8">
        <div className="prose prose-invert max-w-4xl mx-auto">
          <h1>Politique de Confidentialité</h1>
          <p>Dernière mise à jour: 3 Février 2026</p>
          
          <h2>1. Introduction</h2>
          <p>
            Bienvenue sur HikmaClips. Nous respectons votre vie privée et nous nous engageons à la protéger. Cette politique de confidentialité explique comment nous collectons, utilisons, divulguons et protégeons vos informations lorsque vous utilisez notre application.
          </p>

          <h2>2. Informations que nous collectons</h2>
          <p>
            Nous pouvons collecter des informations vous concernant de différentes manières. Les informations que nous pouvons collecter sur l'application incluent :
          </p>
          <ul>
            <li>
              <strong>Données personnelles :</strong> Les informations personnellement identifiables, telles que votre nom, votre adresse e-mail, que vous nous fournissez volontairement lorsque vous vous inscrivez à l'application via Google.
            </li>
             <li>
              <strong>Données de connexion :</strong> Lorsque vous vous connectez avec Google, nous recevons des informations de base de votre profil Google, telles que votre nom, votre adresse e-mail et votre photo de profil. Nous n'avons pas accès à votre mot de passe Google.
            </li>
          </ul>

          <h2>3. Utilisation de vos informations</h2>
          <p>
            Avoir des informations précises sur vous nous permet de vous offrir une expérience fluide, efficace et personnalisée. Plus précisément, nous pouvons utiliser les informations collectées à votre sujet via l'application pour :
          </p>
          <ul>
            <li>Gérer votre compte et vos préférences.</li>
            <li>Vous permettre une interaction utilisateur-à-utilisateur (fonctionnalité future).</li>
            <li>Améliorer le fonctionnement et l'expérience de l'application.</li>
            <li>Compiler des données statistiques anonymes pour une utilisation interne.</li>
          </ul>

          <h2>4. Sécurité de vos informations</h2>
          <p>
            Nous utilisons des mesures de sécurité administratives, techniques et physiques pour aider à protéger vos informations personnelles. Bien que nous ayons pris des mesures raisonnables pour sécuriser les informations personnelles que vous nous fournissez, sachez que malgré nos efforts, aucune mesure de sécurité n'est parfaite ou impénétrable.
          </p>

          <h2>5. Suppression de votre compte et de vos données</h2>
          <p>
            Vous pouvez demander la suppression de votre compte et de toutes les données associées à tout moment. Pour ce faire :
          </p>
          <ul>
            <li>
              <strong>Par e-mail :</strong> Envoyez un e-mail à <a href="mailto:contact@hikmaclips.com" className="text-islamic-green hover:underline">contact@hikmaclips.com</a> avec l'objet "Demande de suppression de compte" en précisant l'adresse e-mail associée à votre compte.
            </li>
            <li>
              <strong>Par téléphone :</strong> Contactez-nous au +212 699 24 55 42.
            </li>
          </ul>
          <p>
            <strong>Données supprimées :</strong>
          </p>
          <ul>
            <li>Votre nom et adresse e-mail</li>
            <li>Votre photo de profil</li>
            <li>Votre identifiant utilisateur</li>
            <li>Toutes les préférences liées à votre compte</li>
          </ul>
          <p>
            <strong>Délai de traitement :</strong> Votre demande sera traitée dans un délai maximum de 7 jours ouvrables. Vous recevrez une confirmation par e-mail une fois la suppression effectuée.
          </p>
          <p>
            <strong>Note :</strong> Les contenus que vous avez générés et téléchargés sur votre appareil ne sont pas stockés sur nos serveurs et ne seront donc pas affectés par la suppression de votre compte.
          </p>

          <h2>6. Nous contacter</h2>
          <p>
            Si vous avez des questions ou des commentaires sur cette politique de confidentialité, veuillez nous contacter à :
          </p>
          <address className="not-italic">
            web-linecreator.fr<br />
            Meknès, Maroc<br />
            Contact : +212 699 24 55 42
          </address>
        </div>
      </main>
       <footer className="border-t mt-8 py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} HikmaClips. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  );
}

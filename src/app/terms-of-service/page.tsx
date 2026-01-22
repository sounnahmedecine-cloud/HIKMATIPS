import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Conditions d\'Utilisation - HikmaClips',
};

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-8">
           <a href="/" className="text-xl font-bold bg-gradient-to-r from-tiktok-cyan to-tiktok-pink bg-clip-text text-transparent">HikmaClips</a>
        </div>
      </header>
      <main className="container mx-auto p-4 sm:p-8">
        <div className="prose prose-invert max-w-4xl mx-auto">
          <h1>Conditions d'Utilisation</h1>
          <p>Dernière mise à jour: 24 Juillet 2024</p>

          <h2>1. Accord sur les conditions</h2>
          <p>
            En utilisant l'application HikmaClips (« Service »), vous acceptez d'être lié par ces Conditions d'Utilisation. Si vous n'êtes pas d'accord avec une partie des conditions, vous ne pouvez pas utiliser notre service.
          </p>

          <h2>2. Utilisation de l'application</h2>
          <p>
            HikmaClips vous fournit des outils pour créer du contenu visuel pour les médias sociaux. Vous êtes responsable du contenu que vous créez et partagez. Vous acceptez de ne pas utiliser l'application pour créer du contenu illégal, haineux, diffamatoire ou qui enfreint les droits d'autrui.
          </p>
          <p>
            Vous ne pouvez pas utiliser le service à des fins illégales ou non autorisées. Vous acceptez de vous conformer à toutes les lois, règles et réglementations applicables à votre utilisation du Service.
          </p>

          <h2>3. Comptes d'utilisateurs</h2>
          <p>
            Lorsque vous créez un compte chez nous via l'authentification Google, vous devez nous fournir des informations exactes, complètes et à jour. Le non-respect de cette obligation constitue une violation des Conditions, qui peut entraîner la résiliation immédiate de votre compte sur notre service.
          </p>
          
          <h2>4. Propriété intellectuelle</h2>
          <p>
            Le Service et son contenu original (à l'exception du contenu généré par les utilisateurs), ses caractéristiques et ses fonctionnalités sont et resteront la propriété exclusive de web-linecreator.fr. Le service est protégé par le droit d'auteur, la marque de commerce et d'autres lois du Maroc et des pays étrangers.
          </p>

          <h2>5. Résiliation</h2>
          <p>
            Nous pouvons résilier ou suspendre votre compte immédiatement, sans préavis ni responsabilité, pour quelque raison que ce soit, y compris, sans s'y limiter, si vous ne respectez pas les Conditions.
          </p>

          <h2>6. Limitation de responsabilité</h2>
          <p>
            En aucun cas, HikmaClips, ni ses directeurs, employés, partenaires, agents, fournisseurs ou affiliés, ne pourront être tenus responsables de tout dommage indirect, accessoire, spécial, consécutif ou punitif.
          </p>
          
          <h2>7. Contact</h2>
          <p>
            Pour toute question concernant ces Conditions, veuillez contacter :
          </p>
           <address className="not-italic">
            web-linecreator.fr<br />
            Meknès, Maroc<br />
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

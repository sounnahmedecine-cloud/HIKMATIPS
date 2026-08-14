import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Supprimer votre compte - HikmaClips',
  description:
    'Demandez la suppression de votre compte HikmaClips et de toutes les données associées.',
};

export default function DeleteAccount() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-8">
          <a
            href="/"
            className="text-xl font-bold bg-gradient-to-r from-islamic-green to-islamic-gold bg-clip-text text-transparent"
          >
            HikmaClips
          </a>
        </div>
      </header>
      <main className="container mx-auto p-4 sm:p-8">
        <div className="prose prose-invert max-w-4xl mx-auto">
          <h1>Supprimer votre compte HikmaClips</h1>
          <p>Dernière mise à jour: 14 Août 2026</p>

          <p>
            Cette page explique comment demander la suppression de votre compte
            HikmaClips (application <strong>com.hikmatips.app</strong>) et de
            toutes les données qui y sont associées. La demande est gratuite et
            peut être faite à tout moment, sans avoir à justifier votre décision.
          </p>

          <h2>1. Comment demander la suppression</h2>
          <p>
            Utilisez l&apos;un des deux moyens suivants. Indiquez impérativement
            l&apos;adresse e-mail associée à votre compte, afin que nous
            puissions l&apos;identifier.
          </p>
          <ul>
            <li>
              <strong>Par e-mail :</strong> envoyez un message à{' '}
              <a
                href="mailto:contact@hikmaclips.com?subject=Demande%20de%20suppression%20de%20compte"
                className="text-islamic-green hover:underline"
              >
                contact@hikmaclips.com
              </a>{' '}
              avec l&apos;objet «&nbsp;Demande de suppression de compte&nbsp;».
            </li>
            <li>
              <strong>Par téléphone :</strong> appelez le +212 699 24 55 42.
            </li>
          </ul>

          <h2>2. Données supprimées</h2>
          <p>
            À réception de votre demande, les éléments suivants sont
            définitivement supprimés de nos serveurs :
          </p>
          <ul>
            <li>Votre compte d&apos;authentification (adresse e-mail et identifiant utilisateur)</li>
            <li>Votre nom et votre photo de profil</li>
            <li>Votre document utilisateur et les préférences qu&apos;il contient</li>
            <li>Les clips et vidéos enregistrés sur votre espace personnel</li>
            <li>
              Le cas échéant, votre inscription au programme bêta et les
              retours que vous avez envoyés
            </li>
          </ul>

          <h2>3. Données conservées</h2>
          <p>
            Les contenus que vous avez générés puis téléchargés sur votre
            appareil (images, clips partagés) ne sont pas stockés sur nos
            serveurs : ils restent sur votre téléphone et ne sont pas affectés
            par la suppression. Vous pouvez les effacer vous-même à tout moment.
          </p>
          <p>
            De la même manière, les réglages enregistrés localement par
            l&apos;application (favoris, horaires de rappel, thème, historique
            de recherche) ne quittent jamais votre appareil. Ils disparaissent
            lorsque vous désinstallez l&apos;application ou effacez ses données
            depuis les réglages Android.
          </p>
          <p>
            Aucune donnée n&apos;est conservée à des fins commerciales après la
            suppression. Si une obligation légale nous imposait de conserver
            temporairement une information, nous vous en informerions dans notre
            réponse.
          </p>

          <h2>4. Délai de traitement</h2>
          <p>
            Votre demande est traitée dans un délai maximum de{' '}
            <strong>7 jours ouvrables</strong>. Vous recevez une confirmation
            par e-mail une fois la suppression effectuée. La suppression est
            définitive et irréversible : un nouveau compte devra être créé si
            vous souhaitez utiliser à nouveau les fonctions liées à un compte.
          </p>

          <h2>5. Nous contacter</h2>
          <p>
            Pour toute question sur cette procédure ou sur le traitement de vos
            données, consultez notre{' '}
            <a href="/privacy-policy" className="text-islamic-green hover:underline">
              politique de confidentialité
            </a>{' '}
            ou écrivez-nous :
          </p>
          <address className="not-italic">
            web-linecreator.fr
            <br />
            Meknès, Maroc
            <br />
            Contact : +212 699 24 55 42
            <br />
            <a
              href="mailto:contact@hikmaclips.com"
              className="text-islamic-green hover:underline"
            >
              contact@hikmaclips.com
            </a>
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

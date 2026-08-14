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
          <p>
            Si vous souhaitez effacer seulement une partie de vos données sans
            fermer votre compte, la marche à suivre est décrite à la{' '}
            <a href="#partielle" className="text-islamic-green hover:underline">
              section 3
            </a>
            .
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
                href="mailto:weblinecreation88@gmail.com?subject=Demande%20de%20suppression%20de%20compte"
                className="text-islamic-green hover:underline"
              >
                weblinecreation88@gmail.com
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

          <h2 id="partielle" className="scroll-mt-24">
            3. Supprimer une partie de vos données sans fermer votre compte
          </h2>
          <p>
            Vous n&apos;êtes pas obligé de supprimer votre compte pour effacer
            vos données. Vous pouvez demander la suppression de certains
            éléments seulement, tout en gardant votre compte et votre accès à
            l&apos;application.
          </p>
          <p>
            Utilisez les mêmes moyens de contact qu&apos;à la section 1, en
            précisant dans votre message les éléments concernés :
          </p>
          <ul>
            <li>Les clips et vidéos enregistrés sur votre espace personnel</li>
            <li>Les préférences enregistrées sur votre compte</li>
            <li>
              Votre inscription au programme bêta et les retours que vous avez
              envoyés
            </li>
          </ul>
          <p>
            Ces demandes suivent le même délai de traitement que la suppression
            complète et donnent lieu à la même confirmation par e-mail. Votre
            compte d&apos;authentification, lui, reste actif.
          </p>

          <h2>4. Données conservées</h2>
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

          <h2>5. Délai de traitement</h2>
          <p>
            Votre demande est traitée dans un délai maximum de{' '}
            <strong>7 jours ouvrables</strong>. Vous recevez une confirmation
            par e-mail une fois la suppression effectuée. La suppression est
            définitive et irréversible : un nouveau compte devra être créé si
            vous souhaitez utiliser à nouveau les fonctions liées à un compte.
          </p>

          <h2>6. Nous contacter</h2>
          <p>
            Pour toute question sur cette procédure ou sur le traitement de vos
            données, consultez notre{' '}
            <a href="/privacy-policy" className="text-islamic-green hover:underline">
              politique de confidentialité
            </a>{' '}
            ou écrivez-nous :
          </p>
          <address className="not-italic">
            web-linecreation.fr
            <br />
            Meknès, Maroc
            <br />
            Contact : +212 699 24 55 42
            <br />
            <a
              href="mailto:weblinecreation88@gmail.com"
              className="text-islamic-green hover:underline"
            >
              weblinecreation88@gmail.com
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

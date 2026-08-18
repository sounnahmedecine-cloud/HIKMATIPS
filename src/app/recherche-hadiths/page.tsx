import type { Metadata } from 'next';
import { RechercheHadithsClient } from './RechercheHadithsClient';

export const metadata: Metadata = {
  title: 'Recherche de hadiths authentiques | HikmaClips',
  description: 'Recherchez instantanément parmi des milliers de hadiths authentiques issus des recueils de référence (Bukhari, Muslim, Tirmidhi...) avec leur source précise.',
  alternates: { canonical: '/recherche-hadiths' },
};

export default function RechercheHadithsPage() {
  return <RechercheHadithsClient />;
}

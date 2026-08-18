import type { Metadata } from 'next';
import { RessourcesClient } from './RessourcesClient';

export const metadata: Metadata = {
  title: 'Ressources — Hadiths et versets coraniques | HikmaClips',
  description: 'Explorez des milliers de hadiths authentiques (Bukhari, Muslim, Abu Dawud...) et de versets coraniques, avec recherche instantanée et favoris.',
  alternates: { canonical: '/ressources' },
};

export default function RessourcesPage() {
  return <RessourcesClient />;
}

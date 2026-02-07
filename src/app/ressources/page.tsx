'use client';

import { useState, useMemo, useEffect } from 'react';
import { BookOpen, Search, BookMarked, Moon, Heart, Library, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Hadiths } from '@/lib/hadiths';
import { VersetsCoraniques } from '@/lib/versets-coraniques';
import { searchHadiths, DetailedHadith } from '@/lib/hadith-search';

const HADITH_BOOKS_INFO = [
  { name: 'Sahih Bukhari', count: 7589, description: 'Le recueil le plus authentique.' },
  { name: 'Sahih Muslim', count: 7563, description: 'Deuxième pilier de l\'authenticité.' },
  { name: 'Sunan Abu Dawud', count: 5274, description: 'Focus sur les règles juridiques.' },
  { name: 'Sunan An-Nasa\'i', count: 5765, description: 'Excellence dans la classification.' },
  { name: 'Sunan Ibn Majah', count: 4343, description: 'Complément des Sunan.' },
  { name: 'Muwatta Malik', count: 1899, description: 'Le plus ancien recueil majeur.' },
];

export default function RessourcesPage() {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('hadiths');
  const [detailedResults, setDetailedResults] = useState<DetailedHadith[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const filteredHadiths = useMemo(() => {
    if (!search.trim()) return Hadiths.slice(0, 50);
    const q = search.toLowerCase();
    return Hadiths.filter(
      h => h.content.toLowerCase().includes(q) || h.source.toLowerCase().includes(q)
    ).slice(0, 50);
  }, [search]);

  const filteredVersets = useMemo(() => {
    if (!search.trim()) return VersetsCoraniques.slice(0, 50);
    const q = search.toLowerCase();
    return VersetsCoraniques.filter(
      v => v.content.toLowerCase().includes(q) || v.source.toLowerCase().includes(q)
    ).slice(0, 50);
  }, [search]);

  // Recherche dans les 9 livres
  useEffect(() => {
    if (activeTab !== 'nine_books' || search.length < 3) {
      setDetailedResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      const results = await searchHadiths(search);
      setDetailedResults(results);
      setIsSearching(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [search, activeTab]);

  return (
    <div className="min-h-screen bg-background p-4 pb-24">
      <div className="max-w-6xl mx-auto">
        <div className="text-center pt-6 pb-2 mb-6">
          <h1 className="text-2xl font-bold text-hikma-gradient inline-block">Ressources</h1>
          <p className="text-muted-foreground text-sm mt-1">Bibliothèque de sagesse islamique</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Informative - Visible on lg screens */}
          <aside className="hidden lg:block w-72 shrink-0 space-y-4">
            <Card className="border-border/40 shadow-sm bg-muted/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Library className="h-4 w-4 text-primary" />
                  Sources Authentiques
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Votre bibliothèque intègre l'intégralité des 6 grands recueils (Al-Kutub al-Sittah) et le Muwatta.
                </p>
                <div className="space-y-3">
                  {HADITH_BOOKS_INFO.map((book) => (
                    <div key={book.name} className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-foreground/80">{book.name}</span>
                        <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium">
                          {book.count}
                        </span>
                      </div>
                      <p className="text-[10px] text-muted-foreground italic">{book.description}</p>
                    </div>
                  ))}
                </div>
                <div className="pt-2 border-t border-border/40">
                  <p className="text-[10px] text-center text-muted-foreground font-medium">
                    Total: ~32,400 Hadiths
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/40 shadow-sm bg-emerald-50/30">
              <CardContent className="p-4">
                <div className="flex gap-3 items-start">
                  <Sparkles className="h-4 w-4 text-emerald-600 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-emerald-800">Agent Hikma</p>
                    <p className="text-[10px] text-emerald-700/80 mt-1 leading-relaxed">
                      Votre Assistant Hikma analyse ces sources en temps réel pour valider et expliquer les hadiths.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </aside>

          {/* Main Search Area */}
          <div className="flex-1 space-y-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un hadith, verset ou thème..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-12 rounded-xl shadow-sm border-border/60"
              />
            </div>

            <Tabs
              defaultValue="hadiths"
              className="w-full"
              onValueChange={setActiveTab}
            >
              <TabsList className="grid w-full grid-cols-3 h-12 bg-muted/50 p-1">
                <TabsTrigger value="hadiths" className="flex items-center gap-2 rounded-lg">
                  <BookMarked className="h-4 w-4" />
                  <span className="hidden sm:inline">Essentiels</span>
                  <span className="sm:hidden">Hadiths</span>
                </TabsTrigger>
                <TabsTrigger value="coran" className="flex items-center gap-2 rounded-lg">
                  <BookOpen className="h-4 w-4" />
                  Coran
                </TabsTrigger>
                <TabsTrigger value="nine_books" className="flex items-center gap-2 rounded-lg">
                  <Library className="h-4 w-4" />
                  9 Livres
                </TabsTrigger>
              </TabsList>

              <TabsContent value="hadiths">
                <ScrollArea className="h-[calc(100vh-340px)] mt-4">
                  <div className="space-y-3 pr-4">
                    {filteredHadiths.length === 0 ? (
                      <p className="text-center text-muted-foreground py-12">Aucun hadith trouvé.</p>
                    ) : (
                      filteredHadiths.map((hadith, i) => (
                        <Card key={i} className="border-border/50 hover:border-primary/30 transition-colors shadow-sm">
                          <CardContent className="p-4">
                            <p className="text-sm leading-relaxed text-foreground/90">{hadith.content}</p>
                            <p className="text-xs text-primary/80 mt-3 font-semibold italic flex items-center gap-2">
                              <Sparkles className="h-3 w-3" />
                              — {hadith.source}
                            </p>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="coran">
                <ScrollArea className="h-[calc(100vh-340px)] mt-4">
                  <div className="space-y-3 pr-4">
                    {filteredVersets.length === 0 ? (
                      <p className="text-center text-muted-foreground py-12">Aucun verset trouvé.</p>
                    ) : (
                      filteredVersets.map((verset, i) => (
                        <Card key={i} className="border-border/50 hover:border-primary/30 transition-colors shadow-sm">
                          <CardContent className="p-4">
                            <p className="text-sm leading-relaxed text-foreground/90">{verset.content}</p>
                            <p className="text-xs text-primary/80 mt-3 font-semibold italic flex items-center gap-2">
                              <BookOpen className="h-3 w-3" />
                              — {verset.source}
                            </p>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="nine_books">
                <ScrollArea className="h-[calc(100vh-340px)] mt-4">
                  <div className="space-y-3 pr-4">
                    {search.length < 3 ? (
                      <div className="text-center py-12 space-y-3">
                        <Library className="h-12 w-12 text-muted-foreground/30 mx-auto" />
                        <p className="text-muted-foreground px-4">Entrez au moins 3 caractères pour explorer les recueils classiques.</p>

                        {/* Book icons for mobile/empty state */}
                        <div className="flex flex-wrap justify-center gap-2 mt-6 lg:hidden">
                          {HADITH_BOOKS_INFO.map(b => (
                            <span key={b.name} className="text-[10px] bg-muted px-2 py-1 rounded-md text-muted-foreground">
                              {b.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : isSearching ? (
                      <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-muted-foreground">Recherche dans les manuscrits...</p>
                      </div>
                    ) : detailedResults.length === 0 ? (
                      <p className="text-center text-muted-foreground py-12">Aucun résultat dans les 9 recueils.</p>
                    ) : (
                      detailedResults.map((hadith, i) => (
                        <Card key={i} className="border-border/50 hover:border-primary/30 transition-colors shadow-sm">
                          <CardContent className="p-4">
                            <p className="text-sm leading-relaxed text-foreground/90">{hadith.french}</p>
                            <div className="mt-4 flex items-center justify-between gap-4">
                              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                                {hadith.source}
                              </p>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-[10px] gap-1 text-primary hover:text-primary hover:bg-primary/10"
                                onClick={() => {
                                  window.location.href = `/studio?topic=${encodeURIComponent(hadith.french)}&category=recherche-ia`;
                                }}
                              >
                                <Sparkles className="h-3 w-3" />
                                ÉTUDIER AVEC L'AGENT
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { Share2, Copy, Check, MessageCircle, Instagram, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { growGarden } from '@/lib/garden';

export default function PartagerPage() {
  const [text, setText] = useState('');
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    if (!text.trim()) {
      toast({ title: 'Rien à copier', description: 'Entrez un texte à partager.', variant: 'destructive' });
      return;
    }
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast({ title: 'Copié !', description: 'Le texte a été copié dans le presse-papier.' });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async (platform?: string) => {
    const shareText = text.trim() || 'Découvrez HikmaClips - Sagesse islamique pour les réseaux sociaux !';

    if (platform === 'whatsapp') {
      window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
      growGarden('share');
      return;
    }

    if (navigator.share) {
      try {
        await navigator.share({ text: shareText });
        growGarden('share');
      } catch (e) {
        // User cancelled
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 pb-24">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center pt-6 pb-2">
          <h1 className="text-2xl font-bold text-hikma-gradient inline-block">Partager</h1>
          <p className="text-muted-foreground text-sm mt-1">Partagez la sagesse autour de vous</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Share2 className="h-5 w-5 text-primary" />
              Texte à partager
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Collez ici un hadith, un verset ou un conseil à partager..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={5}
            />

            <div className="grid grid-cols-2 gap-3">
              <Button onClick={handleCopy} variant="outline" className="flex items-center gap-2">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? 'Copié !' : 'Copier'}
              </Button>
              <Button onClick={() => handleShare()} className="flex items-center gap-2">
                <Share2 className="h-4 w-4" />
                Partager
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Partage rapide</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3">
              <Button
                variant="outline"
                className="flex items-center gap-3 justify-start h-14"
                onClick={() => handleShare('whatsapp')}
              >
                <MessageCircle className="h-5 w-5 text-green-500" />
                <div className="text-left">
                  <p className="font-medium">WhatsApp</p>
                  <p className="text-xs text-muted-foreground">Envoyer à un contact ou groupe</p>
                </div>
              </Button>
              <Button
                variant="outline"
                className="flex items-center gap-3 justify-start h-14"
                onClick={() => handleShare()}
              >
                <Share2 className="h-5 w-5 text-blue-500" />
                <div className="text-left">
                  <p className="font-medium">Autres apps</p>
                  <p className="text-xs text-muted-foreground">Instagram, Telegram, SMS...</p>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Download className="h-5 w-5 text-primary" />
              Partager l'application
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Faites découvrir HikmaClips à vos proches !
            </p>
            <Button
              className="w-full"
              onClick={() => handleShare()}
            >
              Inviter des amis
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

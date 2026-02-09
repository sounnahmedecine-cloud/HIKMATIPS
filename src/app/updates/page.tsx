'use client';

import { UpdatesSection } from '@/components/UpdatesSection';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function UpdatesPage() {
    return (
        <div className="min-h-screen bg-background bg-islamic-pattern">
            <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-primary/10">
                <div className="container mx-auto flex h-16 items-center justify-between px-4">
                    <Link href="/" className="flex items-center gap-2">
                        <Image
                            src="https://res.cloudinary.com/db2ljqpdt/image/upload/v1770580517/ChatGPT_Image_2_f%C3%A9vr._2026_23_43_44_qmfwbc_1_f4huf1.png"
                            alt="HikmaClips"
                            width={32}
                            height={32}
                            className="rounded-lg"
                        />
                        <span className="text-xl font-bold text-hikma-gradient">HikmaClips</span>
                    </Link>
                    <Link href="/">
                        <Button variant="ghost" className="gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            Retour
                        </Button>
                    </Link>
                </div>
            </nav>

            <main className="pt-24">
                <UpdatesSection />
            </main>
        </div>
    );
}

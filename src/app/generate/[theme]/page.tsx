import { GenerateClient } from "./GenerateClient"

const THEMES = [
    "foi",
    "patience",
    "effort",
    "famille",
    "sante",
    "repentir",
];

export function generateStaticParams() {
    return THEMES.map((theme) => ({
        theme,
    }));
}

export default function GeneratePage({ params }: { params: Promise<{ theme: string }> }) {
    return <GenerateClient params={params} />;
}

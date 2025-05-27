import type { Route } from "./+types/home";
import ChordPlayer from "./chord-player";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "my-chords" },
    { name: "description", content: "Welcome to my-chords!" },
  ];
}

export default function Home() {
  return <ChordPlayer />;
}

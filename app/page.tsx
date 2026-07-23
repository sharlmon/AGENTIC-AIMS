import Link from "next/link";

export default function Home() {
  return <main className="min-h-screen bg-[#FAFAF8] p-8 text-zinc-950"><Link className="text-sm font-semibold text-blue-600" href="/admin">Open Mission Control →</Link></main>;
}

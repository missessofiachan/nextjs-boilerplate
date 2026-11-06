import { Suspense } from "react";
import { notFound } from "next/navigation";
import PrototypeWorkspace from "../components/PrototypeWorkspace";
import { ALL_SCREEN_IDS, isValidScreenId, ScreenId, SCREEN_META } from "../data/prototype-data";

// shortcut: maps both /s1..s9 and semantic paths like /auth/login in one catch-all, split into separate route groups if distinct server layouts are needed later
const PATH_TO_SCREEN: Record<string, ScreenId> = Object.values(SCREEN_META).reduce(
  (acc, m) => {
    acc[m.id] = m.id;
    acc[m.semanticPath.replace(/^\//, "")] = m.id;
    return acc;
  },
  {} as Record<string, ScreenId>
);

export function generateStaticParams() {
  const params: { slug: string[] }[] = [];
  for (const id of ALL_SCREEN_IDS) {
    params.push({ slug: [id] });
    params.push({ slug: SCREEN_META[id].semanticPath.replace(/^\//, "").split("/") });
  }
  return params;
}

export default async function ScreenRoutePage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const joined = slug.join("/").toLowerCase();
  const screenId = isValidScreenId(joined) ? joined : PATH_TO_SCREEN[joined];

  if (!screenId) {
    notFound();
  }

  return (
    <Suspense fallback={<div style={{ padding: 20, color: "#F8FAFC" }}>Loading screen...</div>}>
      <PrototypeWorkspace initialScreen={screenId} />
    </Suspense>
  );
}

import { Suspense } from "react";
import PrototypeWorkspace from "./components/PrototypeWorkspace";

export default function HomePage() {
  return (
    <Suspense fallback={<div style={{ padding: 20, color: "#F8FAFC" }}>Loading prototype...</div>}>
      <PrototypeWorkspace initialScreen="s1" />
    </Suspense>
  );
}

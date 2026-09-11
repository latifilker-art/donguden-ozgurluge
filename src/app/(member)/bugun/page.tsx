import { AppBar } from "@/components/app-bar";
import { ScaffoldNotice } from "@/components/scaffold-notice";

export default function BugunPage() {
  return (
    <>
      <AppBar active="/bugun" />
      <ScaffoldNotice
        eyebrow="Bugün"
        title="Günlük özet"
        artifact="Sessiz Profil'deki Bugünün Ritmi"
        phase="Faz 4+"
      />
    </>
  );
}

import { AppBar } from "@/components/app-bar";
import { ScaffoldNotice } from "@/components/scaffold-notice";

export default function ProgramlarPage() {
  return (
    <>
      <AppBar active="/programlar" />
      <ScaffoldNotice
        eyebrow="Programlar"
        title="Harici çalışma kataloğu"
        artifact="Sessiz Profil'deki Harici Çalışmalar"
        phase="Faz 4+"
      />
    </>
  );
}

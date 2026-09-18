import { notFound } from "next/navigation";
import Link from "next/link";
import { AppBar } from "@/components/app-bar";
import { ColorAnalysisReportView } from "@/components/color-analysis-report";
import { createClient } from "@/lib/supabase/server";

export default async function RenkAnaliziDetayPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data } = await supabase
    .from("color_analyses")
    .select("id, full_name, birth_date, report, pdf_path")
    .eq("id", id)
    .single();

  if (!data) notFound();

  let pdfUrl: string | null = null;
  if (data.pdf_path) {
    const { data: signed } = await supabase.storage
      .from("work-results")
      .createSignedUrl(data.pdf_path, 60 * 10);
    pdfUrl = signed?.signedUrl ?? null;
  }

  const report = data.report as { sections: { title: string; body: string }[] };

  return (
    <>
      <AppBar />
      <div className="mx-auto max-w-2xl px-7 py-8">
        <p className="mb-5 text-xs text-ink-faint">
          <Link href="/panel/renk-analizi" className="hover:underline">
            Renk Analizi
          </Link>{" "}
          / <span className="font-medium text-ink-soft">{data.full_name}</span>
        </p>
        <div className="mb-6 flex items-baseline justify-between">
          <h1 className="font-display text-[25px]">{data.full_name}</h1>
          {pdfUrl && (
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-brand hover:underline"
            >
              PDF İndir ↗
            </a>
          )}
        </div>

        <ColorAnalysisReportView fullName={data.full_name} sections={report.sections} />
      </div>
    </>
  );
}

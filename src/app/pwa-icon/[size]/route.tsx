import { ImageResponse } from "next/og";

// Uygulama ikonu: marka yeşili üzerinde altın halka + nokta (döngü motifi).
export async function GET(
  req: Request,
  { params }: { params: Promise<{ size: string }> },
) {
  const { size } = await params;
  const px = Math.min(Math.max(parseInt(size, 10) || 512, 64), 1024);
  const maskable = new URL(req.url).searchParams.has("maskable");
  const ring = px * (maskable ? 0.36 : 0.46);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #3f6f5e 0%, #2d5446 100%)",
        }}
      >
        <div
          style={{
            width: ring,
            height: ring,
            borderRadius: "50%",
            border: `${px * 0.045}px solid #d9b25f`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: ring * 0.3,
              height: ring * 0.3,
              borderRadius: "50%",
              background: "#f4f8f5",
            }}
          />
        </div>
      </div>
    ),
    { width: px, height: px },
  );
}

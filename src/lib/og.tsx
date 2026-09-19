import { ImageResponse } from "next/og";

export const ogSize = { width: 1200, height: 630 };
export const ogContentType = "image/png";

type OgCardProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  image?: string;
};

export function ogImage({ eyebrow = "Stayora", title, subtitle, image }: OgCardProps) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          backgroundColor: "#FFF8F4",
          color: "#1F1F1F",
          fontFamily: "Georgia, 'Times New Roman', serif",
        }}
      >
        {image ? (
          <img
            src={image}
            alt=""
            width={1200}
            height={630}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        ) : (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(circle at 18% 20%, rgba(255,56,92,0.18), transparent 42%), radial-gradient(circle at 88% 80%, rgba(255,56,92,0.12), transparent 40%)",
            }}
          />
        )}
        {image ? (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(180deg, rgba(20,16,14,0.18) 0%, rgba(20,16,14,0.72) 70%, rgba(20,16,14,0.88) 100%)",
            }}
          />
        ) : null}
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "64px 72px",
            width: "100%",
            height: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              color: image ? "#FFFFFF" : "#FF385C",
              fontSize: 28,
              fontWeight: 700,
              letterSpacing: 4,
              textTransform: "uppercase",
              fontFamily: "sans-serif",
            }}
          >
            <div
              style={{
                width: 18,
                height: 18,
                borderRadius: 18,
                backgroundColor: "#FF385C",
              }}
            />
            {eyebrow}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 980 }}>
            <div
              style={{
                fontSize: title.length > 42 ? 56 : 68,
                lineHeight: 1.08,
                fontWeight: 600,
                color: image ? "#FFFFFF" : "#1F1F1F",
                letterSpacing: -1.5,
              }}
            >
              {title}
            </div>
            {subtitle ? (
              <div
                style={{
                  fontSize: 28,
                  lineHeight: 1.35,
                  color: image ? "rgba(255,255,255,0.86)" : "#5C534C",
                  fontFamily: "sans-serif",
                  maxWidth: 860,
                }}
              >
                {subtitle}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    ),
    { ...ogSize },
  );
}

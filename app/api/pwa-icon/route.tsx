import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const size = parseInt(req.nextUrl.searchParams.get("size") ?? "192");
  const radius = Math.round(size * 0.22);
  const fontSize = Math.round(size * 0.52);

  return new ImageResponse(
    {
      type: "div",
      props: {
        style: {
          background: "linear-gradient(135deg, #d97706, #f59e0b)",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: `${radius}px`,
        },
        children: {
          type: "div",
          props: {
            style: {
              color: "white",
              fontSize,
              fontWeight: 900,
              fontFamily: "serif",
              lineHeight: 1,
            },
            children: "R",
          },
        },
      },
    },
    { width: size, height: size }
  );
}

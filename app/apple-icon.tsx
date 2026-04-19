import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
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
          borderRadius: "40px",
        },
        children: {
          type: "div",
          props: {
            style: {
              color: "white",
              fontSize: 96,
              fontWeight: 900,
              fontFamily: "serif",
              lineHeight: 1,
            },
            children: "R",
          },
        },
      },
    },
    { ...size }
  );
}

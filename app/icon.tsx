import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    {
      type: "div",
      key: null,
      props: {
        style: {
          background: "linear-gradient(135deg, #d97706, #f59e0b)",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "6px",
        },
        children: {
          type: "div",
          key: null,
          props: {
            style: {
              color: "white",
              fontSize: 20,
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

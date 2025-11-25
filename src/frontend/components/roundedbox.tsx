import React from "react";
import { Box, xcss, Heading } from "@forge/react";

type BorderColor = Parameters<typeof xcss>[0]["borderColor"];

export const CustomBox = ({
  children,
  borderColor,
  title,
}: {
  children: React.ReactNode;
  borderColor?: BorderColor;
  title?: string | null;
}) => {
  return (
    <Box
      xcss={{
        borderRadius: "border.radius",
        borderStyle: "solid",
        borderWidth: "border.width",
        borderColor: borderColor || "color.border.discovery",
        padding: "space.200",
      }}
    >
      {title && title !== "" && <Heading size="small">{title}</Heading>}
      {children}
    </Box>
  );
};

export const YellowBox = ({ children, title }: { children: React.ReactNode; title?: string | null }) => {
  return <CustomBox borderColor="color.border.accent.yellow" children={children} title={title || null} />;
};

export const BlueBox = ({ children, title }: { children: React.ReactNode; title?: string | null }) => {
  return <CustomBox borderColor="color.border.accent.blue" children={children} title={title || null} />;
};

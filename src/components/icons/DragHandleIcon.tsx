import React from "react";

export const DragHandleIcon = (props: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      width={props.width ?? 20}
      height={props.height ?? 20}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontSize="9" fill="currentColor" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
        Dra
      </text>
    </svg>
  );
};

export default DragHandleIcon;

export interface Style {
    left?: number;
    right?: number;
    top?: number;
    bottom?: number;
    width?: number | "auto";
    height?: number | "auto";
    zIndex?: number;
    verticalAlign?: "top" | "middle" | "bottom";
    horizontalAlign?: "left" | "middle" | "right";
    background?: string;
}

export type ComputedStyleExclude = "verticalAlign" | "horizontalAlign" | "right" | "bottom" | "background"

export type Radius = number | [number, number, number, number];
export type ImgStyle = Style & {
    radius?: Radius
}
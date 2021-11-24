import {Style, ComputedStyleExclude} from "./types";
import {assign} from "@mxssfd/ts-utils";
import MergeImg from "./index";

let id = 0;

export abstract class Node {
    id!: number;
    computedStyle!: { width: number; height: number } & Required<Omit<Style, ComputedStyleExclude>>;
    auto!: {
        width: number;
        height: number;
    };
    public style: Style = {};

    protected constructor(public parent: Node|MergeImg) {
        this.id = id++;
    }

    setStyle(style: Style) {
        assign(this.style, style);
        this.computeStyle();
    }

    get root(): MergeImg {
        const parent = this.parent;
        if (parent instanceof MergeImg) {
            return parent;
        }
        return (this.parent as Node).root;
    }

    get ctx() {
        return this.parent?.ctx;
    }

    render() {
        this.renderBackGround();
        this._render();
    }

    protected renderBackGround() {
        const {background} = this.style;
        if (!background) return;
        this.ctx.fillStyle = background;
        const {left, top, width, height} = this.computedStyle;
        this.ctx.fillRect(left, top, width, height);
    }

    protected computeStyle() {
        const {
            left,
            top,
            right,
            bottom,
            width,
            height,
            horizontalAlign,
            verticalAlign,
            zIndex
        } = this.style;
        let dw: number;
        let dh: number;
        let x: number = 0;
        let y: number = 0;

        const parent = this.parent;
        const {width: w, height: h} = parent instanceof MergeImg ? parent : parent.computedStyle;

        dw = width as number || w;
        dh = height as number || h;

        // 1.如果设定了宽高，则以设定的宽高为准
        // 2.如果设定了left和right，宽=canvas宽 - left - right
        // 3.如果设定了top和bottom，高=canvas高 - top - bottom
        // 5.如果设定了left和right，没有设定top和bottom，也没设定size，则高按比例
        // 6.如果设定了top和bottom，没有设定left和right，也没设定size，则宽按比例

        if (left !== undefined && right !== undefined) {
            x = left;
            if (width === undefined) {
                dw = w - right - left;
            }
        } else {
            if (left !== undefined) {
                x = left;
            } else if (right !== undefined) {
                x = w - right - dw;
            }
        }

        if (top !== undefined && bottom !== undefined) {
            y = top;
            if (height === undefined) {
                dh = h - top - bottom;
            }
        } else if (top !== undefined) {
            y = top;
        } else if (bottom !== undefined) {
            y = h - bottom - dh;
        }

        if (width === "auto") {
            dw = this.auto.width;
        }
        if (height === "auto") {
            dh = this.auto.height;
        }

        if ((left === undefined || right === undefined) && horizontalAlign) {
            switch (horizontalAlign) {
                case "left":
                    x = 0;
                    break;
                case "middle":
                    x = ~~((w - dw) / 2);
                    break;
                case "right":
                    x = w - dw;
            }
        }

        if ((top === undefined || bottom === undefined) && verticalAlign) {
            switch (verticalAlign) {
                case "top":
                    y = 0;
                    break;
                case "middle":
                    y = ~~((h - dh) / 2);
                    break;
                case "bottom":
                    y = h - dh;
            }
        }

        if (!(parent instanceof MergeImg)) {
            const parentStyle = parent.computedStyle;
            x += parentStyle.left;
            y += parentStyle.top;
        }

        this.computedStyle = {
            width: dw,
            height: dh,
            zIndex: zIndex || 0,
            left: x,
            top: y
        };
    }

    protected abstract _render();
}
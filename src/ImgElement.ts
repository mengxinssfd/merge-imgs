import {ImgStyle} from "./types";
import {Layer} from "./Layer";
import {Node} from "./Node";


export class ImgElement extends Node {
    declare public style: ImgStyle;

    constructor(parent: Layer, style: ImgStyle, public content: HTMLImageElement) {
        super(parent);
        const img = content;
        const {
            width,
            height
        } = style;
        let dw = width as number || img.width;
        let dh = height as number || img.height;

        if (width === "auto") {
            dw = ((dh / img.height) || 1) * img.width;
        }
        if (height === "auto") {
            dh = ((dw / img.width) || 1) * img.height;
        }

        this.auto = {
            width: dw,
            height: dh
        };
        this.setStyle(style);
    }


    protected _render() {
        if (!this.ctx) throw new Error();
        const ctx = this.ctx;
        const s = this.computedStyle;
        ctx.drawImage(this.content, s.left, s.top, s.width, s.height);
    }
}
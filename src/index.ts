import {assign, createElement, insertToArray, loadImg} from "@mxssfd/ts-utils";
import {Layer} from "./Layer";
import {Style} from "./types";

export default class MergeImgs {
    private _ctx?: CanvasRenderingContext2D;
    private canvas?: HTMLCanvasElement;
    private readonly parent: Element;
    private layers: Layer[] = [];

    /**
     * @param [width=0]
     * @param [height=0]
     */
    constructor(readonly width = 0, readonly height = 0) {
        const parent = document.body;
        const canvas = createElement("canvas", {
            props: {
                style: {
                    height: height + "px",
                    width: width + "px",
                    // position: "fixed",
                    // left: "-10000px",
                    display: "none"
                },
                width,
                height
            },
            parent
        });
        this.canvas = canvas;
        this.parent = parent;
        this._ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
        parent.appendChild(canvas);
        this.addLayer();
    }

    add(layer: Layer) {
        layer.style.zIndex = layer.style.zIndex ?? 0;
        const list = this.layers;
        if (!list.length) {
            list.push(layer);
        } else {
            insertToArray(layer, (v, k) => {
                return v.style.zIndex! <= layer.style.zIndex! || k === 0;
            }, list, {after: true, reverse: true});
        }
        return layer;
    }

    addLayer(style?: Style) {
        const layer = new Layer(this, assign({width: this.width, height: this.height}, style));
        return this.add(layer);
    }

    get ctx(): CanvasRenderingContext2D | void {
        return this._ctx;
    }

    // 根据背景图创建一个MergeImg类 好处是可以根据背景图宽高设置canvas宽高，不用再额外设置
    static async createWithBg(url: string, crossOrigin: string | null = "anonymous"): Promise<MergeImgs> {
        // 如果图片crossOrigin不支持anonymous的话，也不支持导出图片，不过可以显示出canvas手动保存
        const promise = loadImg(url, {crossOrigin});
        const img = await promise;
        const mi = new MergeImgs(img.width, img.height);
        await mi.addLayer().addImg(promise);
        return mi;
    }

    render() {
        console.count("render count");
        this.clear();
        this.layers.forEach(layer => {
            layer.render();
        });
    }

    clear() {
        this._ctx!.clearRect(0, 0, this.width, this.height);
    }

    // base64
    toDataURL(type = "image/png", quality?: any): string {
        if (!this.canvas) throw new Error();
        return this.canvas.toDataURL(type, quality);
    }

    // ie10不支持canvas.toBlob
    toBlob(type = "image/png", quality?: any): Promise<Blob> {
        const canvas = this.canvas;
        if (!canvas) throw new Error();
        return new Promise<Blob>((resolve, reject) => {
            // canvas.toBlob ie10
            canvas.toBlob((blob) => {
                blob ? resolve(blob) : reject(blob);
            }, type, quality);
        });
    }

    // todo 可以作用于单个图片
    async drawRoundRect(r: number) {
        const img = await loadImg(this.toDataURL());
        const ctx = this.ctx as CanvasRenderingContext2D;
        this.clear();
        // 不能缩放图片
        const pattern = ctx.createPattern(img, "no-repeat") as CanvasPattern;
        const x = 0;
        const y = 0;
        const w = this.width;
        const h = this.height;
        if (w < 2 * r) r = w / 2;
        if (h < 2 * r) r = h / 2;
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
        ctx.closePath();
        // ctx.drawImage(img, x, y, w, h);

        // 如果要绘制一个圆，使用下面代码
        // context.arc(obj.width / 2, obj.height / 2, Math.max(obj.width, obj.height) / 2, 0, 2 * Math.PI);
        // 这里使用圆角矩形

        // 填充绘制的圆
        ctx.fillStyle = pattern;
        ctx.fill();
    }

    destroy() {
        if (!this.canvas) throw new Error("destroyed");
        this._ctx = undefined;
        this.layers = [];
        this.parent.removeChild(this.canvas);
        this.canvas = undefined;

    }

    loadImg(url: string, props?: Partial<HTMLImageElement>) {
        return loadImg(url, props)
    }
}
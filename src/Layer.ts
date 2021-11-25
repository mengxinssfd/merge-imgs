import {arrayRemoveItem, insertToArray, isImgElement, isNumber, isPromiseLike, loadImg} from "@mxssfd/ts-utils";
import {Node} from "./Node";
import {ImgStyle, Style} from "./types";
import {ImgElement} from "./ImgElement";
import MergeImgs from "./index";

export class Layer extends Node {
    children: Node[] = [];

    constructor(parent: MergeImgs, public style: Style) {
        super(parent);
        this.setStyle(style);
    }

    add(el: Node) {
        el.style.zIndex = el.style.zIndex ?? 0;
        const list = this.children;
        if (!list.length) {
            return this.children.push(el);
        } else {
            return insertToArray(el, (v, k) => {
                return v.style.zIndex! <= el.style.zIndex! || k === 0;
            }, list, {after: true, reverse: true});
        }
    }

    async addImg(img: HTMLImageElement, style?: ImgStyle): Promise<ImgElement>
    async addImg(url: string, style?: ImgStyle): Promise<ImgElement>
    async addImg(promiseImg: Promise<HTMLImageElement>, style?: ImgStyle): Promise<ImgElement>
    async addImg(urlOrPromiseImg, style: ImgStyle = {}) {
        let img: HTMLImageElement;
        if (isImgElement(urlOrPromiseImg)) {
            img = urlOrPromiseImg;
        } else if (isPromiseLike(urlOrPromiseImg as Promise<HTMLImageElement>)) {
            img = await urlOrPromiseImg;
        } else {
            img = await loadImg(urlOrPromiseImg);
        }
        const item = new ImgElement(this, style, img);
        const layer = this;
        const index = layer.add(item);
        if (layer.children.length === 1) {
            this.render();
        } else if (index !== layer.children.length - 1) {
            this.root.render();
        } else {
            item.render();
        }

        return item;
    }

    protected _render() {
        this.children.forEach(child => child.render());
    }

    remove(el: ImgElement): ImgElement | void
    remove(index: number): ImgElement | void
    remove(value) {
        if (isNumber(value)) {
            return this.children.splice(value, 1)[0];
        }

        return arrayRemoveItem(value, this.children);
    }

    clear() {
        this.children = [];
    }
}
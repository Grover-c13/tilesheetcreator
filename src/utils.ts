import {TextureData} from "./CommonTypes";
import {SheetPos} from "./model/TileDef";

export function generateBackgroundStyleForTileTd(td: TextureData) {
    return {
        backgroundImage: `url(${td.spritesheet64})`,
        backgroundPositionX: -td.x * 16,
        backgroundPositionY: -td.y * 16,
    }
}

export function generateBackgroundStyleForTile(td: SheetPos, texture: string) {
    return {
        backgroundImage: `url(${texture})`,
        backgroundPositionX: -td.row * 16,
        backgroundPositionY: -td.column * 16,
    }
}

export function getPngDimensions(img: string) {
    if (img.length == 0) return {width: 0, height: 0}
    const base64 = img.split('data:image/png;base64,')[1]
    const header = window.atob(base64.slice(0, 50)).slice(16,24)
    const uint8 = Uint8Array.from(header, c => c.charCodeAt(0))
    const dataView = new DataView(uint8.buffer)

    return {
        width: dataView.getInt32(0),
        height: dataView.getInt32(4)
    }
}
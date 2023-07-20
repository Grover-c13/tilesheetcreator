import {TextureData} from "./CommonTypes";
import {SheetTexturePosition} from "./model/TileDef";

export function generateBackgroundStyleForTileTd(td: TextureData, imgBase64: string) {
    return {
        backgroundImage: `url(${imgBase64})`,
        backgroundPositionX: -td.x * 16,
        backgroundPositionY: -td.y * 16,
    }
}

export function generateBackgroundStyleForTile(td: SheetTexturePosition, imgBase64: string) {
    return {
        backgroundImage: `url(${imgBase64})`,
        backgroundPositionX: -td.col * 16,
        backgroundPositionY: -td.row * 16,
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

export function areSheetPosEquals(a: SheetTexturePosition, b: SheetTexturePosition) {
    return a.row === b.row && a.col === b.col && a.sheetId === b.sheetId;
}
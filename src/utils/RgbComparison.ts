import { SheetTexturePosition } from "../model/TileDef";

type RGB = {r: number, g: number, b: number}
export function getRgb(base64url: string, points: {x: number, y: number}[]): Promise<RGB[]> {
    const canvas = document.getElementById("rgb") as HTMLCanvasElement
    const context = canvas.getContext('2d');
    
    const i = new Image();
    i.src = base64url;

    return new Promise<RGB[]>((res, rej) => {
        i.onload = () => {
            context.drawImage(i, 0,0);
    
            res(points.map(p => {
                const pixel = context.getImageData(p.x, p.y, 1, 1)
                return {r: pixel.data[0], g: pixel.data[1], b: pixel.data[2]}
            }))
        }    
    })
}

type PixelBorders = { top: RGB[], left: RGB[], right: RGB[], bottom: RGB[] }
export async function getTilePixelBorders(textures: string[], tileTextures: SheetTexturePosition[]): Promise<PixelBorders[]> {
    type PosAdder = (x: number, offset: number) => number
    const getPixelsInLineForTileTexture = async (tileTexture: SheetTexturePosition, xAdder: PosAdder, yAdder: PosAdder): Promise<RGB[]> => {
        const originX = tileTexture.col*16
        const originY = tileTexture.row*16
        const positions = [...Array(16).keys()].map(offset => {
            return {x: xAdder(originX, offset), y: yAdder(originY, offset)}
        })

        return await getRgb(textures[tileTexture.sheetId], positions)
    }

    return Promise.all(tileTextures.map(async t => {
        const top = await getPixelsInLineForTileTexture(t, (x, offset) => x+offset, (y, offset) => y)
        const bottom = await getPixelsInLineForTileTexture(t, (x, offset) => x+offset, (y, offset) => y+15)
        const left = await getPixelsInLineForTileTexture(t, (x, offset) => x, (y, offset) => y+offset)
        const right = await getPixelsInLineForTileTexture(t, (x, offset) => x+15, (y, offset) => y+offset)

        return {
            top,
            left,
            bottom,
            right
        } as PixelBorders
    }))
}

type BorderComparison = { top: boolean, left: boolean, right: boolean, bottom: boolean}
const THRESHOLD = 10
export function compareTextureBorders(a: PixelBorders, b: PixelBorders): BorderComparison {
    return {
        top: comparePixelArrays(a.top, b.bottom) >= THRESHOLD,
        left: comparePixelArrays(a.left, b.right) >= THRESHOLD,
        right: comparePixelArrays(a.right, b.left) >= THRESHOLD,
        bottom: comparePixelArrays(a.bottom, b.top) >= THRESHOLD
    } as BorderComparison
}

function comparePixelArrays(a: RGB[], b: RGB[]) {
    const getNPixelsAroundIndex = (arr: RGB[], index: number): RGB[] => arr.slice(Math.max(0, index - 2), Math.min(arr.length-1, index + 2))

    let leftCount = 0
    for (let i = 0; i < a.length; i++) {
        for (const pixelAround of getNPixelsAroundIndex(b, i)) {
            if (a[i].r === pixelAround.r && a[i].g === pixelAround.g && a[i].b === pixelAround.b) {
                leftCount++
                break;
            }
        }
    }

    let rightCount = 0
    for (let i = 0; i < b.length; i++) {
        for (const pixelAround of getNPixelsAroundIndex(a, i)) {
            if (b[i].r === pixelAround.r && b[i].g === pixelAround.g && b[i].b === pixelAround.b) {
                rightCount++
                break;
            }
        }
    }

    console.log(leftCount, rightCount)
    return Math.min(leftCount, rightCount)
}

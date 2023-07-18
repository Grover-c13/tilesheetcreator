export type TileType = 'ANIMATED' | 'STATIC' | 'RANDOM' | 'STATEFUL';
export type TileDef = {
    tileId: string,
    name: string,
    textures: SheetTexturePosition[]
    tileType: TileType
}

export type StatefulTileDef = TileDef & {
    tileType: 'STATEFUL'
    textures: (SheetTexturePosition & {state: string})[]
}

export type AnimatedTileDef = TileDef & {
    tileType: 'ANIMATED'
}


export type RandomTileDef = TileDef & {
    tileType: 'RANDOM',
    textures: (SheetTexturePosition & {weight: number})[]
}


export type SheetTexturePosition = {
    sheetId: number,
    row: number,
    column: number
}

export type TilePlacementConstraint = {
    sourceTileId: string,
    constraintTileId: string,
    relativeX: number,
    relativeY: number,
    relativeLayer: number
}
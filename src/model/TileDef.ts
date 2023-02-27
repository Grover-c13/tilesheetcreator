export type TileType = 'ANIMATED' | 'STATIC' | 'RANDOM' | 'STATEFUL';
export type TileDef = {
    tileId: string,
    name: string,
    textures: SheetPos[]
    tileType: TileType

}

export type StatefulTileDef = TileDef & {
    tileType: 'STATEFUL'
    textures: (SheetPos & {state: string})[]
}

export type AnimatedTileDef = TileDef & {
    tileType: 'ANIMATED'
}


export type RandomTileDef = TileDef & {
    tileType: 'RANDOM',
    textures: (SheetPos & {weight: number})[]
}


export type SheetPos = {
    sheetId: number,
    row: number,
    column: number
}

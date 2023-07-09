import {configureStore, createSlice, PayloadAction} from "@reduxjs/toolkit";
import {SheetTexturePosition, TileDef} from "../model/TileDef";
import {loadState, saveState} from "./persist";


export interface TilesetState {
    selectedTextures: SheetTexturePosition[],
    tileSelectedId: string,
    textures: string[],
    nextTileId: number,
    tiles: { [key: string]: TileDef }
}

const blankState: TilesetState = {
    selectedTextures: [],
    tileSelectedId: undefined,
    textures: [],
    nextTileId: 1,
    tiles: {},
}

const initialState: TilesetState = {
    ...blankState,
    ...loadState(),
}

export const tileset = createSlice({
    name: 'tileset',
    initialState,
    reducers: {
        addTileDef: (state, action: PayloadAction<TileDef>) => {
            state.tiles = {...state.tiles, [action.payload.tileId]: action.payload}
            state.nextTileId += 1
        },
        addTexture: (state, texture: PayloadAction<string>) => {
            state.textures = [...state.textures, texture.payload]
        },
        setTileForEdit: (state, tile: PayloadAction<TileDef>) => {
            state.tileSelectedId = tile.payload?.tileId
        },
        deleteTile: (state, tile: PayloadAction<TileDef>) => {
            delete state.tiles[tile.payload.tileId]
            if (state.tileSelectedId === tile.payload.tileId) state.tileSelectedId = undefined
        },
        updateTile: (state, action: PayloadAction<TileDef>) => {
            state.tiles[action.payload.tileId] = action.payload
        },
        clearTiles: (state) => {
            state.tiles = {}
            state.tileSelectedId = undefined
            state.nextTileId = 1
        },
        reset: () => {
            return blankState
        },
        updateTexture: (state, action: PayloadAction<{tileId: string, textureId: number, texture: SheetTexturePosition}>) => {
            state.tiles[action.payload.tileId].textures[action.payload.textureId] = action.payload.texture
        },
        selectTextures: (state, action: PayloadAction<SheetTexturePosition[]>) => {
            state.selectedTextures = action.payload
        }
    },
})

export const store = configureStore({
    reducer: tileset.reducer
});

store.subscribe(() => {
    saveState(store.getState());
});

export const { deleteTile, addTileDef, addTexture, setTileForEdit, updateTile, clearTiles, reset, updateTexture, selectTextures } = tileset.actions
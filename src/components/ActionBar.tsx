import React from "react";
import {useDispatch, useSelector} from "react-redux";
import {addConstraint, addTileDef, clearTiles, reset, TilesetState} from "../state";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
    faDownload,
    faEraser,
    faLayerGroup,
    IconDefinition,
    faTrash,
    faCircleNodes,
    faAmbulance
} from '@fortawesome/free-solid-svg-icons'
import { SheetTexturePosition, TileDef, TilePlacementConstraint } from "../model/TileDef";
import { compareTextureBorders, getRgb, getTilePixelBorders } from "../utils/RgbComparison";



export const ActionBar = (props: {className: string}) => {
    const dispatch = useDispatch()
    const state = useSelector((state: TilesetState) => state)

    const addTileWithTextures = () => {
        const id = (state.nextTileId).toString()
        dispatch(addTileDef({
            tileId: id,
            name: id,
            tileType: "STATIC",
            textures: [
                ...state.selectedTextures
            ]
        }))
    }

    const addTilesWithContraints = () => {
        const currentAvailableId = state.nextTileId
        let localTiledId = 0
        const positionLookup: { [key: string]: TileDef }  = {}
        const tiles = [...state.selectedTextures].sort((a, b) => {
            if (a.row == b.row) {
                return a.col - b.col
            } else {
                return a.row - b.row
            }
        }).map(texture => {
            const id = (currentAvailableId+(localTiledId++)).toString()
            const tile = {
                tileId: id,
                name: id,
                tileType: "STATIC",
                textures: [
                    texture
                ]
            } as TileDef
            positionLookup[`${texture.col}_${texture.row}`] = tile
            dispatch(addTileDef(tile))
            return tile
        })

        // constraints
        for (const tile of tiles) {
            const texture = tile.textures[0]
            const topPos = `${texture.col}_${texture.row-1}`
            const rightPos = `${texture.col+1}_${texture.row}`
            if (topPos in positionLookup) {
                const topTileId = positionLookup[topPos].tileId
                dispatch(addConstraint({
                    sourceTileId: tile.tileId,
                    constraintTileId: topTileId,
                    relativeX: 0,
                    relativeY: 1,
                    relativeLayer: 0
                }))
            }        
            
            if (rightPos in positionLookup) {
                const rightTileId = positionLookup[rightPos].tileId
                dispatch(addConstraint({
                    sourceTileId: tile.tileId,
                    constraintTileId: rightTileId,
                    relativeX: 1,
                    relativeY: 0,
                    relativeLayer: 0
                }))
            }        
        }

    }

    const magic = async () => {
        const selected = state.selectedTextures
        const borders = await getTilePixelBorders(state.textures, selected)


        // fine tiles that share alternative textures
        const tilesWithSameTextures: SheetTexturePosition[][] = []
        const texturestToSkip = new Set<number>()
        for (const aIdx in borders) {
            if (texturestToSkip.has(Number(aIdx))) continue
            if (!(aIdx in tilesWithSameTextures)) {
                tilesWithSameTextures[aIdx] = [selected[aIdx]]
            }

            for (const bIdx in borders.slice(Number(aIdx)+1)) {
                const offsetBIdx = Number(aIdx)+Number(bIdx)+1
                const a = borders[aIdx]
                const b = borders[offsetBIdx]
                const compare = compareTextureBorders(a, b)
                console.log(compare)

                //if (compare.bottom && compare.top && compare.left && compare.right) {
                //    tilesWithSameTextures[aIdx].push(selected[offsetBIdx])  
                //    texturestToSkip.add(offsetBIdx)
                //}
            }
        }

        let tiles = 0
        let tileIds: string[] = Array(tilesWithSameTextures.length)
        for (const tIdx in tilesWithSameTextures) {
            const textures = tilesWithSameTextures[tIdx]
            const id = (state.nextTileId+tiles++).toString()
            dispatch(addTileDef({
                tileId: id,
                name: id,
                tileType: "STATIC",
                textures: textures
            }))
            tileIds[tIdx] = id
        }

        for (const aIdx in tilesWithSameTextures) {
            for (const bIdx in tilesWithSameTextures) {
                const compare = compareTextureBorders(borders[aIdx], borders[bIdx])
                console.log(tileIds[aIdx], tileIds[bIdx], compare)
                if (compare.right) {
                    dispatch(addConstraint({
                        sourceTileId: tileIds[aIdx],
                        constraintTileId: tileIds[bIdx],
                        relativeX: 1,
                        relativeY: 0,
                        relativeLayer: 0
                    }))
                }

                if (compare.top) {
                    dispatch(addConstraint({
                        sourceTileId: tileIds[aIdx],
                        constraintTileId: tileIds[bIdx],
                        relativeX: 0,
                        relativeY: 1,
                        relativeLayer: 0
                    }))
                }
            }
        }

    }

    return (
        <div className={props.className}>
            <IoButton onClick={() => download(state)} icon={faDownload} tooltip="Export Json" />
            <ActionButton onClick={() => addTileWithTextures()} icon={faLayerGroup} tooltip="Add selected textures as one tile" />
            <ActionButton onClick={() => addTilesWithContraints()} icon={faCircleNodes} tooltip="Add all textures as tiles constrainted relative to the texture position" />
            <ActionButton onClick={() => magic()} icon={faAmbulance} tooltip="magic constraints" />
            <DangerButton onClick={() => dispatch(clearTiles())} icon={faEraser} tooltip="Remove all tiles" />
            <DangerButton onClick={() => dispatch(reset())} icon={faTrash} tooltip="Reset the project" />
        </div>
    );
}

function download(state: TilesetState) {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
    const anchorEleement = document.createElement('a');
    anchorEleement.setAttribute("href", dataStr);
    anchorEleement.setAttribute("download", "tileset.json");
    anchorEleement.click();
    anchorEleement.remove();
}


export const IoButton = (props: {onClick: () => void, icon: IconDefinition, tooltip: string}) => {
    return (
        <button
            className={"bg-green-500 hover:bg-green-700 text-white font-bold border border-green-700 rounded block p-2 mb-2 w-10 h-10"}
            onClick={() => props.onClick()}
            title={props.tooltip}
        >
            <FontAwesomeIcon icon={props.icon} />
        </button>
    )
}

export const ActionButton = (props: {onClick: () => void, icon: IconDefinition, tooltip: string}) => {
    return (
        <button
            className={"bg-blue-500 hover:bg-blue-700 text-white font-bold border border-blue-700 rounded block p-2 mb-2 w-10 h-10"}
            onClick={() => props.onClick()}
            title={props.tooltip}
        >
            <FontAwesomeIcon icon={props.icon} />
        </button>
    )
}

export const SmallActionButton = (props: {onClick: () => void, icon: IconDefinition, tooltip: string}) => {
    return (
        <button
            className={"bg-blue-500 hover:bg-blue-700 text-white font-bold border border-blue-700 rounded block w-6 h-6 inline-block"}
            onClick={() => props.onClick()}
            title={props.tooltip}
        >
            <FontAwesomeIcon icon={props.icon} size={"xs"}/>
        </button>
    )
}


export const DangerButton = (props: {onClick: () => void, icon: IconDefinition, tooltip: string}) => {
    return (
        <button
            className={"bg-red-500 hover:bg-red-700 text-white font-bold border border-red-700 rounded block p-2 mb-2 w-10 h-10"}
            onClick={() => props.onClick()}
            title={props.tooltip}
        >
            <FontAwesomeIcon icon={props.icon} />
        </button>
    )
}

export const SmallDangerButton = (props: {onClick: () => void, icon: IconDefinition, tooltip: string}) => {
    return (
        <button
            className={"bg-red-500 hover:bg-red-700 text-white font-bold border border-red-700 rounded block w-6 h-6 inline-block"}
            onClick={() => props.onClick()}
            title={props.tooltip}
        >
            <FontAwesomeIcon icon={props.icon} size={"xs"}/>
        </button>
    )
}


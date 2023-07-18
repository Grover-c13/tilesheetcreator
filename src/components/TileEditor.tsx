import React, {useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {deleteTile, TilesetState, updateTexture, updateTile} from "../state";
import {RandomTileDef, SheetTexturePosition, TileDef, TileType} from "../model/TileDef";
import {useDrop} from "react-dnd";
import {DragTypes, TextureData} from "../CommonTypes";
import {generateBackgroundStyleForTile} from "../utils";
import {DangerButton, SmallActionButton, SmallDangerButton} from "./ActionBar";
import {faChevronLeft, faChevronRight, faRotate, faTrash} from "@fortawesome/free-solid-svg-icons";
import {INPUT_STYLE, SELECTION_STYLE} from "./styles";
import {AnimatedTexture} from "./AnimatedTexture";
import { TileContraintEditor } from "./TileConstraintEditor";


export const TileEditor = () => {
    const dispatch = useDispatch()
    const state = useSelector((state: TilesetState) => state)
    const tileUnderEdit = state.tiles[state.tileSelectedId]
    if (!tileUnderEdit) return (<div className={"bg-gray-100 p-2 w-full h-full"} />)

    return (
        <div className={"bg-gray-100 p-2 w-full -h-full"}>
            <div>
                <div>Name</div>
                <div>
                    <input className={INPUT_STYLE} value={tileUnderEdit.name} onChange={(e) =>
                    dispatch(
                        updateTile({...tileUnderEdit, name: e.target.value})
                    )
                }/>
                </div>
            </div>

            <div>
                <div>Type</div>
                <div>
                    <select
                        className={INPUT_STYLE}
                        value={tileUnderEdit.tileType}
                        onChange={(e) => {
                            dispatch(
                                updateTile({...tileUnderEdit, tileType: e.target.value as TileType})
                            )
                        }

                        }
                    >
                        <option>STATIC</option>
                        <option>RANDOM</option>
                        <option>ANIMATED</option>
                        <option>STATEFUL</option>
                    </select>
                </div>
            </div>
            <br />
            <div>
                <TextureAdder />
            </div>

            <br />
            <div>
                <DangerButton onClick={() => dispatch(deleteTile(tileUnderEdit))} icon={faTrash} tooltip={"Remove Tile"}/>
            </div>
        </div>
    )
}

export const TextureAdder = () => {
    const dispatch = useDispatch()
    const state = useSelector((state: TilesetState) => state)
    const tile = state.tiles[state.tileSelectedId]
    const [selected, setSelected] = useState<number>(undefined)
    const updateTextures = (textures: SheetTexturePosition[]) => {
        dispatch(
            updateTile({...tile, textures: textures})
        )
    }

    const [, drop] = useDrop(() => ({
        accept: DragTypes.Texture,
        drop: (e: TextureData) => updateTextures([...tile.textures, {sheetId: e.textureId, row: e.x, column: e.y}]),
        collect: (monitor) => ({
            isOver: monitor.isOver(),
            canDrop: monitor.canDrop(),
        }),
    }), [tile])


    const mappedTiles = Object.entries(tile.textures).map(([key, it]) => {
        const extraClass = selected === parseInt(key) ? SELECTION_STYLE : ""
        return <div
            onClick={() => setSelected(parseInt(key))}
            key={`${tile.tileId}-${key}`}
            style={generateBackgroundStyleForTile(it, state.textures[it.sheetId])}
            className={"cursor-pointer w-[16px] h-[16px] inline-block " + extraClass}
        />
    });


    const isRandom = tile.tileType === "RANDOM"
    const textureAsRandom = isRandom && selected !== undefined && (tile as RandomTileDef).textures[selected]
    const totalRandomWeight = getSummedWeights(tile)

    return (
        <>
            <div>Textures <SmallDangerButton onClick={() => updateTextures([])} icon={faRotate} tooltip={"Clear textures"}/></div>
            <div className={"h-32 bg-[url('/static/tile-bg.png')]"} ref={drop}>
                {mappedTiles}
            </div>

            <SmallActionButton onClick={() => {
                if (selected === undefined) return;
                if (selected == 0) return;
                const copy = [...tile.textures]
                const valueAtTarget = copy[selected-1]
                const toMove = copy[selected]
                copy[selected] = valueAtTarget
                copy[selected-1] = toMove
                setSelected(selected-1)
                dispatch(
                    updateTile({...tile, textures: copy})
                )
            }} icon={faChevronLeft} tooltip={"Move Texture Left"}/>

            <SmallActionButton onClick={() => {
                if (selected === undefined) return;
                if (selected == tile.textures.length-1) return;
                const copy = [...tile.textures]
                const valueAtTarget = copy[selected+1]
                const toMove = copy[selected]
                copy[selected] = valueAtTarget
                copy[selected+1] = toMove
                setSelected(selected+1)
                dispatch(
                    updateTile({...tile, textures: copy})
                )
            }} icon={faChevronRight} tooltip={"Move Texture Right"}/>


            {tile.tileType === "RANDOM" && textureAsRandom &&
                <div>
                    <hr className={"mt-2"}/>
                    <div>Texture Settings - Random</div>
                    <div className={"text-sm"}>Texture Weight</div>
                    <div>
                        <input className={INPUT_STYLE} type="number" value={textureAsRandom.weight || 1} onChange={(e) => {
                            const newTexture = {...textureAsRandom, weight: parseInt(e.target.value)} as SheetTexturePosition
                            dispatch(updateTexture({tileId: tile.tileId, textureId: selected, texture: newTexture}))
                        }}/>
                    </div>
                    <div className={"text-sm"}>{textureAsRandom.weight} in {totalRandomWeight} chance for appearance.</div>
                    <hr className={"mt-2"}/>
                </div>
            }

            {tile.tileType === "ANIMATED" &&
                <div>
                    <hr className={"mt-2"}/>
                    <div>Texture Settings - Animated</div>
                    <div className={"text-sm"}>Animation Preview</div>
                    <AnimatedTexture textures={tile.textures} className={""}/>

                </div>
            }
            <hr className={"mt-2"}/>
            <TileContraintEditor tile={tile} />
        </>
    )
}

function getSummedWeights(tile: TileDef) {
    if (tile.tileType !== "RANDOM") return 0
    const def = tile as RandomTileDef
    return def.textures
        .map(it => (it as SheetTexturePosition & {weight: number}).weight || 1)
        .reduce((a, b) => a+b)
}
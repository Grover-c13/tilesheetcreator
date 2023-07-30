import {TileDef} from "../model/TileDef";
import {generateBackgroundStyleForTile} from "../utils";
import React from "react";
import {useDispatch, useSelector} from "react-redux";
import {setTileForEdit, TilesetState} from "../state";
import {SELECTION_STYLE} from "./styles";
import {AnimatedTexture} from "./AnimatedTexture";
import { useDrag } from "react-dnd";
import { DragTypes } from "../CommonTypes";

export const Tile = (props: {tileDef: TileDef, hideSelection: boolean, displayTileId: boolean}) => {
    const dispatch = useDispatch()
    const tileUnderEdit = useSelector((state: TilesetState) => state.tileSelectedId)
    const [, drag] = useDrag(() => ({
        type: DragTypes.Tile,
        item: props.tileDef,
    }))


    return (
        <div ref={drag} className={'inline-block m-2 cursor-pointer'} onClick={() => {
            if (tileUnderEdit === props.tileDef.tileId) {
                dispatch(setTileForEdit(undefined))
            } else {
                dispatch(setTileForEdit(props.tileDef))
            }
        }}>
            <div className={'inline-block m-2 cursor-pointer'}>
                <TileTexture tileDef={props.tileDef} hideSelection={props.hideSelection} />
            </div>
            {props.displayTileId && <div className={'text-center text-sm'}>{props.tileDef.name}</div>}
        </div>
    )
}

export const TileTexture = (props: {tileDef: TileDef, hideSelection: boolean}) => {
    const tileUnderEdit = useSelector((state: TilesetState) => state.tileSelectedId)
    const textures = useSelector((state: TilesetState) => state.textures)

    
    let selectedClass = tileUnderEdit === props.tileDef.tileId && !props.hideSelection ? SELECTION_STYLE : ''

    const staticTexture = textures[props.tileDef.textures[0].sheetId]
    const backgroundCss = props.tileDef.textures.length == 0 ? {} : generateBackgroundStyleForTile(props.tileDef.textures[Math.floor(Math.random()*props.tileDef.textures.length)], staticTexture)
    const isAnimated = props.tileDef.tileType === "ANIMATED"
    const textureElement = isAnimated
        ? <AnimatedTexture textures={props.tileDef.textures} className={selectedClass} />
        : <div style={backgroundCss} className={"w-[16px] h-[16px] " + selectedClass}/>
    return (
        <div className="inline-block">
                {textureElement}
        </div>
    )
}
import {TileDef} from "../model/TileDef";
import {generateBackgroundStyleForTile} from "../utils";
import React from "react";
import {useDispatch, useSelector} from "react-redux";
import {setTileForEdit, TilesetState} from "../state";
import {SELECTION_STYLE} from "./styles";
import {AnimatedTexture} from "./AnimatedTexture";

export const Tile = (props: {tileDef: TileDef, texture: string}) => {
    const dispatch = useDispatch()
    const tileUnderEdit = useSelector((state: TilesetState) => state.tileSelectedId)

    let selectedClass = tileUnderEdit === props.tileDef.tileId ? SELECTION_STYLE : ''

    const backgroundCss = props.tileDef.textures.length == 0 ? {} : generateBackgroundStyleForTile(props.tileDef.textures[0], props.texture)
    const isAnimated = props.tileDef.tileType === "ANIMATED"
    const textureElement = isAnimated
        ? <AnimatedTexture image={props.texture} textures={props.tileDef.textures} className={selectedClass} />
        : <div style={backgroundCss} className={"w-[16px] h-[16px] " + selectedClass}/>
    return (
        <div className={'inline-block m-2 cursor-pointer'} onClick={() => {
            if (tileUnderEdit === props.tileDef.tileId) {
                dispatch(setTileForEdit(undefined))
            } else {
                dispatch(setTileForEdit(props.tileDef))
            }
        }}>
            <div className='flex justify-center'>
                {textureElement}
            </div>
            <div className={'text-center text-sm'}>{props.tileDef.name}</div>
        </div>
    )
}
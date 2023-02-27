import React, {MouseEvent} from "react";
import {useDrag, useDrop} from "react-dnd";
import {DragTypes, TextureData} from "../CommonTypes";
import {NativeTypes} from "react-dnd-html5-backend";
import {generateBackgroundStyleForTileTd, getPngDimensions} from "../utils";
import {useDispatch, useSelector} from "react-redux";
import {addTexture, selectTextures, TilesetState} from "../state";
import {SELECTION_STYLE} from "./styles";

export const TileTextureSelector = (props: {className: string}) => {
    const tilesheet = useSelector((state: TilesetState) => state)
    const dispatch = useDispatch()

    const [, drop] = useDrop(
        () => ({
            accept: [NativeTypes.FILE],
            drop(item: DataTransfer) {
                let reader = new FileReader();
                reader.readAsDataURL(item.files[0]);
                reader.onload = async () => {
                    const texture = reader.result.toString()
                    dispatch(addTexture(texture))
                }
            }
        }),
        []
    )

    const tiles = []
    const texture = tilesheet.textures[0] || ""
    const dim = getPngDimensions(texture) || {width: 0, height: 0}
    for (let y = 0; y < Math.floor(dim.height/16); y++) {
        for (let x = 0; x < Math.floor(dim.width/16); x++) {
            tiles.push(<TileSelector key={`${x}_${y}`}
                                     x={x}
                                     y={y}
                                     spritesheet64={texture}
                                     selected={tilesheet.selectedTextures && tilesheet.selectedTextures.some((it) => it.row == x && it.column == y)}
                                     onclick={(e) => {
                                         if (e.ctrlKey) {
                                             dispatch(selectTextures([...tilesheet.selectedTextures, {sheetId: 0, row: x, column: y}]))
                                         } else {
                                             dispatch(selectTextures([{sheetId: 0, row: x, column: y}]))
                                         }

                                     }}
                />
            )
        }
    }

    const widthStyle = {
        width: (tiles.length == 0) ? 300 : dim.width,
    }
    return (
        <div className={props.className}>
            <div className={"mb-10"}>
                <div ref={drop} style={widthStyle} className={"bg-[url('/static/trans.png')] text-black font-bold drop-shadow-md bg-white"}>
                    {tiles.length == 0 && "Drag PNG sheet here."}
                    {tiles}
                </div>
            </div>
        </div>
    );
}

const TileSelector = (props: TextureData & {selected: boolean, onclick: (e: MouseEvent) => void}) => {
    const [, drag] = useDrag(() => ({
        type: DragTypes.Texture,
        item: { x: props.x, y: props.y, spritesheet64: props.spritesheet64 },
    }))

    const style = generateBackgroundStyleForTileTd(props)
    if (props.selected) {
        return (
            <div ref={drag} style={style} className={'w-4 h-4 inline-block ' + SELECTION_STYLE} onClick={(e) => props.onclick(e)}/>
        )
    }

    return (
        <div ref={drag} style={style} className={'w-4 h-4 inline-block'} onClick={(e) => props.onclick(e)}/>
    )
}


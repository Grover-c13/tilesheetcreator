import React, {MouseEvent} from "react";
import {useDrag, useDrop} from "react-dnd";
import {DragTypes, TextureData} from "../CommonTypes";
import {NativeTypes} from "react-dnd-html5-backend";
import {areSheetPosEquals, generateBackgroundStyleForTileTd, getPngDimensions} from "../utils";
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


    const selectors = []
    for (const textureIdx_ in tilesheet.textures) {
        const tiles = []
        const textureIdx = Number(textureIdx_)
        const texture = tilesheet.textures[textureIdx]
        const dim = getPngDimensions(texture) || {width: 0, height: 0}

        const widthStyle = {
            width: dim.width
        }

        for (let y = 0; y < Math.floor(dim.height/16); y++) {
            for (let x = 0; x < Math.floor(dim.width/16); x++) {
                tiles.push(
                        <TileSelector key={`${textureIdx}_${x}_${y}`}
                                            x={x}
                                            y={y}
                                            textureId={textureIdx}
                                            selected={tilesheet.selectedTextures && tilesheet.selectedTextures.some((it) => it.col == x && it.row == y && it.sheetId == textureIdx)}
                                            onclick={(e) => {
                                                const pos = {sheetId: textureIdx, col: x, row: y}
                                                if (e.ctrlKey || e.metaKey) {
                                                    if (tilesheet.selectedTextures.filter(p => areSheetPosEquals(p, pos)).length == 0) {
                                                        dispatch(selectTextures([...tilesheet.selectedTextures, {sheetId: textureIdx, col: x, row: y}]))
                                                    } else {
                                                        dispatch(selectTextures([...tilesheet.selectedTextures.filter(p => !areSheetPosEquals(p, pos))]))
                                                    }
                  
                                                } else {
                                                    dispatch(selectTextures([{sheetId: textureIdx, col: x, row: y}]))
                                                }
        
                                            }}
                        />
                )
            }
        }

        selectors.push(
            <div style={widthStyle} key={textureIdx}>
                {tiles}
            </div>
        )
    
    }


    return (
        <div className={props.className}>
            <div ref={drop} className={"bg-[url('/static/trans.png')] text-black font-bold drop-shadow-md bg-white mb-10"}>
                    {selectors}
                    Drop textures here
            </div>
        </div>
    );
}

const TileSelector = (props: TextureData & {selected: boolean, onclick: (e: MouseEvent) => void}) => {
    const textures = useSelector((state: TilesetState) => state.textures)
    const [, drag] = useDrag(() => ({
        type: DragTypes.Texture,
        item: { x: props.x, y: props.y, textureId: props.textureId },
    }))

    const style = generateBackgroundStyleForTileTd(props, textures[props.textureId])
    if (props.selected) {
        return (
            <div ref={drag} style={style} className={'w-4 h-4 inline-block ' + SELECTION_STYLE} onClick={(e) => props.onclick(e)}/>
        )
    }

    return (
        <div ref={drag} style={style} className={'w-4 h-4 inline-block'} onClick={(e) => props.onclick(e)}/>
    )
}


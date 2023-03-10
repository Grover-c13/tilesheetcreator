import React from "react";
import {DragTypes, TextureData} from "../CommonTypes";
import {useDrop} from "react-dnd";
import {useDispatch, useSelector} from "react-redux";
import {addTileDef, TilesetState} from "../state";
import {Tile} from "./Tile";


export const TileGrid = () => {
    const tilesheet = useSelector((state: TilesetState) => state)
    const dispatch = useDispatch()

    const [, drop] = useDrop(() => ({
        accept: DragTypes.Texture,
        drop: (e: TextureData) => {
            const id = (tilesheet.nextTileId).toString()
            dispatch(addTileDef({
                tileId: id,
                name: id,
                tileType: "STATIC",
                textures: [
                    {sheetId: 0, row: e.x, column: e.y}
                ]
            }))
        },
        collect: (monitor) => ({
            isOver: monitor.isOver(),
            canDrop: monitor.canDrop(),
        }),
    }), [tilesheet])

    const mappedTiles = Object.values(tilesheet.tiles).map(it => <Tile key={it.tileId} texture={tilesheet.textures[0]} tileDef={it} />);
    return (
        <div className={"h-full w-full bg-[url('/static/tile-bg.png')] justify-center"} ref={drop}>
            {mappedTiles}
        </div>
    )
}


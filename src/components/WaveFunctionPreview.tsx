import React, { useEffect, useState } from "react";
import {useSelector} from "react-redux";
import {TilesetState} from "../state";
import {Tile, TileTexture} from "./Tile";
import { generate } from "../wfc/generate";


export const WaveFunctionPreview = () => {
    const tilesheet = useSelector((state: TilesetState) => state)
    const [getMap, setMap] = useState<string[][][]>([])

    return (
        <>
        <button onClick={() => {
            const gen = generate(tilesheet, 30, 30)
            setMap(gen)
        }}>Regen</button>
            <div className={"h-1/2 w-full bg-black justify-center"} >
                {
                getMap.map(x => {
                return (
                    <div>
                        {x.map(y => y.map(t => <TileTexture tileDef={tilesheet.tiles[t]} hideSelection={true} />))}
                    </div>
                )    
                })
            }
            </div>
        </>
    )
}


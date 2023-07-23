import React from 'react';
import "./main.css";
import {createRoot} from "react-dom/client";
import {TileTextureSelector} from "./components/TextureSelector";
import {DndProvider, useDrop} from "react-dnd";
import {HTML5Backend, NativeTypes} from "react-dnd-html5-backend";
import {TileGrid} from "./components/TileGrid";
import {Provider, useDispatch} from "react-redux";
import {TilesetState, importState, store} from "./state";
import {TileEditor} from "./components/TileEditor";
import {ActionBar} from "./components/ActionBar";
import { WaveFunctionPreview } from './components/WaveFunctionPreview';

const GlobalDrop = (props: { children: JSX.Element }) => {
    const dispatch = useDispatch()
    const [, drop] = useDrop(
        () => ({
            accept: [NativeTypes.FILE],
            drop(item: DataTransfer) {
                if (item.files[0].type !== "application/json") return;
                let reader = new FileReader();
                reader.readAsText(item.files[0]);
                reader.onload = async () => {
                    const importedState = JSON.parse(reader.result.toString()) as TilesetState;
                    console.log(importedState)
                    dispatch(importState(importedState))
                }
            }
        }),
        []
    )

    return (
        <div ref={drop}>
            {props.children}
        </div>
    )
}


function App() {
    return (
        <Provider store={store}>
            <DndProvider backend={HTML5Backend}>
                <GlobalDrop>
                    <div className="grid grid-cols-[400px_75px_minmax(900px,_1fr)_300px] h-full">
                        <TileTextureSelector className="h-full bg-gray-100 p-2"></TileTextureSelector>
                        <ActionBar className="h-full bg-gray-100 p-2"></ActionBar>
                        <div className="h-full">
                            <TileGrid />
                            <WaveFunctionPreview />
                        </div>
                        <TileEditor />
                    </div>
                </GlobalDrop>
            </DndProvider>
        </Provider>
    );
}


const root = createRoot(document.getElementById('app'));
root.render(<App />)
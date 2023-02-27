import React from 'react';
import "./main.css";
import {createRoot} from "react-dom/client";
import {TileTextureSelector} from "./components/TextureSelector";
import {DndProvider} from "react-dnd";
import {HTML5Backend} from "react-dnd-html5-backend";
import {TileGrid} from "./components/TileGrid";
import {Provider} from "react-redux";
import {store} from "./state";
import {TileEditor} from "./components/TileEditor";
import {ActionBar} from "./components/ActionBar";

function App() {


    return (
        <Provider store={store}>
            <DndProvider backend={HTML5Backend}>
                <div className="grid grid-cols-[400px_75px_minmax(900px,_1fr)_300px] h-full">
                    <TileTextureSelector className="h-full bg-gray-100 p-2"></TileTextureSelector>
                    <ActionBar className="h-full bg-gray-100 p-2"></ActionBar>
                    <div className="h-full">
                        <TileGrid />
                    </div>
                    <TileEditor />
                </div>
            </DndProvider>
        </Provider>
    );
}

const root = createRoot(document.getElementById('app'));
root.render(<App />)
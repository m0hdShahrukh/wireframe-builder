import React, { useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import './App.css';
import Toolbar from './components/Toolbar/Toolbar';
import Canvas from './components/Canvas/Canvas';
import PropertiesPanel from './components/PropertiesPanel/PropertiesPanel';

function App() {
  const [elements, setElements] = useState([]);
  const [selectedElement, setSelectedElement] = useState(null);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="app">
        <Toolbar elements={elements} />
        <Canvas
          elements={elements}
          setElements={setElements}
          onSelectElement={setSelectedElement}
        />
        <PropertiesPanel selectedElement={selectedElement} />
      </div>
    </DndProvider>
  );
}

export default App;
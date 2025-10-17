import React from 'react';
import './PropertiesPanel.css';

const PropertiesPanel = ({ selectedElement }) => {
  if (!selectedElement) {
    return (
      <div className="properties-panel">
        <p>Select an element to see its properties.</p>
      </div>
    );
  }

  return (
    <div className="properties-panel">
      <h3>{selectedElement.type} Properties</h3>
      <p>ID: {selectedElement.id}</p>
      <p>X: {selectedElement.x}</p>
      <p>Y: {selectedElement.y}</p>
    </div>
  );
};

export default PropertiesPanel;
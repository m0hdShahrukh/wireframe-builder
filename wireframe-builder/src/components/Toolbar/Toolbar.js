import React from 'react';
import './Toolbar.css';
import DraggableElement from './DraggableElement';
import html2canvas from 'html2canvas';

const Toolbar = ({ elements }) => {
  const handleSnapshot = () => {
    const canvas = document.querySelector('.canvas');
    html2canvas(canvas).then((canvas) => {
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = 'wireframe.png';
      link.click();
    });
  };

  const handleShare = () => {
    const data = JSON.stringify(elements);
    console.log(data);
    alert('Wireframe data copied to clipboard!');
  };

  return (
    <div className="toolbar">
      <DraggableElement type="RECTANGLE">
        <div className="toolbar-element">Rectangle</div>
      </DraggableElement>
      <DraggableElement type="TEXT">
        <div className="toolbar-element">Text</div>
      </DraggableElement>
      <DraggableElement type="BUTTON">
        <div className="toolbar-element">Button</div>
      </DraggableElement>
      <button onClick={handleSnapshot}>Take Snapshot</button>
      <button onClick={handleShare}>Share</button>
    </div>
  );
};

export default Toolbar;
import React from 'react';
import { useDrop } from 'react-dnd';
import './Canvas.css';

const Canvas = ({ elements, setElements, onSelectElement }) => {
  const [, drop] = useDrop(() => ({
    accept: ['RECTANGLE', 'TEXT', 'BUTTON'],
    drop: (item, monitor) => {
      const offset = monitor.getClientOffset();
      const newElement = { id: Date.now(), type: item.type, x: offset.x, y: offset.y };
      setElements((prev) => [...prev, newElement]);
      onSelectElement(newElement);
    },
  }));

  const handleElementClick = (element) => {
    onSelectElement(element);
  };

  const renderElement = (element) => {
    const style = {
      position: 'absolute',
      left: element.x,
      top: element.y,
    };

    switch (element.type) {
      case 'RECTANGLE':
        return <div style={{ ...style, border: '1px solid black', width: '100px', height: '50px' }} />;
      case 'TEXT':
        return <div style={style}>Text</div>;
      case 'BUTTON':
        return <button style={style}>Button</button>;
      default:
        return null;
    }
  };

  return (
    <div ref={drop} className="canvas">
      {elements.map((element) => (
        <div key={element.id} onClick={() => handleElementClick(element)}>
          {renderElement(element)}
        </div>
      ))}
    </div>
  );
};

export default Canvas;
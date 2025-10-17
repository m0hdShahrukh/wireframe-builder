import React from 'react';
import { useDrag } from 'react-dnd';

const DraggableElement = ({ type, children }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type,
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: 'move',
      }}
    >
      {children}
    </div>
  );
};

export default DraggableElement;
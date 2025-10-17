import React, { useState, useEffect } from 'react';

// Main App component
export default function App() {
  // === STATE MANAGEMENT ===
  const [elements, setElements] = useState([]);
  const [selectedElementIds, setSelectedElementIds] = useState([]);
  const [draggingElement, setDraggingElement] = useState(null);
  const [resizingElement, setResizingElement] = useState(null);
  const [canvasBackgroundColor, setCanvasBackgroundColor] = useState('#f0f2f5');
  const [snapToGrid, setSnapToGrid] = useState(false);
  const gridSize = 10;

  // Snap to grid helper
  const snapValue = (value) => {
    if (!snapToGrid) return value;
    return Math.round(value / gridSize) * gridSize;
  };

  // === KEYBOARD SHORTCUTS ===
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Delete' && selectedElementIds.length > 0) {
        deleteSelectedElements();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        duplicateSelectedElements();
      }
      if (e.key === 'Escape') {
        setSelectedElementIds([]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElementIds, elements]);

  // === DRAG AND DROP LOGIC ===
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (draggingElement) {
        const primaryElement = elements.find(el => el.id === draggingElement.primaryId);
        if (!primaryElement) return;

        const newX = snapValue(e.clientX - draggingElement.offsetX);
        const newY = snapValue(e.clientY - draggingElement.offsetY);
        const deltaX = newX - primaryElement.x;
        const deltaY = newY - primaryElement.y;

        const updatedElements = elements.map(el => {
          if (draggingElement.ids.includes(el.id)) {
            return { ...el, x: el.x + deltaX, y: el.y + deltaY };
          }
          return el;
        });
        setElements(updatedElements);
      }

      if (resizingElement) {
        const element = elements.find(el => el.id === resizingElement.id);
        if (!element) return;

        let newWidth = element.width;
        let newHeight = element.height;
        let newX = element.x;
        let newY = element.y;

        const deltaX = e.clientX - resizingElement.startX;
        const deltaY = e.clientY - resizingElement.startY;

        switch (resizingElement.handle) {
          case 'se':
            newWidth = Math.max(20, resizingElement.startWidth + deltaX);
            newHeight = Math.max(20, resizingElement.startHeight + deltaY);
            break;
          case 'sw':
            newWidth = Math.max(20, resizingElement.startWidth - deltaX);
            newHeight = Math.max(20, resizingElement.startHeight + deltaY);
            newX = resizingElement.startElementX + (resizingElement.startWidth - newWidth);
            break;
          case 'ne':
            newWidth = Math.max(20, resizingElement.startWidth + deltaX);
            newHeight = Math.max(20, resizingElement.startHeight - deltaY);
            newY = resizingElement.startElementY + (resizingElement.startHeight - newHeight);
            break;
          case 'nw':
            newWidth = Math.max(20, resizingElement.startWidth - deltaX);
            newHeight = Math.max(20, resizingElement.startHeight - deltaY);
            newX = resizingElement.startElementX + (resizingElement.startWidth - newWidth);
            newY = resizingElement.startElementY + (resizingElement.startHeight - newHeight);
            break;
          case 'e':
            newWidth = Math.max(20, resizingElement.startWidth + deltaX);
            break;
          case 'w':
            newWidth = Math.max(20, resizingElement.startWidth - deltaX);
            newX = resizingElement.startElementX + (resizingElement.startWidth - newWidth);
            break;
          case 's':
            newHeight = Math.max(20, resizingElement.startHeight + deltaY);
            break;
          case 'n':
            newHeight = Math.max(20, resizingElement.startHeight - deltaY);
            newY = resizingElement.startElementY + (resizingElement.startHeight - newHeight);
            break;
        }

        const updatedElements = elements.map(el => {
          if (el.id === resizingElement.id) {
            return { ...el, width: newWidth, height: newHeight, x: newX, y: newY };
          }
          return el;
        });
        setElements(updatedElements);
      }
    };

    const handleMouseUp = () => {
      setDraggingElement(null);
      setResizingElement(null);
    };

    if (draggingElement || resizingElement) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingElement, resizingElement, elements, snapToGrid]);

  const handleMouseDownOnElement = (e, id) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.shiftKey) {
      if (selectedElementIds.includes(id)) {
        setSelectedElementIds(selectedElementIds.filter(eid => eid !== id));
      } else {
        setSelectedElementIds([...selectedElementIds, id]);
      }
      return;
    }

    if (!selectedElementIds.includes(id)) {
      setSelectedElementIds([id]);
    }

    const element = elements.find(el => el.id === id);
    if (!element) return;

    const offsetX = e.clientX - element.x;
    const offsetY = e.clientY - element.y;

    setDraggingElement({ 
      ids: selectedElementIds.includes(id) ? selectedElementIds : [id],
      primaryId: id,
      offsetX, 
      offsetY 
    });
  };

  const handleResizeStart = (e, id, handle) => {
    e.preventDefault();
    e.stopPropagation();

    const element = elements.find(el => el.id === id);
    if (!element) return;

    setResizingElement({
      id,
      handle,
      startX: e.clientX,
      startY: e.clientY,
      startWidth: element.width,
      startHeight: element.height,
      startElementX: element.x,
      startElementY: element.y,
    });
  };

  // === ELEMENT MANIPULATION ===
  const addRectangle = () => {
    const newRectangle = {
      id: `rect-${Date.now()}`,
      type: 'rectangle',
      x: 50,
      y: 50,
      width: 200,
      height: 100,
      backgroundColor: '#e0e0e0',
      borderRadius: 0,
      borderWidth: 1,
      borderStyle: 'solid',
      borderColor: '#ccc',
    };
    setElements([...elements, newRectangle]);
    setSelectedElementIds([newRectangle.id]);
  };

  const addText = () => {
    const newText = {
      id: `text-${Date.now()}`,
      type: 'text',
      x: 100,
      y: 120,
      width: 150,
      height: 40,
      content: 'Hello World',
      fontSize: 16,
      color: '#000000',
      backgroundColor: 'transparent',
      borderRadius: 0,
      borderWidth: 0,
      borderStyle: 'solid',
      borderColor: '#ccc',
      padding: 5,
    };
    setElements([...elements, newText]);
    setSelectedElementIds([newText.id]);
  };

  const addCircle = () => {
    const newCircle = {
      id: `circle-${Date.now()}`,
      type: 'circle',
      x: 150,
      y: 150,
      width: 100,
      height: 100,
      backgroundColor: '#ffeb3b',
      borderRadius: 50,
      borderWidth: 1,
      borderStyle: 'solid',
      borderColor: '#ccc',
    };
    setElements([...elements, newCircle]);
    setSelectedElementIds([newCircle.id]);
  };

  const selectedElement = selectedElementIds.length === 1 
    ? elements.find(el => el.id === selectedElementIds[0]) 
    : null;

  const updateSelectedElement = (property, value) => {
    const updatedElements = elements.map(el => {
      if (selectedElementIds.includes(el.id)) {
        const isNumeric = ['width', 'height', 'x', 'y', 'fontSize', 'borderRadius', 'borderWidth', 'padding'].includes(property);
        return { ...el, [property]: isNumeric ? Number(value) : value };
      }
      return el;
    });
    setElements(updatedElements);
  };

  const deleteSelectedElements = () => {
    if (selectedElementIds.length === 0) return;
    const updatedElements = elements.filter(el => !selectedElementIds.includes(el.id));
    setElements(updatedElements);
    setSelectedElementIds([]);
  };

  const duplicateSelectedElements = () => {
    if (selectedElementIds.length === 0) return;
    
    const newElements = [];
    const newIds = [];
    
    selectedElementIds.forEach(id => {
      const elementToDuplicate = elements.find(el => el.id === id);
      if (elementToDuplicate) {
        const duplicatedElement = {
          ...elementToDuplicate,
          id: `${elementToDuplicate.type}-${Date.now()}-${Math.random()}`,
          x: elementToDuplicate.x + 20,
          y: elementToDuplicate.y + 20,
        };
        newElements.push(duplicatedElement);
        newIds.push(duplicatedElement.id);
      }
    });

    setElements([...elements, ...newElements]);
    setSelectedElementIds(newIds);
  };

  const bringForward = () => {
    if (selectedElementIds.length === 0) return;
    const newElements = [...elements];
    
    for (let i = newElements.length - 2; i >= 0; i--) {
      if (selectedElementIds.includes(newElements[i].id)) {
        [newElements[i], newElements[i + 1]] = [newElements[i + 1], newElements[i]];
      }
    }
    
    setElements(newElements);
  };

  const sendBackward = () => {
    if (selectedElementIds.length === 0) return;
    const newElements = [...elements];
    
    for (let i = 1; i < newElements.length; i++) {
      if (selectedElementIds.includes(newElements[i].id)) {
        [newElements[i], newElements[i - 1]] = [newElements[i - 1], newElements[i]];
      }
    }
    
    setElements(newElements);
  };

  // === ALIGNMENT FUNCTIONS ===
  const alignLeft = () => {
    if (selectedElementIds.length < 2) return;
    const selectedEls = elements.filter(el => selectedElementIds.includes(el.id));
    const minX = Math.min(...selectedEls.map(el => el.x));
    
    const updatedElements = elements.map(el => {
      if (selectedElementIds.includes(el.id)) {
        return { ...el, x: minX };
      }
      return el;
    });
    setElements(updatedElements);
  };

  const alignCenter = () => {
    if (selectedElementIds.length < 2) return;
    const selectedEls = elements.filter(el => selectedElementIds.includes(el.id));
    const avgCenterX = selectedEls.reduce((sum, el) => sum + (el.x + el.width / 2), 0) / selectedEls.length;
    
    const updatedElements = elements.map(el => {
      if (selectedElementIds.includes(el.id)) {
        return { ...el, x: avgCenterX - el.width / 2 };
      }
      return el;
    });
    setElements(updatedElements);
  };

  const alignRight = () => {
    if (selectedElementIds.length < 2) return;
    const selectedEls = elements.filter(el => selectedElementIds.includes(el.id));
    const maxRight = Math.max(...selectedEls.map(el => el.x + el.width));
    
    const updatedElements = elements.map(el => {
      if (selectedElementIds.includes(el.id)) {
        return { ...el, x: maxRight - el.width };
      }
      return el;
    });
    setElements(updatedElements);
  };

  const alignTop = () => {
    if (selectedElementIds.length < 2) return;
    const selectedEls = elements.filter(el => selectedElementIds.includes(el.id));
    const minY = Math.min(...selectedEls.map(el => el.y));
    
    const updatedElements = elements.map(el => {
      if (selectedElementIds.includes(el.id)) {
        return { ...el, y: minY };
      }
      return el;
    });
    setElements(updatedElements);
  };

  const alignMiddle = () => {
    if (selectedElementIds.length < 2) return;
    const selectedEls = elements.filter(el => selectedElementIds.includes(el.id));
    const avgCenterY = selectedEls.reduce((sum, el) => sum + (el.y + el.height / 2), 0) / selectedEls.length;
    
    const updatedElements = elements.map(el => {
      if (selectedElementIds.includes(el.id)) {
        return { ...el, y: avgCenterY - el.height / 2 };
      }
      return el;
    });
    setElements(updatedElements);
  };

  const alignBottom = () => {
    if (selectedElementIds.length < 2) return;
    const selectedEls = elements.filter(el => selectedElementIds.includes(el.id));
    const maxBottom = Math.max(...selectedEls.map(el => el.y + el.height));
    
    const updatedElements = elements.map(el => {
      if (selectedElementIds.includes(el.id)) {
        return { ...el, y: maxBottom - el.height };
      }
      return el;
    });
    setElements(updatedElements);
  };

  // === JSX ===
  return (
    <div style={styles.appContainer}>
      <div style={styles.topBar}>
        <h1 style={styles.title}>Wireframe Tool - Phase 5</h1>
        <div style={styles.topBarButtons}>
          {selectedElementIds.length > 0 && (
            <>
              <button onClick={duplicateSelectedElements} style={styles.actionButton} title="Duplicate (Ctrl+D)">
                📋 Duplicate
              </button>
              <button onClick={bringForward} style={styles.layerButton} title="Bring Forward">↑</button>
              <button onClick={sendBackward} style={styles.layerButton} title="Send Backward">↓</button>
              <button onClick={deleteSelectedElements} style={styles.deleteButton} title="Delete (Del)">🗑</button>
            </>
          )}
          {selectedElementIds.length > 1 && (
            <>
              <div style={styles.divider}></div>
              <button onClick={alignLeft} style={styles.alignButton} title="Align Left">⬅️</button>
              <button onClick={alignCenter} style={styles.alignButton} title="Align Center">↔️</button>
              <button onClick={alignRight} style={styles.alignButton} title="Align Right">➡️</button>
              <button onClick={alignTop} style={styles.alignButton} title="Align Top">⬆️</button>
              <button onClick={alignMiddle} style={styles.alignButton} title="Align Middle">↕️</button>
              <button onClick={alignBottom} style={styles.alignButton} title="Align Bottom">⬇️</button>
            </>
          )}
        </div>
      </div>

      <div style={styles.mainContent}>
        <div style={styles.leftSidebar}>
          <h2 style={styles.sidebarTitle}>Elements</h2>
          <button onClick={addRectangle} style={styles.elementButton}>
            <span style={styles.buttonIcon}>▭</span> Rectangle
          </button>
          <button onClick={addCircle} style={styles.elementButton}>
            <span style={styles.buttonIcon}>⬤</span> Circle
          </button>
          <button onClick={addText} style={styles.elementButton}>
            <span style={styles.buttonIcon}>T</span> Text
          </button>

          <div style={styles.canvasSettings}>
            <h3 style={styles.settingsTitle}>Canvas</h3>
            <div style={styles.propertyInputContainer}>
              <label style={styles.propertyLabel}>BG Color</label>
              <input
                type="color"
                value={canvasBackgroundColor}
                onChange={(e) => setCanvasBackgroundColor(e.target.value)}
                style={styles.colorInput}
              />
            </div>
            <div style={styles.checkboxContainer}>
              <input
                type="checkbox"
                id="snapToGrid"
                checked={snapToGrid}
                onChange={(e) => setSnapToGrid(e.target.checked)}
                style={styles.checkbox}
              />
              <label htmlFor="snapToGrid" style={styles.checkboxLabel}>Snap to Grid</label>
            </div>
          </div>

          <div style={styles.infoSection}>
            <p style={styles.infoText}>💡 <strong>Tips:</strong></p>
            <p style={styles.infoText}>• Shift+Click for multi-select</p>
            <p style={styles.infoText}>• Ctrl+D to duplicate</p>
            <p style={styles.infoText}>• Delete key to remove</p>
            <p style={styles.infoText}>• Drag corners/edges to resize</p>
          </div>
        </div>

        <div 
          style={{
            ...styles.canvas, 
            backgroundColor: canvasBackgroundColor,
            backgroundImage: snapToGrid ? `
              linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)
            ` : 'none',
            backgroundSize: snapToGrid ? `${gridSize}px ${gridSize}px` : 'auto',
          }} 
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setSelectedElementIds([]);
          }}
        >
          {elements.map((element, index) => {
            const isSelected = selectedElementIds.includes(element.id);
            const isDragging = draggingElement && draggingElement.ids.includes(element.id);

            const elementStyle = {
              position: 'absolute',
              left: element.x,
              top: element.y,
              width: element.width,
              height: element.height,
              cursor: isDragging ? 'grabbing' : 'grab',
              border: isSelected ? '2px solid #007bff' : `${element.borderWidth}px ${element.borderStyle} ${element.borderColor}`,
              borderRadius: element.type === 'circle' ? '50%' : `${element.borderRadius}px`,
              userSelect: 'none',
              boxSizing: 'border-box',
              zIndex: isSelected ? 1000 : index,
            };

            return (
              <div key={element.id} style={{ position: 'absolute', left: element.x, top: element.y, zIndex: isSelected ? 1000 : index }}>
                {(element.type === 'rectangle' || element.type === 'circle') && (
                  <div
                    style={{ ...elementStyle, position: 'relative', left: 0, top: 0, backgroundColor: element.backgroundColor }}
                    onMouseDown={(e) => handleMouseDownOnElement(e, element.id)}
                  ></div>
                )}

                {element.type === 'text' && (
                  <div
                    style={{
                      ...elementStyle,
                      position: 'relative',
                      left: 0,
                      top: 0,
                      fontSize: `${element.fontSize}px`,
                      color: element.color,
                      backgroundColor: element.backgroundColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: `${element.padding}px`,
                    }}
                    onMouseDown={(e) => handleMouseDownOnElement(e, element.id)}
                  >
                    {element.content}
                  </div>
                )}

                {isSelected && selectedElementIds.length === 1 && (
                  <>
                    <div style={{...styles.resizeHandle, ...styles.handleNW}} onMouseDown={(e) => handleResizeStart(e, element.id, 'nw')} />
                    <div style={{...styles.resizeHandle, ...styles.handleNE, left: element.width - 4}} onMouseDown={(e) => handleResizeStart(e, element.id, 'ne')} />
                    <div style={{...styles.resizeHandle, ...styles.handleSW, top: element.height - 4}} onMouseDown={(e) => handleResizeStart(e, element.id, 'sw')} />
                    <div style={{...styles.resizeHandle, ...styles.handleSE, left: element.width - 4, top: element.height - 4}} onMouseDown={(e) => handleResizeStart(e, element.id, 'se')} />
                    <div style={{...styles.resizeHandle, ...styles.handleN, left: element.width / 2 - 4}} onMouseDown={(e) => handleResizeStart(e, element.id, 'n')} />
                    <div style={{...styles.resizeHandle, ...styles.handleS, left: element.width / 2 - 4, top: element.height - 4}} onMouseDown={(e) => handleResizeStart(e, element.id, 's')} />
                    <div style={{...styles.resizeHandle, ...styles.handleW, top: element.height / 2 - 4}} onMouseDown={(e) => handleResizeStart(e, element.id, 'w')} />
                    <div style={{...styles.resizeHandle, ...styles.handleE, left: element.width - 4, top: element.height / 2 - 4}} onMouseDown={(e) => handleResizeStart(e, element.id, 'e')} />
                  </>
                )}
              </div>
            );
          })}
        </div>

        <div style={styles.rightSidebar}>
          <h2 style={styles.sidebarTitle}>Properties</h2>
          {selectedElement ? (
            <div>
              <div style={styles.propertySection}>
                <h3 style={styles.sectionTitle}>Position & Size</h3>
                <PropertyInput label="X" value={selectedElement.x} onChange={e => updateSelectedElement('x', e.target.value)} />
                <PropertyInput label="Y" value={selectedElement.y} onChange={e => updateSelectedElement('y', e.target.value)} />
                <PropertyInput label="Width" value={selectedElement.width} onChange={e => updateSelectedElement('width', e.target.value)} />
                <PropertyInput label="Height" value={selectedElement.height} onChange={e => updateSelectedElement('height', e.target.value)} />
              </div>

              <div style={styles.propertySection}>
                <h3 style={styles.sectionTitle}>Style</h3>
                {(selectedElement.type === 'rectangle' || selectedElement.type === 'circle') && (
                  <PropertyInput label="BG Color" type="color" value={selectedElement.backgroundColor} onChange={e => updateSelectedElement('backgroundColor', e.target.value)} />
                )}
                {selectedElement.type === 'text' && (
                  <>
                    <PropertyInput label="BG Color" type="color" value={selectedElement.backgroundColor} onChange={e => updateSelectedElement('backgroundColor', e.target.value)} />
                    <PropertyInput label="Content" type="text" value={selectedElement.content} onChange={e => updateSelectedElement('content', e.target.value)} />
                    <PropertyInput label="Font Size" value={selectedElement.fontSize} onChange={e => updateSelectedElement('fontSize', e.target.value)} />
                    <PropertyInput label="Color" type="color" value={selectedElement.color} onChange={e => updateSelectedElement('color', e.target.value)} />
                    <PropertyInput label="Padding" value={selectedElement.padding} onChange={e => updateSelectedElement('padding', e.target.value)} />
                  </>
                )}
                {selectedElement.type !== 'circle' && (
                  <PropertyInput label="Border R." value={selectedElement.borderRadius} onChange={e => updateSelectedElement('borderRadius', e.target.value)} />
                )}
              </div>

              <div style={styles.propertySection}>
                <h3 style={styles.sectionTitle}>Border</h3>
                <PropertyInput label="Width" value={selectedElement.borderWidth} onChange={e => updateSelectedElement('borderWidth', e.target.value)} />
                <div style={styles.propertyInputContainer}>
                  <label style={styles.propertyLabel}>Style</label>
                  <select 
                    value={selectedElement.borderStyle} 
                    onChange={e => updateSelectedElement('borderStyle', e.target.value)}
                    style={styles.propertyInput}
                  >
                    <option value="solid">Solid</option>
                    <option value="dashed">Dashed</option>
                    <option value="dotted">Dotted</option>
                    <option value="double">Double</option>
                    <option value="none">None</option>
                  </select>
                </div>
                <PropertyInput label="Color" type="color" value={selectedElement.borderColor} onChange={e => updateSelectedElement('borderColor', e.target.value)} />
              </div>
            </div>
          ) : selectedElementIds.length > 1 ? (
            <p style={styles.emptyState}>{selectedElementIds.length} elements selected</p>
          ) : (
            <p style={styles.emptyState}>Select an element to edit its properties</p>
          )}
        </div>
      </div>
    </div>
  );
}

function PropertyInput({ label, value, onChange, type = 'number' }) {
  if (label === 'Content') {
    type = 'text';
  }
  return (
    <div style={styles.propertyInputContainer}>
      <label style={styles.propertyLabel}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        style={styles.propertyInput}
      />
    </div>
  );
}

const styles = {
  appContainer: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    width: '100vw',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  topBar: {
    height: '60px',
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #dcdcdc',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 20px',
  },
  title: {
    margin: 0,
    fontSize: '20px',
    fontWeight: '600',
  },
  topBarButtons: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
  actionButton: {
    padding: '8px 12px',
    fontSize: '13px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  layerButton: {
    padding: '8px 12px',
    fontSize: '13px',
    backgroundColor: '#f8f9fa',
    color: '#333',
    border: '1px solid #dcdcdc',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  deleteButton: {
    padding: '8px 12px',
    fontSize: '13px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  alignButton: {
    padding: '8px 10px',
    fontSize: '14px',
    backgroundColor: '#f8f9fa',
    color: '#333',
    border: '1px solid #dcdcdc',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  divider: {
    width: '1px',
    height: '24px',
    backgroundColor: '#dcdcdc',
  },
  mainContent: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
  },
  leftSidebar: {
    width: '200px',
    backgroundColor: '#ffffff',
    borderRight: '1px solid #dcdcdc',
    padding: '20px',
    overflowY: 'auto',
  },
  sidebarTitle: {
    margin: '0 0 16px 0',
    fontSize: '16px',
    fontWeight: '600',
  },
  elementButton: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    padding: '12px',
    marginBottom: '10px',
    fontSize: '14px',
    cursor: 'pointer',
    backgroundColor: '#f8f9fa',
    border: '1px solid #dcdcdc',
    borderRadius: '6px',
    transition: 'all 0.2s',
  },
  buttonIcon: {
    marginRight: '8px',
    fontSize: '16px',
  },
  canvasSettings: {
    marginTop: '30px',
    paddingTop: '20px',
    borderTop: '1px solid #e9ecef',
  },
  settingsTitle: {
    margin: '0 0 12px 0',
    fontSize: '14px',
    fontWeight: '600',
  },
  colorInput: {
    flex: 1,
    height: '32px',
    border: '1px solid #ced4da',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  checkboxContainer: {
    display: 'flex',
    alignItems: 'center',
    marginTop: '12px',
  },
  checkbox: {
    marginRight: '8px',
    cursor: 'pointer',
  },
  checkboxLabel: {
    fontSize: '13px',
    color: '#495057',
    cursor: 'pointer',
  },
  infoSection: {
    marginTop: '30px',
    paddingTop: '20px',
    borderTop: '1px solid #e9ecef',
  },
  infoText: {
    margin: '0 0 8px 0',
    fontSize: '12px',
    color: '#6c757d',
    lineHeight: '1.4',
  },
  canvas: {
    flex: 1,
    position: 'relative',
    overflow: 'auto',
  },
  rightSidebar: {
    width: '280px',
    backgroundColor: '#ffffff',
    borderLeft: '1px solid #dcdcdc',
    padding: '20px',
    overflowY: 'auto',
  },
  propertySection: {
    marginBottom: '20px',
    paddingBottom: '20px',
    borderBottom: '1px solid #e9ecef',
  },
  sectionTitle: {
    margin: '0 0 12px 0',
    fontSize: '13px',
    fontWeight: '600',
    textTransform: 'uppercase',
    color: '#6c757d',
  },
  propertyInputContainer: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '12px',
  },
  propertyLabel: {
    width: '80px',
    fontSize: '13px',
    color: '#495057',
  },
  propertyInput: {
    flex: 1,
    padding: '6px 8px',
    fontSize: '13px',
    border: '1px solid #ced4da',
    borderRadius: '4px',
    outline: 'none',
  },
  emptyState: {
    color: '#6c757d',
    fontSize: '14px',
    textAlign: 'center',
    marginTop: '40px',
  },
  resizeHandle: {
    position: 'absolute',
    width: '8px',
    height: '8px',
    backgroundColor: '#007bff',
    border: '1px solid #ffffff',
    borderRadius: '50%',
    zIndex: 10,
  },
  handleNW: {
    top: -4,
    left: -4,
    cursor: 'nw-resize',
  },
  handleNE: {
    top: -4,
    cursor: 'ne-resize',
  },
  handleSW: {
    left: -4,
    cursor: 'sw-resize',
  },
  handleSE: {
    cursor: 'se-resize',
  },
  handleN: {
    top: -4,
    cursor: 'n-resize',
  },
  handleS: {
    cursor: 's-resize',
  },
  handleW: {
    left: -4,
    cursor: 'w-resize',
  },
  handleE: {
    cursor: 'e-resize',
  },
};
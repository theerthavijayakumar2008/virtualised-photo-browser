import React, { useState, useMemo } from 'react';
import './App.css';

const ITEM_SIZE = 180;
const GAP = 12;

function App() {
  const [photos, setPhotos] = useState([]);
  const [selected, setSelected] = useState(null);

  const [columns, setColumns] = useState(3);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(600);

  const handleUpload = (e) => {
    const files = Array.from(e.target.files || []);
    const images = files
      .filter(file => file.type.startsWith('image/'))
      .map(file => ({
        id: crypto.randomUUID(),
        url: URL.createObjectURL(file),
        name: file.name
      }));

    setPhotos(prev => [...prev, ...images]);
    e.target.value = '';
  };

  const rows = Math.ceil(photos.length / columns);
  const rowHeight = ITEM_SIZE + GAP;
  const totalHeight = rows * rowHeight;

  const startRow = Math.max(0, Math.floor(scrollTop / rowHeight) - 2);
  const endRow = Math.min(
    rows,
    Math.ceil((scrollTop + containerHeight) / rowHeight) + 2
  );

  const visiblePhotos = [];

  for (let row = startRow; row < endRow; row++) {
    for (let col = 0; col < columns; col++) {
      const index = row * columns + col;
      if (index < photos.length) {
        visiblePhotos.push({ ...photos[index], index, row, col });
      }
    }
  }

  const closeViewer = () => setSelected(null);

  React.useEffect(() => {
    if (!selected) return;

    const handleKey = (e) => {
      if (e.key === 'Escape') closeViewer();
      if (e.key === 'ArrowRight') {
        setSelected(s => Math.min(s + 1, photos.length - 1));
      }
      if (e.key === 'ArrowLeft') {
        setSelected(s => Math.max(s - 1, 0));
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [selected, photos.length]);

  React.useEffect(() => {
    const updateSize = () => {
      const width = window.innerWidth;
      setColumns(Math.max(1, Math.floor(width / 210)));
      setContainerHeight(window.innerHeight - 190);
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  React.useEffect(() => {
    return () => photos.forEach(photo => URL.revokeObjectURL(photo.url));
  }, [photos]);

  return (
    <div className="app">
      <header>
        <h1>📸 Photo Browser</h1>
        <p>Browse your photos smoothly</p>
        <label className="upload">
          + Upload Photos
          <input type="file" accept="image/*" multiple onChange={handleUpload} />
        </label>
        <p>{photos.length} photos loaded · {visiblePhotos.length} rendered</p>
      </header>

      <main
        className="gallery"
        onScroll={e => setScrollTop(e.currentTarget.scrollTop)}
        style={{ height: containerHeight }}
      >
        <div style={{ height: totalHeight, position: 'relative' }}>
          {visiblePhotos.map(photo => (
            <div
              key={photo.id}
              className="photo"
              style={{
                position: 'absolute',
                top: photo.row * rowHeight,
                left: `${(photo.col / columns) * 100}%`,
                width: `calc(${100 / columns}% - ${GAP}px)`,
                height: ITEM_SIZE
              }}
              onClick={() => setSelected(photo.index)}
            >
              <img src={photo.url} alt={photo.name} />
              <span>{photo.name}</span>
            </div>
          ))}
        </div>
      </main>

      {selected !== null && photos[selected] && (
        <div className="viewer" onClick={closeViewer}>
          <button onClick={closeViewer}>✕</button>
          <button onClick={e => {
            e.stopPropagation();
            setSelected(s => Math.max(0, s - 1));
          }}>❮</button>
          <img
            src={photos[selected].url}
            alt={photos[selected].name}
            onClick={e => e.stopPropagation()}
          />
          <button onClick={e => {
            e.stopPropagation();
            setSelected(s => Math.min(photos.length - 1, s + 1));
          }}>❯</button>
        </div>
      )}
    </div>
  );
}

export default App;

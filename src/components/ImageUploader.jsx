import { useRef } from 'react'

function ImageUploader({ currentUrl, onUpload, onRemove, label = 'Upload Image' }) {
  const inputRef = useRef(null)

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) onUpload(file)
    e.target.value = ''
  }

  return (
    <div className="image-uploader">
      {currentUrl ? (
        <div className="image-uploader-preview">
          <img src={currentUrl} alt={label} />
          <div className="image-uploader-actions">
            <button type="button" onClick={() => inputRef.current?.click()}>Change</button>
            {onRemove && <button type="button" onClick={onRemove} className="remove-btn">Remove</button>}
          </div>
        </div>
      ) : (
        <div className="image-uploader-empty" onClick={() => inputRef.current?.click()}>
          <span>+</span>
          <span>{label}</span>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      <style>{`
        .image-uploader {
          width: 100%;
        }
        .image-uploader-preview {
          position: relative;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid rgba(182, 142, 64, 0.3);
        }
        .image-uploader-preview img {
          width: 100%;
          height: 200px;
          object-fit: cover;
          display: block;
        }
        .image-uploader-actions {
          display: flex;
          gap: 0.5rem;
          padding: 0.5rem;
          background: var(--dark-gray);
        }
        .image-uploader-actions button {
          flex: 1;
          padding: 0.5rem;
          border: 1px solid rgba(182, 142, 64, 0.3);
          background: transparent;
          color: var(--gold);
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.85rem;
        }
        .image-uploader-actions button:hover {
          background: rgba(182, 142, 64, 0.1);
        }
        .image-uploader-actions .remove-btn {
          color: #ff4444;
          border-color: rgba(255, 68, 68, 0.3);
        }
        .image-uploader-actions .remove-btn:hover {
          background: rgba(255, 68, 68, 0.1);
        }
        .image-uploader-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 150px;
          border: 2px dashed rgba(182, 142, 64, 0.3);
          border-radius: 8px;
          cursor: pointer;
          color: rgba(255, 255, 255, 0.5);
          gap: 0.5rem;
          transition: border-color 0.3s;
        }
        .image-uploader-empty:hover {
          border-color: var(--gold);
          color: var(--gold);
        }
        .image-uploader-empty span:first-child {
          font-size: 2rem;
        }
      `}</style>
    </div>
  )
}

export default ImageUploader

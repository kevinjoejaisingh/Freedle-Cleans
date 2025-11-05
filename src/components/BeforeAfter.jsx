import { useState, useRef } from 'react'
import './BeforeAfter.css'
import cleanCar from '../assets/images/_DSC9932-2.jpg'
import dirtyCar from '../assets/images/Gemini_Generated_Image_dii0ncdii0ncdii0.jpg'

function BeforeAfter() {
  const [sliderPosition, setSliderPosition] = useState(50)
  const containerRef = useRef(null)
  const isDraggingRef = useRef(false)

  const handleMove = (clientX) => {
    if (!containerRef.current) return
    
    const rect = containerRef.current.getBoundingClientRect()
    const x = clientX - rect.left
    const percentage = (x / rect.width) * 100
    
    const clampedPercentage = Math.min(Math.max(percentage, 0), 100)
    setSliderPosition(clampedPercentage)
  }

  const handleMouseDown = () => {
    isDraggingRef.current = true
  }

  const handleMouseUp = () => {
    isDraggingRef.current = false
  }

  const handleMouseMove = (e) => {
    if (!isDraggingRef.current) return
    e.preventDefault()
    handleMove(e.clientX)
  }

  const handleTouchMove = (e) => {
    if (!isDraggingRef.current) return
    e.preventDefault()
    handleMove(e.touches[0].clientX)
  }

  const handleClick = (e) => {
    e.preventDefault()
    handleMove(e.clientX)
  }

  return (
    <div className="before-after-container">
      <div className="before-after-labels">
        <div className="label-before">BEFORE</div>
        <div className="label-after">AFTER</div>
      </div>
      
      <div
        ref={containerRef}
        className="before-after-slider"
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchEnd={handleMouseUp}
        onTouchMove={handleTouchMove}
        onClick={handleClick}
      >
        <div className="image-container after-image">
          <img 
            src={cleanCar}
            alt="After detailing"
            draggable="false"
          />
        </div>

        <div 
          className="image-container before-image"
          style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
        >
          <img 
            src={dirtyCar}
            alt="Before detailing"
            draggable="false"
          />
        </div>

        <div 
          className="slider-handle"
          style={{ left: `${sliderPosition}%` }}
        >
          <div className="slider-line"></div>
          <div className="slider-button">
            <div className="arrow-left">‹</div>
            <div className="arrow-right">›</div>
          </div>
        </div>
      </div>

      <div className="slider-instruction">
        ← Drag to reveal transformation →
      </div>
    </div>
  )
}

export default BeforeAfter
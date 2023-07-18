import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import "cropperjs/dist/cropper.css";
import "../src/components/cropping/cropping.css";

const defaultSrc = `${process.env.PUBLIC_URL}/images/one.jpg`;

const Demo = () => {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    console.log(croppedArea, croppedAreaPixels)
  }, [])

  return (
    <>
      <div className="crop-container">
          <Cropper
            image={defaultSrc}
            crop={crop}
            zoom={zoom}
            aspect={4 / 3}
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
          />
      </div>
      <div className="controls">
          <input
            type="range"
            value={zoom}
            min={1}
            max={3}
            step={0.1}
            aria-labelledby="Zoom"
            onChange={(e) => {
              setZoom(e.target.value)
            }}
            className="zoom-range"
          />
        </div>
    </>
  )
}

export default Demo;

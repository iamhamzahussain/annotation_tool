import React, { useEffect, useState,useRef } from 'react';
import './layoutannotation.css';
import './rectangle.css'
import Canvas from 'containers/Canvas';

import ReactCrop, {
    centerCrop,
    makeAspectCrop,
    Crop,
    PixelCrop} from 'react-image-crop';
import canvasPreview from './cropping/canvasPreview';
import 'react-image-crop/dist/ReactCrop.css';

const Layout = () => {
    const [show, toggleShow] = useState(true);
    const [annotationType, setAnnotationType] = useState(null);
    const [annotations, setAnnotations] = useState([]);
    const [rectanglePosition, setRectanglePosition] = useState(null);
    const [argShow, setArgShow] = useState(true);

    let magnify = (imgID, zoom) => {
        var img, glass, w, h, bw;
        img = document.getElementById(imgID);
        /*create magnifier glass:*/
        glass = document.createElement("DIV");
        glass.setAttribute("class", "img-magnifier-glass");
        /*insert magnifier glass:*/
        img.parentElement.insertBefore(glass, img);
        /*set background properties for the magnifier glass:*/
        glass.style.backgroundImage = "url('" + img.src + "')";
        glass.style.backgroundRepeat = "no-repeat";
        glass.style.backgroundSize = (img.width * zoom) + "px " + (img.height * zoom) + "px";
        bw = 3;
        w = glass.offsetWidth / 2;
        h = glass.offsetHeight / 2;

        let moveMagnifier = (e) => {
            var pos, x, y;
            /*prevent any other actions that may occur when moving over the image*/
            e.preventDefault();
            /*get the cursor's x and y positions:*/
            pos = getCursorPos(e);
            x = pos.x;
            y = pos.y;
            /*prevent the magnifier glass from being positioned outside the image:*/
            if (x > img.width - (w / zoom)) { x = img.width - (w / zoom); }
            if (x < w / zoom) { x = w / zoom; }
            if (y > img.height - (h / zoom)) { y = img.height - (h / zoom); }
            if (y < h / zoom) { y = h / zoom; }
            /*set the position of the magnifier glass:*/
            glass.style.left = ((x - w)) + "px";
            glass.style.top = ((y - h)) + "px";
            /*display what the magnifier glass "sees":*/
            glass.style.backgroundPosition = "-" + ((x * zoom) - w + bw) + "px -" + ((y * zoom) - h + bw) + "px";
        }
        let getCursorPos = (e) => {
            var a, x = 0, y = 0;
            e = e || window.event;
            /*get the x and y positions of the image:*/
            a = img.getBoundingClientRect();
            /*calculate the cursor's x and y coordinates, relative to the image:*/
            x = e.pageX - a.left;
            y = e.pageY - a.top;
            /*consider any page scrolling:*/
            x = x - window.pageXOffset;
            y = y - window.pageYOffset;
            return { x: x, y: y };
        }

        /*execute a function when someone moves the magnifier glass over the image:*/
        glass.addEventListener("mousemove", moveMagnifier);
        img.addEventListener("mousemove", moveMagnifier);
        /*and also for touch screens:*/
        glass.addEventListener("touchmove", moveMagnifier);
        img.addEventListener("touchmove", moveMagnifier);
    };

    const removeMagnifire = () => {
        // const elem = document.getElementsByClassName('img-magnifier-glass')
        const elem = document.getElementsByClassName('icon-wrapper')

    }

    let onChangeImage = () => {
        console.log("hello")
    }

    let openMagnifyGlass = (arg) => {
        console.log("Vikas=", arg);
        if (arg === true) {
            magnify("mainimage", 2);
        }
    }

    let zoomIn = () => {
        console.log("Vikas Bose");
        setArgShow(false);
    }

    const handleAnnotation = (type) => {
        console.log("hamza")
        setRectanglePosition(null);
    };

    const [zoom, setZoom] = useState(1)
const [cropSec, setCropSec] = useState(false)
const [annotationSec, setAnnotationSec] = useState(false)
const [magnifierSec, setMegnifierSec] = useState(false)
const [polygonSec, setPolygonSec] = useState(false);
// const [annotations, setAnnotations] = useState([])
const [annotation, setAnnotation] = useState({})
const [crop, setCrop] = useState();
const [completedCrop, setCompletedCrop] = useState({ width:0, height:0})
const previewCanvasRef = useRef(null)
const imgRef = useRef(null)
const hiddenAnchorRef = useRef(null)
const blobUrlRef = useRef('')
const cropperRef = useRef(null);
const [scale, setScale] = useState(1)
const [rotate, setRotate] = useState(0)
const onCrop = () => {
    const cropper = cropperRef.current?.cropper;
    console.log(cropper.getCroppedCanvas().toDataURL());
};

const onChange = (annotation)=> {
    setAnnotation(annotation)
}

const onSubmit = (annotation)=> {
    const { geometry, data } = annotation
    setAnnotations(annotations.concat({
        geometry,
        data: {
          ...data,
          id: Math.random()
        }
    }))
}

const onDownloadCropClick = ()=> {
    if (!previewCanvasRef.current) {
      throw new Error('Crop canvas does not exist')
    }

    previewCanvasRef.current.toBlob((blob) => {
      if (!blob) {
        throw new Error('Failed to create blob')
      }
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current)
      }
      console.log("Vikas=",blobUrlRef);
      blobUrlRef.current = URL.createObjectURL(blob)
      hiddenAnchorRef.current.href = blobUrlRef.current
      hiddenAnchorRef.current.click()
    })
}

useEffect(() => {
    if (
      completedCrop?.width &&
      completedCrop?.height &&
      imgRef.current &&
      previewCanvasRef.current
    ) {
      // We use canvasPreview as it's much faster than imgPreview.
      canvasPreview(
        imgRef.current,
        previewCanvasRef.current,
        completedCrop,
        scale,
        rotate,
      )
    }
  })

  const cropStyle = {
                     width: '120%', 
                     height: '500px',
                    }


    const [isMagnifier, setIsMagnifier] = useState(false)
    const [isCropImage, setIsCropImage] = useState(false)
    const [isRect, setIsRect] = useState(false)
    const [isPolygon,setIsPolygone] = useState(false)

    const newRect = {
        initX: 0,
        initY: 0,
        width: 0,
        height: 0,
        clickCounter: 0,
        txt: ''
    }
    const [rect, setRect] = useState([newRect])
    const [txt, setTxt] = useState('')
    const addRect = () => {
        setRect([...rect, newRect])
    }

    const clickRectHandle = (event) => {
        if (rect[rect.length - 1].clickCounter == 0 && isRect ) {
            const newArr = rect.map((item, index) => {
                if (index + 1 == rect.length) {
                    return { ...item, clickCounter: item.clickCounter + 1, initX: event.screenX -270, initY: event.screenY -160 }
                }
                else {
                    return item
                }
            })
            setRect(newArr)
            return
        }
        if (rect[rect.length - 1].clickCounter <= 2) {
            const newArr = rect.map((item, index) => {
                if (index + 1 == rect.length) {
                    return { ...item, clickCounter: item.clickCounter + 1 }
                } else {
                    return item
                }
            })
            setRect(newArr)
        }
    }

    const mouseMoveRectHandle = (event) => {
        if (rect[rect.length - 1].clickCounter == 1 && isRect) {
            const newArr = rect.map((item, index) => {
                if (index + 1 == rect.length) {
                    return { ...item, width: event.screenX - (item.initX + 270), height: event.screenY - (item.initY + 160) }
                }
                else {
                    return item
                }
            })
            setRect(newArr)
        }
    }

    const submitHandle = () => {
        if (rect[rect.length - 1].clickCounter == 3) {
            const newArr = rect.map((item, index) => {
                if (index + 1 == rect.length) {
                    return { ...item, txt: txt, clickCounter: item.clickCounter + 1 }
                } else {
                    return item
                }
            })
            setRect(newArr)
        }
    }

    const initFun = () => {
        setIsCropImage(false)
        setIsMagnifier(false)
        setIsRect(false)
        setRect([newRect])
        setIsPolygone(false)
    }
    
    const handleAnnotationChange = (annotation) => {
        setAnnotations([annotation]);
    };

    return (
        <div className='super-wrapper' >
            <div className='side-panal'>
                <div className='icon-wrapper'>
                    <div className={`icon-container ${isMagnifier ? 'icon-bg' : ''}`} onClick={() => { initFun(); setIsMagnifier(!isMagnifier) }}><i className="icon bi bi-search"></i></div>
                    <div className='icon-container'><i className="icon bi bi-zoom-in"></i></div>
                    <div className='icon-container'><i className="icon bi bi-zoom-out"></i></div>
                    <div className='icon-container'><i className="icon bi bi-clipboard"></i></div>
                    <div className='icon-container'><i className="icon bi bi-clipboard2-check-fill"></i></div>
                    <div className={`icon-container ${isCropImage ? 'icon-bg' : ''}`} onClick={() => { initFun(); setIsCropImage(!isCropImage) }}><i className="icon bi bi-crop" ></i></div>
                    <div className='icon-container'><i className="icon bi bi-arrow-counterclockwise"></i></div>
                    <div className='icon-container'><i className="icon bi bi-arrow-clockwise"></i></div>
                    <div className={`icon-container ${isRect ? 'icon-bg' : ''}`} onClick={() => { initFun(); setIsRect(!isRect) }}><i className="icon bi bi-square"></i></div>
                    <div className={`icon-container ${isPolygon ? 'icon-bg' : ''}`} onClick={()=>{ initFun(); setIsPolygone(!isPolygon) }} ><img className='pol_icon' src='images/polygon.png' alt='polygone'/></div>
                    <div className='icon-container'><i className="icon bi bi-trash"></i></div>
                </div>
                <div className='sub-panel mx-3 py-3 text-18'>
                    {isMagnifier ? <div>
                        <label onClick={() => openMagnifyGlass(argShow)}>Start Magnifier</label><br/>
                        <label>Stop Magnifier</label>
                    </div> : null}
                    {isCropImage ? <div>
                        <label>Select Image to Crop</label><br/>
                        <label>Store Croped Image</label>
                    </div> : null}
                    {isRect ? <div>
                        <label onClick={() => { addRect() }} >Add Rectangle</label>
                    </div> : null}
                    {/* {isPolygon ? (
                    <div>
                        <label>Add polygon</label><br/>
                        <label onClick={() => setClosePoint(true)}>Close Polygon</label>
                    </div>
                    ) : null} */}
                </div>
            </div>
            <table
                className="responsive"
            >
                <tbody >
                    <tr >
                       <td >
                            <div className='main_wrapper' onClick={(e) => { clickRectHandle(e) }} onMouseMove={(e) => { mouseMoveRectHandle(e) }}>
                                {/* magnifier */}
                                <div onClick={() => removeMagnifire()} className={`img-magnifier-container ${isCropImage?'hide':''}`} >
                                    <img className='mainImg' src={process.env.PUBLIC_URL + "/images/ten.jpg"} id='mainimage' alt='' />
                                </div>
                                {/* rectangle */}
                                {rect.map((item, index) => {
                                    return (<div key={index} className={`rectangle ${item.width == 0 && item.height == 0 ? 'hide' : ''}`}
                                        style={{ width: item.width, height: item.height, left: item.initX + 'px', top: item.initY + 'px', position: 'absolute' }} >

                                        {item.clickCounter == 3 ? <div className='child1'>
                                            Input Description
                                            <input type='text' onChange={(e) => { setTxt(e.target.value) }} />
                                            <button onClick={() => submitHandle()} >Submit</button>
                                        </div> : null}
                                        {item.clickCounter == 4 ? <div className='child2'>{item.txt}</div> : null}

                                    </div>)
                                })}
                                {/* polygon */}
                                {isPolygon ? <Canvas/> : null}
                                {/* Crop */}
                                {isCropImage && 
                    <>
                        <ReactCrop 
                            crop={crop} 
                            onChange={c => setCrop(c)}
                            onComplete={(c) => setCompletedCrop(c)}>
                            <img src={process.env.PUBLIC_URL + "/images/ten.jpg"} style={cropStyle}/>
                        </ReactCrop>
                    </> 
                }

                            </div>
                        </td>
                        <td width={'200px'}  >
                            <div className="panel-group" style={{ marginBottom: '200px', marginTop: '30px' }}>
                                <div className="panel panel-default">
                                    <div style={{ border: '1px solid black', paddingLeft: '10px' }} className="panel-body">Annotations</div>
                                </div>
                                <div className="panel panel-default">
                                    <div className="panel-body">Panel Content</div>
                                </div>
                            </div>
                            <div className="panel-group" style={{ marginBottom: '300px' }}>
                                <div className="panel panel-default">
                                    <div style={{ border: '1px solid black', paddingLeft: '10px' }} className="panel-body">Tags</div>
                                </div>
                                <div className="panel panel-default">
                                    <div className="panel-body">Panel Content</div>
                                </div>
                            </div>
                        </td>
                    </tr>
                    <tr >
                        <td colSpan={3}></td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
};

export default Layout;


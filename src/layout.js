import React, { useState, useCallback, useRef, useEffect } from 'react';
import Annotation from 'react-image-annotation-withdropdown';
import { RectangleSelector } from 'react-image-annotation/lib/selectors';
/* import Annotation from 'react-image-annotation-with-zoom';
import { RectangleSelector } from 'react-image-annotation-with-zoom/lib/selectors'; */
import ReactCrop from 'react-image-crop';
import Magnifier from "react-magnifier";
import Treeview from './components/treeview/treeview';
//import ReactPolygonDrawer from 'react-polygon-drawer';
import Canvas from "./containers/Canvas";

import "cropperjs/dist/cropper.css";
import 'react-image-crop/dist/ReactCrop.css';
import './components/layout/layout.css';
import 'react-checkbox-tree/lib/react-checkbox-tree.css';

const Layout = props => {
    const canvasRef = useRef(null);
    const annotationStackRef = useRef([]);
    const [cropSec, setCropSec] = useState(false)
    const [annotationSec, setAnnotationSec] = useState(false)
    const [magnifierSec, setMegnifierSec] = useState(false)
    const [polygonSec, setPolygonSec] = useState(false);
    const [isPolygon, setIsPolygone] = useState(false);
    const [annotations, setAnnotations] = useState([]);
    const [annotation, setAnnotation] = useState({});
    const [upImg, setUpImg] = useState();
    const imgRef = useRef(null);
    const previewCanvasRef = useRef(null);
    let [crop, setCrop] = useState({ unit: 'px', width: 0, height: 0, x: 0, y: 0 });
    const [completedCrop, setCompletedCrop] = useState(null);
    const [brightness, setBrightness] = useState(100);

    const [scale, setScale] = useState(1);
    const defaultScale = 1.0;
    const [documentSec, setDocumentSec] = useState(false);
    const [imageSec, setImageSec] = useState(false);
    const [videoSec, setVideoSec] = useState(false);
    const [audioSec, setAudioSec] = useState(false);
    const [rangSetting, setRangSetting] = useState(0);
    const [imageCss, setImageCss] = useState('main');
    const [sideBar, setSideBar] = useState('sidebar');
    const [dataFromChild, setDataFromChild] = useState(null);


    // const handleDataFromChild = (data) => {
    //     console.log('Data received from child:', data);
    //     setDataFromChild(data);
    // };



    const handleCallback = (childData) => {
        // Update the name in the component's state
        //  setState({ name: childData })/
        setUpImg(childData)
        alert("Image selected successfully, please select a submenu to render the image")
    }
    //console.log(crop, presentCount);

    // on selecting file we set load the image on to cropper
    const onSelectFile = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const reader = new FileReader();
            reader.addEventListener('load', () => setUpImg(reader.result));
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const onLoad = useCallback((img) => {
        imgRef.current = img;
        // debugger;
        console.log("img ref:", imgRef.current)
    }, []);

    const onChange = (annotation) => {
        setAnnotation(annotation)
    }

    const onSubmit = (annotation) => {
        const { geometry, data } = annotation;
        setAnnotations(
            annotations.concat({
                geometry,
                data: {
                    ...data,
                    id: Math.random(),
                },
            })
        );
        annotationStackRef.current = []; // Clear the redo stack when new annotation is added
    };

    const handleUndo = () => {
        // Access the undo function through the ref
        if (canvasRef.current) {
            canvasRef.current.undo();
        }
    };

    const handleRedo = () => {
        // Access the undo function through the ref
        if (canvasRef.current) {
            canvasRef.current.redo();
        }

    };

    const handleUndoRectangel = () => {
        if (annotations.length > 0) {
            const lastAnnotation = annotations[annotations.length - 1];
            annotationStackRef.current.push(lastAnnotation); // Push the last annotation to the redo stack
            setAnnotations(annotations.slice(0, -1)); // Remove the last annotation from the annotations array
        }
    };

    const handleRedoRectangel = () => {
        if (annotationStackRef.current.length > 0) {
            const redoAnnotation = annotationStackRef.current.pop();
            setAnnotations([...annotations, redoAnnotation]); // Add the redo annotation back to the annotations array
        }
    };

    const zoomIn = () => {
        setScale((prevScale) => prevScale + 0.1);
    };

    const zoomOut = () => {
        const newScale = scale - 0.1;

        if (newScale <= defaultScale) {
            setScale(defaultScale);
        } else {
            setScale(newScale);
        }
    };

    const handleBrightnessChange = event => {
        //console.log("vikas=", event.target.id, event.target.value);    
        setBrightness(event.target.value);
    };

    /**
     * Cropping start
     */
    function generateDownload(canvas, crop) {
        if (!crop || !canvas) {
            return;
        }

        canvas.toBlob(
            (blob) => {
                const previewUrl = window.URL.createObjectURL(blob);

                const anchor = document.createElement('a');
                anchor.download = 'cropPreview.png';
                anchor.href = URL.createObjectURL(blob);
                anchor.click();

                window.URL.revokeObjectURL(previewUrl);
            },
            'image/png',
            1
        );
    }

    function setCanvasImage(image, canvas, crop) {
        if (!crop || !canvas || !image) {
            return;
        }

        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;
        const ctx = canvas.getContext('2d');
        // refer https://developer.mozilla.org/en-US/docs/Web/API/Window/devicePixelRatio
        const pixelRatio = window.devicePixelRatio;

        canvas.width = crop.width * pixelRatio * scaleX;
        canvas.height = crop.height * pixelRatio * scaleY;

        // refer https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/setTransform
        ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
        ctx.imageSmoothingQuality = 'high';

        // refer https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage
        ctx.drawImage(
            image,
            crop.x * scaleX,
            crop.y * scaleY,
            crop.width * scaleX,
            crop.height * scaleY,
            0,
            0,
            crop.width * scaleX,
            crop.height * scaleY
        );
    }
    /**
     * End
     */



    const initDrawer = () => {
        setDocumentSec(false);
        setImageSec(false);
        setVideoSec(false);
        setAudioSec(false);
    }

    useEffect(() => {
        setCanvasImage(imgRef.current, previewCanvasRef.current, completedCrop);
    }, [completedCrop]);


    const onChangeType = (arg) => {
        if (arg === 'crop') {
            setRangSetting(0);
            setMegnifierSec(false);
            setAnnotationSec(false);
            setPolygonSec(false);
            setCropSec(true);
            setPolygonSec(false);
            setBrightness(100);
        } else if (arg === 'rect') {
            setRangSetting(0);
            setCropSec(false);
            setMegnifierSec(false);
            setPolygonSec(false);
            setAnnotationSec(true);
            setPolygonSec(false);
            setBrightness(100);
        } else if (arg === 'magnifier') {
            setRangSetting(0);
            setCropSec(false);
            setAnnotationSec(false);
            setPolygonSec(false);
            setMegnifierSec(true);
            setPolygonSec(false);
            setBrightness(100);
        } else if (arg === 'cls') {
            setCropSec(false);
            setMegnifierSec(false);
            setAnnotationSec(false);
            setPolygonSec(false);
        } else if (arg === 'polygon') {
            setRangSetting(0);
            setMegnifierSec(false);
            setAnnotationSec(false);
            setPolygonSec(false);
            setCropSec(false);
            setPolygonSec(true);
            setBrightness(100);
        } else if (arg === 'brightness') {
            setRangSetting(1);
        }
    }

    const handleMainundo = () => {
        if (annotationSec) {
            handleUndoRectangel();
        }
        if (polygonSec) {
            handleUndo();
        }
    };
    const handleMainRedo = () => {
        if (annotationSec) {
            handleRedoRectangel();
        }
        if (polygonSec) {
            handleRedo();
        }
    };

    return (
        <>
           <div className='align_main_dv'>
           <div className="polaroid">
                <div className="menu">
                    <ul id='menuItems'>
                        <li>
                            <div className='imgClass'><img src={process.env.PUBLIC_URL + "/icons/magnifier_glass_icon.png"} alt="magnifierIcon" width={'30px'} onClick={() => onChangeType('magnifier')} /><br />
                                <span className='iconText'>Magnifine Glass</span></div>
                        </li>
                        <li>
                            <div className='imgClass'><img src={process.env.PUBLIC_URL + "/icons/crop_icon.png"} alt='cropIcon' width={'30px'} onClick={() => { onChangeType('crop'); }} className='imgClass' /><br />
                                <span className='iconText'>crop</span></div>
                        </li>
                        <li>
                            <div className='imgClass'><img src={process.env.PUBLIC_URL + "/icons/design_graphic_rectangle_transform_icon.png"} alt='rectangleIcon' width={'30px'} onClick={() => onChangeType('rect')} /><br />
                                <span className='iconText'>Rectangle BB</span></div>
                        </li>
                        <li>
                            <div className='imgClass'><img src={process.env.PUBLIC_URL + "/icons/polygon_thin_icon.png"} alt='polygonIcon' width={'30px'} onClick={() => { onChangeType('polygon'); setIsPolygone(!isPolygon) }} /><br />
                                <span className='iconText'>Polygon BB</span></div>
                        </li>
                        <li>
                            <div className='imgClass'><img src={process.env.PUBLIC_URL + "/icons/arrow_back_undo_left_navigation_icon.png"} alt='undoIcon' width={'30px'} onClick={() => { handleMainundo() }} /><br />
                                <span className='iconText'>Undo</span></div>
                        </li>
                        <li>
                            <div className='imgClass'><img src={process.env.PUBLIC_URL + "/icons/arrow_forward_redo_navigation_right_icon.png"} alt='redoIcon' width={'30px'} onClick={() => { handleMainRedo() }} /><br />
                                <span className='iconText'>Redo</span></div>
                        </li>
                        <li>
                            <div className='imgClass'><img src={process.env.PUBLIC_URL + "/icons/delete_garbage_icon.png"} alt='deleteIcon' width={'30px'} onClick={() => onChangeType('delete')} /><br />
                                <span className='iconText'>Delete</span></div>
                        </li>
                        <li onClick={() => zoomIn()}>
                            <div className='imgClass'><img src={process.env.PUBLIC_URL + '/icons/zoom_in_icon.png'} alt="zoomin" width={'30px'} /><br />
                                <span className='iconText'>Zoom In</span></div>
                        </li>
                        <li onClick={() => zoomOut()}>
                            <div className='imgClass'><img src={process.env.PUBLIC_URL + '/icons/zoom_out_icon.png'} alt="zoomout" width={'30px'} /><br />
                                <span className='iconText'>Zoom Out</span></div>
                        </li> 
                        <li>
                            <div className='imgClass'><img src={process.env.PUBLIC_URL + "/icons/contrast_brightness_icon.png"} alt='brightness' width={'30px'} onClick={() => onChangeType('brightness')} /><br />
                                <span className='iconText'>Brightness</span></div>
                        </li>

                        <li><button onClick={() => onChangeType('cls')} className='button2'>Close All</button></li>
                    </ul>
                </div>
                <div className={imageCss}>
                    <div>
                        <input className='choose_input' type='file' accept='image/*' onChange={onSelectFile} />
                    </div>
                    {cropSec &&
                        <div style={{ overflow: "auto" }}>
                            <ReactCrop
                                src={upImg}
                                onImageLoaded={onLoad}
                                crop={crop}
                                ruleOfThirds
                                onChange={(c) => setCrop(c)}
                                onComplete={(c) => setCompletedCrop(c)}
                                style={{
                                    width: '1200px',
                                    height: '550px',
                                    transform: `scale(${scale})`,
                                    transformOrigin: "top left",
                                    filter: `brightness(${brightness}%)`,
                                    objectFit: "cover"
                                }}
                            />
                            <div>
                                {/* Canvas to display cropped image */}
                                <canvas
                                    ref={previewCanvasRef}
                                    // Rounding is important so the canvas width and height matches/is a multiple for sharpness.
                                    style={{
                                        /* width: Math.round(completedCrop?.width ?? 0),
                                        height: Math.round(completedCrop?.height ?? 0), */
                                        width: 60,
                                        height: 60,
                                    }}
                                />
                            </div>
                            <button type='button' disabled={!completedCrop?.width || !completedCrop?.height} onClick={() => generateDownload(previewCanvasRef.current, completedCrop)}>
                                Download
                            </button>
                        </div>
                    }
                    {annotationSec &&
                        <div style={{ overflow: "auto" }}>
                            <Annotation
                                src={upImg}
                                annotations={annotations}
                                value={annotation}
                                type={RectangleSelector.TYPE}
                                onChange={onChange}
                                onSubmit={onSubmit}
                                style={{
                                    width: '100%',
                                    height: '650px',
                                    transform: `scale(${scale})`,
                                    transformOrigin: "top left",
                                    filter: `brightness(${brightness}%)`,
                                    objectFit: "cover"
                                }}
                            />
                        </div>
                    }
                    {magnifierSec &&
                        <div style={{ overflow: "auto" }}>
                            <Magnifier
                                src={upImg}
                                zoomFactor={1.5}
                                style={{
                                    mgwidth: "100%",
                                    objectFit: "cover",
                                    transform: `scale(${scale})`,
                                    transformOrigin: "top left",
                                    filter: `brightness(${brightness}%)`,

                                }}
                                id="mainimage"
                                alt=""
                                height={'650px'}
                            />
                        </div>
                    }
                    {polygonSec &&
                        <div style={{ overflow: "auto" }}>
                            {/* <img src={defaultSrc} style={{width: '100%', height: '740px'}} alt='ploygonimg'></img>
                        <ReactPolygonDrawer 
                            width={400} 
                            height={400} 
                        /> */}
                            <Canvas
                                ref={canvasRef}
                                videoSource={upImg}
                                imgBrightness={{
                                    objectFit: "cover",
                                    transform: `scale(${scale})`,
                                    transformOrigin: "top left",
                                    filter: `brightness(${brightness}%)`,
                                }}
                            />
                        </div>
                    }
                    {rangSetting === 1 &&
                        <div>
                            <input
                                type="range"
                                id="brightnessRange"
                                min="0"
                                max="200"
                                value={brightness}
                                onChange={handleBrightnessChange}
                            />
                        </div>}
                </div>
                <div className={sideBar} >
                    <div className="grid-container" style={{backgroundColor:'#473c8a'}}>
                        <div className="item2">
                            <div className='right_icon_wrapper' onClick={() => { initDrawer(); setDocumentSec(true); setImageCss('mainCompress'); setSideBar('sidebarNonAuto'); }}><i className="bi bi-file-earmark-text"></i></div>
                            <div className='right_icon_wrapper' onClick={() => { initDrawer(); setImageSec(true); setImageCss('mainCompress'); setSideBar('sidebarNonAuto'); }}><i className="bi bi-card-image"></i></div>
                            <div className='right_icon_wrapper' onClick={() => { initDrawer(); setVideoSec(true); setImageCss('mainCompress'); setSideBar('sidebarNonAuto'); }}><i className="bi bi-youtube"></i></div>
                            <div className='right_icon_wrapper' onClick={() => { initDrawer(); setAudioSec(true); setImageCss('mainCompress'); setSideBar('sidebarNonAuto'); }}><i className="bi bi-music-note-beamed"></i></div>
                            <div className='right_icon_wrapper'><i className="bi bi-plus-lg"></i></div>
                        </div>
                        <div className="item3 sidebarTab">
                            {documentSec ? <div className='drawer_header'>
                                <label style={{ color: 'white', fontSize: '18px' }}>Document tag</label> <i onClick={() => { setDocumentSec(!documentSec); setImageCss('main'); setSideBar('sidebar'); }} className="bi bi-x-square"></i><br /><br />
                                <Treeview
                                    treeType='doctag'
                                />
                            </div> : null}
                            {imageSec ? <div className='drawer_header'>
                                <label style={{ color: 'white', fontSize: '18px' }}>Image tag</label> <i onClick={() => { setImageSec(!imageSec); setImageCss('main'); setSideBar('sidebar'); }} className="bi bi-x-square"></i><br /><br />
                                <Treeview
                                    // sendDataToParent={handleDataFromChild}
                                    parentCallback={handleCallback}
                                    treeType='imagetag' />
                                        
                                    </div> : null}
                            {videoSec ? <div className='drawer_header'>
                                <label style={{ color: 'white', fontSize: '18px' }}>Video tag</label> <i onClick={() => { setVideoSec(!videoSec); setImageCss('main'); setSideBar('sidebar'); }} className="bi bi-x-square"></i><br /><br />
                                <Treeview />
                            </div> : null}
                            {audioSec ? <div className='drawer_header'>
                                <label style={{ color: 'white', fontSize: '18px' }}>Audio tag</label> <i onClick={() => { setAudioSec(!audioSec); setImageCss('main'); setSideBar('sidebar'); }} className="bi bi-x-square"></i><br /><br />
                                <Treeview />
                            </div> : null}
                        </div>
                        <div className="item5"><br />
                            {documentSec ? <div className='drawer_header sidebarTab'>
                                <label style={{ color: 'white', fontSize: '18px' }}>Cropped/Saved Pictures</label><br /><br />
                                AAAAAAAA
                            </div> : null}
                            {imageSec ? <div className='drawer_header sidebarTab'>
                                <label style={{ color: 'white', fontSize: '18px' }}>Cropped/Saved Pictures</label><br /><br />
                                AAAAAAAA
                            </div> : null}
                            {videoSec ? <div className='drawer_header sidebarTab'>
                                <label style={{ color: 'white', fontSize: '18px' }}>Cropped/Saved Pictures</label><br /><br />
                                AAAAAAAA
                            </div> : null}
                            {audioSec ? <div className='drawer_header sidebarTab'>
                                <label style={{ color: 'white', fontSize: '18px' }}>Cropped/Saved Pictures</label><br /><br />
                                AAAAAAAA
                            </div> : null}
                        </div>
                    </div>
                </div>
            </div>
           </div>
        </>
    )
}

export default Layout;

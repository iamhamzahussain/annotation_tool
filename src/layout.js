import React, { useState, useCallback, useRef, useEffect } from 'react';
import Annotation from 'react-image-annotation';
import { RectangleSelector } from 'react-image-annotation/lib/selectors';
/* import Annotation from 'react-image-annotation-with-zoom';
import { RectangleSelector } from 'react-image-annotation-with-zoom/lib/selectors'; */
import ReactCrop from 'react-image-crop';
import Magnifier from "react-magnifier";
import CheckboxTree from 'react-checkbox-tree';
import FolderTree, { testData } from 'react-folder-tree';
//import ReactPolygonDrawer from 'react-polygon-drawer';
import Canvas from "./containers/Canvas";
import useUndo from "use-undo";
import Detector from './components/objectDetector/Detector'

import "cropperjs/dist/cropper.css";
import 'react-image-crop/dist/ReactCrop.css';
//import "../src/components/cropping/cropping.css";
import './components/layout/layout.css';
import 'react-checkbox-tree/lib/react-checkbox-tree.css';
import { fileSystem as nodes } from '../src/utils/datajson';
import { relative } from 'path-browserify';


const defaultSrc = `${process.env.PUBLIC_URL}/images/six.jpg`;
const Layout = () => {
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
    const [
        countState,
        {
            set: setCount,
            reset: resetCount,
            undo: undoCount,
            redo: redoCount,
            canUndo,
            canRedo
        }
    ] = useUndo({ width: crop.width, height: crop.height, unit: crop.unit, x: crop.x, y: crop.y });

    const [zoom, setZoom] = useState(1);
    const [scale, setScale] = useState(1);
    const { present: presentCount } = countState;
    const defaultScale = 1.0;
    const [documentSec, setDocumentSec] = useState(false);
    const [imageSec, setImageSec] = useState(false);
    const [videoSec, setVideoSec] = useState(false);
    const [audioSec, setAudioSec] = useState(false);
    const [rangSetting, setRangSetting] = useState(0);
    const [imageCss, setImageCss] = useState('main');
    const [sideBar, setSideBar] = useState('sidebar');
    const [checked, setChecked] = useState([
        '/app/Http/Controllers/WelcomeController.js',
        '/app/Http/routes.js',
        '/public/assets/style.css',
        '/public/index.html',
        '/.gitignore',
    ]);
    const [expanded, setExpanded] = useState(['/app']);
    const [isDetector, setIsDetector] = useState(false);
    const [isInsSegment,setIsInsSegment] = useState(false)
    const [input_evt, setInput_evt] = useState()
    const [submenu, setSubmenu] = useState(false)

    const setDropDown = {width:"180px", padding: '5px 8px', margin: '5px', borderRadius: '4px', boxShadow: '2px 2px 4px gray', backgroundColor: '#9ff0e8' }
    const [imgClassify, setImgClassify] = useState(false)
    const [semSegment, setSemSegment] = useState(false)

    // on selecting file we set load the image on to cropper
    const onSelectFile = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            setInput_evt(e)
            // setTempFileData(e);
            const reader = new FileReader();
            reader.addEventListener('load', () => setUpImg(reader.result));
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const onLoad = useCallback((img) => {
        imgRef.current = img;
        console.log(imgRef.current)
    }, []);

    const onChange = (annotation) => {
        setAnnotation(annotation)
    }


    const onSubmit = (annotation) => {
        const { geometry, data } = annotation
        setAnnotations(annotations.concat({
            geometry,
            data: {
                ...data,
                id: Math.random()
            }
        }))
    }

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

    const onCheck = (value) => {
        setChecked(value);
    };

    const onExpand = (value) => {
        setExpanded(value);
    };

    const onTreeStateChange = (state, event) => {
        console.log(state, event);
    }

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
        setCount({ width: crop.width - 10, height: crop.height - 10, unit: crop.unit, x: crop.x - 10, y: crop.y - 10 })
    }
    /**
     * End
     */

    const treeState = {
        name: 'root [half checked and opened]',
        checked: 0.5,   // half check: some children are checked
        isOpen: true,   // this folder is opened, we can see it's children
        children: [
            { name: 'children 1 [not checked]', checked: 0 },
            {
                name: 'children 2 [half checked and not opened]',
                checked: 0.5,
                isOpen: false,
                children: [
                    { name: 'children 2-1 [not checked]', checked: 0 },
                    { name: 'children 2-2 [checked]', checked: 1 },
                ],
            },
        ],
    };

    const initDrawer = () => {
        setDocumentSec(false);
        setImageSec(false);
        setVideoSec(false);
        setAudioSec(false);
    }

    useEffect(() => {
        setCanvasImage(imgRef.current, previewCanvasRef.current, completedCrop);
    }, [completedCrop]);
    const [target, setTarget] = useState('')

    const onChangeType = (arg) => {
        if (arg === 'crop') {
            setRangSetting(0);
            setMegnifierSec(false);
            setAnnotationSec(false);
            setPolygonSec(false);
            setCropSec(true);
            setPolygonSec(false);
            setBrightness(100);
            setIsDetector(false)
        } else if (arg === 'rect') {
            setRangSetting(0);
            setCropSec(false);
            setMegnifierSec(false);
            setPolygonSec(false);
            setAnnotationSec(true);
            setPolygonSec(false);
            setBrightness(100);
            setIsDetector(false)
        } else if (arg === 'magnifier') {
            setRangSetting(0);
            setCropSec(false);
            setAnnotationSec(false);
            setPolygonSec(false);
            setMegnifierSec(true);
            setPolygonSec(false);
            setBrightness(100);
            setIsDetector(false)
        } else if (arg === 'cls') {
            setCropSec(false);
            setMegnifierSec(false);
            setAnnotationSec(false);
            setPolygonSec(false);
            setIsDetector(false)
        } else if (arg === 'polygon') {
            setRangSetting(0);
            setMegnifierSec(false);
            setAnnotationSec(false);
            setPolygonSec(false);
            setCropSec(false);
            setPolygonSec(true);
            setBrightness(100);
            setIsDetector(false)
        } else if (arg === 'brightness') {
            setRangSetting(1);
        } else if (arg === 'detector') {
            setRangSetting(0);
            setMegnifierSec(false);
            setAnnotationSec(false);
            setPolygonSec(false);
            setCropSec(false);
            setPolygonSec(false);
            setBrightness(100);
        }
    }
    
    return (
        <>
            <div className="polaroid">
                <div className="menu">
                    <ul >
                        <li>
                            <div className='imgClass'><img src={process.env.PUBLIC_URL + "/icons/magnifier_glass_icon.png"} alt="magnifierIcon" width={'20px'} onClick={() => onChangeType('magnifier')} /><br />
                                <span className='iconText'>Magnifine Glass</span></div>
                        </li><br />
                        <li>
                            <div className='imgClass'><img src={process.env.PUBLIC_URL + "/icons/crop_icon.png"} alt='cropIcon' width={'20px'} onClick={() => { onChangeType('crop'); }} className='imgClass' /><br />
                                <span className='iconText'>crop</span></div>
                        </li><br />
                        <li>
                            <div className='imgClass'><img src={process.env.PUBLIC_URL + "/icons/design_graphic_rectangle_transform_icon.png"} alt='rectangleIcon' width={'20px'} onClick={() => onChangeType('rect')} /><br />
                                <span className='iconText'>Rectangle BB</span></div>
                        </li><br />
                        <li>
                            <div className='imgClass'><img src={process.env.PUBLIC_URL + "/icons/polygon_thin_icon.png"} alt='polygonIcon' width={'20px'} onClick={() => { onChangeType('polygon'); setIsPolygone(!isPolygon) }} /><br />
                                <span className='iconText'>Polygon BB</span></div>
                        </li><br />
                        <li>
                            <div className='imgClass'><img src={process.env.PUBLIC_URL + "/icons/eye.png"} alt='object Detection' width={'20px'} onClick={() => { onChangeType('detector'); setIsDetector(!isDetector) }} /><br />
                                <span className='iconText'>Detector</span></div>
                        </li><br />
                        <li>
                            <div className='imgClass'><img src={process.env.PUBLIC_URL + "/icons/arrow_back_undo_left_navigation_icon.png"} alt='undoIcon' width={'20px'} onClick={() => { undoCount() }} disabled={!canUndo} /><br />
                                <span className='iconText'>Undo</span></div>
                        </li><br />
                        <li>
                            <div className='imgClass'><img src={process.env.PUBLIC_URL + "/icons/arrow_forward_redo_navigation_right_icon.png"} alt='redoIcon' width={'20px'} onClick={() => { setIsPolygone(!isPolygon) }} /><br />
                                <span className='iconText'>Redo</span></div>
                        </li><br />
                        <li>
                            <div className='imgClass'><img src={process.env.PUBLIC_URL + "/icons/delete_garbage_icon.png"} alt='deleteIcon' width={'20px'} onClick={() => onChangeType('delete')} /><br />
                                <span className='iconText'>Delete</span></div>
                        </li><br />
                        <li onClick={() => zoomIn()}>
                            <div className='imgClass'><img src={process.env.PUBLIC_URL + '/icons/zoom_in_icon.png'} alt="zoomin" width={'20px'} /><br />
                                <span className='iconText'>Zoom In</span></div>
                        </li><br />
                        <li onClick={() => zoomOut()}>
                            <div className='imgClass'><img src={process.env.PUBLIC_URL + '/icons/zoom_out_icon.png'} alt="zoomout" width={'20px'} /><br />
                                <span className='iconText'>Zoom Out</span></div>
                        </li> <br />
                        <li>
                            <div className='imgClass'><img src={process.env.PUBLIC_URL + "/icons/contrast_brightness_icon.png"} alt='brightness' width={'30px'} onClick={() => onChangeType('brightness')} /><br />
                                <span className='iconText'>Brightness</span></div>
                        </li><br />

                        <li><button onClick={() => onChangeType('cls')} className='button2'>Close All</button></li>
                    </ul>
                </div>
                <div style={{ position: 'relative' }}>
                    <div style={{ width: `${submenu ? 182 : 0}px`, height: '100%', backgroundColor: '#ebebeb', overflow: 'hidden' }}>

                        <div style={{width:'180px',cursor: 'pointer', marginTop: '15px',marginRight: '22px',fontFamily:'-moz-initial',backgroundColor:'HighlightText'
                        }} onClick={() => { setImgClassify(!imgClassify); setIsInsSegment(false);setTarget('') }}>
                            <img src={process.env.PUBLIC_URL + "/icons/imgclass.png"} alt="" style={{ width: '18px', marginRight: '6px', }} />Image Classification</div>

                        <div style={{width:'180px',cursor: 'pointer', marginTop: '15px' , backgroundColor:'HighlightText' ,fontFamily:'-moz-initial'}} onClick={() => { setSemSegment(!semSegment); setIsInsSegment(false) }}>
                            <img src={process.env.PUBLIC_URL + "/icons/imgclass.png"} alt="" style={{ width: '18px', marginRight: '6px' }} />Semantic Segmentation</div>

                        <div onClick={()=>{setIsInsSegment(!isInsSegment); setImgClassify(false);setTarget('');setSemSegment(false)}} style={{width:'180px',cursor: 'pointer', marginTop: '15px', backgroundColor:'HighlightText',marginRight: '5px',fontFamily:'-moz-initial' }}>
                            <img src={process.env.PUBLIC_URL + "/icons/imgclass.png"} alt="" style={{ width: '18px', marginRight: '6px' }} />Instance Segmentation</div>

                    </div>
                    <div onClick={() => { setSubmenu(!submenu) }} style={{ width: '20px', height: '35px', backgroundColor: '#e8e6e2', paddingTop: '5px', borderRadius: '7px', top: '240px', right: '-20px', position: 'absolute', zIndex: '50', cursor: 'pointer' }}>
                        {submenu ? <i className="bi bi-caret-left-fill"></i> : <i className="bi bi-caret-right-fill"></i>}
                    </div>
                </div>
                <div className={imageCss}>
                    <div style={{ position: 'absolute', top: '50px', right: '120px', zIndex: '50', }}>
                        {imgClassify ? <><select onChange={(e) => { setTarget(e.target.value); }} style={setDropDown}>
                            <option value={''}></option>
                            <option value={'person'}>Person</option>
                            <option value={'car'}>Car</option>
                            <option value={'traffic light'}>Traffic light</option>
                            <option value={'cat'}>cat</option>
                            <option value={'dog'}>dog</option>
                            <option value={'banana'}>banana</option>
                            <option value={'apple'}>apple</option>
                            <option value={'plant'}>plant</option>
                        </select><br /></> : null}
                        {semSegment ? <select style={setDropDown}>
                            <option value={''}></option>
                            <option value={'color'}>Color</option>
                            <option value={'gender'}>Gender</option>
                            <option value={'age'}>Age</option>
                        </select> : null}
                    </div>
                    <div style={{ marginTop: '-10px', marginBottom: '10px', }}>
                        <input type='file' accept='image/*' onChange={onSelectFile} />
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
                                    width: '100%',
                                    height: '479px',
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
                                    height: '460px',
                                    transform: `scale(${scale})`,
                                    transformOrigin: "top left",
                                    filter: `brightness(${brightness}%)`,
                                    objectFit: "cover"
                                }}
                            />
                        </div>
                    }
                    {magnifierSec &&
                        <div style={{ overflow: "hidden", height: '460px' }}>
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
                                height={'479px'}
                            />
                        </div>
                    }
                    {
                        polygonSec &&
                        <div style={{ overflow: "auto", width: '84vw', height: '460px' }}>
                            <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden" }}>
                                <Canvas
                                    videoSource={upImg}
                                    imgBrightness={{
                                        objectFit: "cover",
                                        transform: `scale(${scale})`,
                                        transformOrigin: "top left",
                                        filter: `brightness(${brightness}%)`,
                                    }}
                                />
                            </div>

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
                    {/* Detector */}
                    {isDetector && <Detector input_evt={input_evt} target={target} isInsSegment={isInsSegment}/>}
                </div>
                <div className={sideBar}>
                    <div className='sidebarOneMenu'>
                        <div className='right_icon_wrapper' onClick={() => { initDrawer(); setDocumentSec(true); setImageCss('mainCompress'); setSideBar('sidebarNonAuto'); }}><img src='./icons/tag.png' /></div>
                        <div className='right_icon_wrapper' onClick={() => { initDrawer(); setImageSec(true); setImageCss('mainCompress'); setSideBar('sidebarNonAuto'); }}><img src='./icons/photo.png' /></div>
                        <div className='right_icon_wrapper' onClick={() => { initDrawer(); setAudioSec(true); setImageCss('mainCompress'); setSideBar('sidebarNonAuto'); }}><img src='./icons/audio-book.png' /></div>
                        <div className='right_icon_wrapper' onClick={() => { initDrawer(); setVideoSec(true); setImageCss('mainCompress'); setSideBar('sidebarNonAuto'); }}><img src='./icons/video.png' /></div>
                        <div className='right_icon_wrapper'><i className="bi bi-plus-lg"></i></div>
                    </div>
                    <div className='sidebarTab'>
                        {documentSec ? <div className='drawer_header'>
                            <label>Document tag</label> <i onClick={() => { setDocumentSec(!documentSec); setImageCss('main'); setSideBar('sidebar'); }} className="bi bi-x-square"></i>
                            <CheckboxTree
                                nodes={nodes}
                                checked={checked}
                                expanded={expanded}
                                onCheck={onCheck}
                                onExpand={onExpand}
                                iconsClass="fa4"
                            />
                        </div> : null}
                        {imageSec ? <div className='drawer_header'>
                            <label>Image tag</label> <i onClick={() => { setImageSec(!imageSec); setImageCss('main'); setSideBar('sidebar'); }} className="bi bi-x-square"></i>
                            <FolderTree
                                data={testData}
                                onChange={onTreeStateChange}
                                style={{ fontSize: '12px' }}
                            />
                        </div> : null}
                        {videoSec ? <div className='drawer_header'>
                            <label>Video tag</label> <i onClick={() => { setVideoSec(!videoSec); setImageCss('main'); setSideBar('sidebar'); }} className="bi bi-x-square"></i></div> : null}
                        {audioSec ? <div className='drawer_header'>
                            <label>Audio tag</label> <i onClick={() => { setAudioSec(!audioSec); setImageCss('main'); setSideBar('sidebar'); }} className="bi bi-x-square"></i></div> : null}
                    </div>
                </div>
            </div>
        </>
    )
}

export default Layout;

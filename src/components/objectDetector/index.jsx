import React, { useRef, useState, useEffect } from "react";
import styled from "styled-components";

import "@tensorflow/tfjs-backend-cpu";
//import "@tensorflow/tfjs-backend-webgl";
import * as cocoSsd from "@tensorflow-models/coco-ssd";

const ObjectDetectorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 30px;
`;

const DetectorContainer = styled.div`
  min-width: 200px;
  height: 440px;

  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
`;

const TargetImg = styled.img`
  height: 100%;
`;

const shade = [
  "aqua",
  "orange",
  "red",
  "white",
  "gray",
  "pink",
  "blue",
  "black",
];
let shadeIdx = [];
const HiddenFileInput = styled.input`
  display: none;
`;

const SelectButton = styled.button`
  padding: 7px 10px;
  border: 2px solid transparent;
  background-color: #fff;
  color: black;
  font-size: 16px;
  font-weight: 500;
  outline: none;
  margin-top: 2em;
  cursor: pointer;
  transition: all 260ms ease-in-out;

  &:hover {
    background-color: transparent;
    border: 2px solid #fff;
    color: #fff;
  }
`;

const TargetBox = styled.div`
  position: absolute;

  left: ${({ x }) => x + "px"};
  top: ${({ y }) => y + "px"};
  width: ${({ width }) => width + "px"};
  height: ${({ height }) => height + "px"};

  border: 4px solid aqua;
  border-radius: 5px;
  background-color: transparent;
  z-index: 20;

  &::before {
    content: "${({ classType, score }) => `${classType} ${score.toFixed(1)}%`}";
    color: #fff;
    font-weight: 500;
    font-size: 18px;
    position: absolute;
    top: -1.5em;
    left: -5px;
  }
`;

export function ObjectDetector({ input_evt, target, isInsSegment }) {
  const fileInputRef = useRef();
  const imageRef = useRef();
  const [imgData, setImgData] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const [objData, setObjData] = useState([]);

  const isEmptyPredictions = !predictions || predictions.length === 0;

  const openFilePicker = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const normalizePredictions = (predictions, imgSize) => {
    if (!predictions || !imgSize || !imageRef) return predictions || [];
    return predictions.map((prediction) => {
      const { bbox } = prediction;
      const oldX = bbox[0];
      const oldY = bbox[1];
      const oldWidth = bbox[2];
      const oldHeight = bbox[3];

      const imgWidth = imageRef.current.width;
      const imgHeight = imageRef.current.height;

      const x = (oldX * imgWidth) / imgSize.width;
      const y = (oldY * imgHeight) / imgSize.height;
      const width = (oldWidth * imgWidth) / imgSize.width;
      const height = (oldHeight * imgHeight) / imgSize.height;

      return { ...prediction, bbox: [x, y, width, height] };
    });
  };

  const detectObjectsOnImage = async (imageElement, imgSize) => {
    let TempArr = [{}];
    TempArr.pop();
    if (target) {
      const model = await cocoSsd.load({});
      const predictions = await model.detect(imageElement, 20);
      const normalizedPredictions = normalizePredictions(predictions, imgSize);
      setPredictions(normalizedPredictions);
      console.log("Predictions: ", predictions);

      if (!isInsSegment && target) {
        normalizedPredictions.map((item) => {
          if (target == item.class) {
            TempArr.push(item);
          }
        });
        setPredictions(TempArr);

        let setArr = [];
        predictions.map((item, idx) => {
          if (!setArr.includes(item.class)) setArr.push(item.class);
        });
        shadeIdx = [];

        predictions.map((item, idx) => {
          setArr.map((setItem, setIdx) => {
            if (item.class == setItem) {
              shadeIdx.push(setIdx);
              console.log(setIdx);
            }
          });
        });
      }
    }else if(isInsSegment){
      const model = await cocoSsd.load({});
      const predictions = await model.detect(imageElement, 10);
      const normalizedPredictions = normalizePredictions(predictions, imgSize);
      setPredictions(normalizedPredictions);
      console.log("Predictions: ", predictions);
    }
  };

  const readImage = (file) => {
    return new Promise((rs, rj) => {
      const fileReader = new FileReader();
      fileReader.onload = () => rs(fileReader.result);
      fileReader.onerror = () => rj(fileReader.error);
      fileReader.readAsDataURL(file);
    });
  };

  const onSelectImage = async (e) => {
    setPredictions([]);
    setLoading(true);

    const file = e.target.files[0];
    const imgData = await readImage(file);
    setImgData(imgData);

    const imageElement = document.createElement("img");
    imageElement.src = imgData;

    imageElement.onload = async () => {
      const imgSize = {
        width: imageElement.width,
        height: imageElement.height,
      };
      await detectObjectsOnImage(imageElement, imgSize);
      setLoading(false);
    };
  };

  useEffect(() => {
    if (input_evt) {
      onSelectImage(input_evt);
    }
  }, [input_evt]);

  return (
    <ObjectDetectorContainer>
      <HiddenFileInput
        type="file"
        ref={fileInputRef}
        onChange={onSelectImage}
      />
      {/* <SelectButton onClick={openFilePicker}> */}
       <div style={{color:'black'}}> {isLoading ? "Recognizing..." : "Select Image & Choose Action"}</div>
      {/* </SelectButton> */}
      <DetectorContainer>
        {imgData && <TargetImg src={imgData} ref={imageRef} />}
        {!isEmptyPredictions &&
          predictions.map((prediction, idx) => (
            <TargetBox
              key={idx}
              x={prediction.bbox[0]}
              y={prediction.bbox[1]}
              style={{
                border: `4px solid ${
                  isInsSegment ? shade[shadeIdx[idx]] : shade[1]
                }`,
              }}
              width={prediction.bbox[2]}
              height={prediction.bbox[3]}
              classType={prediction.class}
              score={prediction.score * 100}
            />
          ))}
      </DetectorContainer>
    </ObjectDetectorContainer>
  );
}

import React,{useEffect} from 'react'
import styled from 'styled-components';
import { ObjectDetector } from './index';

const Detector = ({input_evt,target,isInsSegment}) => {
    const AppContainer = styled.div`
        width: 100%;
        height: 440px;
        // margin-left:250px;
        background-color: white;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: #fff;
        `;

            return (
        <AppContainer>
            <ObjectDetector input_evt={input_evt} target={target} isInsSegment={isInsSegment}/>
        </AppContainer>
    )
}

export default Detector
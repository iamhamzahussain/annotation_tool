import React, { useEffect } from 'react';
import { documentList, imageList } from '../../utils/datajson';
import './treeview.css';

const Treeview = (props) => {
const { treeType } = props;
let listItem = [];




useEffect(()=> {
  const handleClick = (event) => {
     const togglerElement = event.target;
     const parentElement = togglerElement.parentElement;
     const nestedElement = parentElement.querySelector('.nested');
     if (nestedElement) {
      nestedElement.classList.toggle("active");
    }
     togglerElement.classList.toggle('caret-down');
  };

  const togglerElements = document.getElementsByClassName('caret');
  for(let i=0; i<togglerElements.length; i++) {
     togglerElements[i].addEventListener('click', handleClick);
  }
  return () => {
    for(let i=0; i<togglerElements.length; i++) {
      togglerElements[i].removeEventListener('click', handleClick);
    }
  };
}, []);

if(treeType === 'doctag') {
   listItem = documentList;
} else if(treeType === 'imagetag') {
  listItem = imageList;
}

const onTrigger = (event) => {
  const imgUri=event.target.getAttribute('data-imgurl')
  console.log("item value:", imgUri)
  if(imgUri){
    // Call the parent callback function
    props.parentCallback(imgUri);
  }
  event.preventDefault();
}

const renderNestedList = (items) => {
  return (
    <ul className="nested">
      {items.map((item, index) => (
        <li key={index}>
          <span className="caret" data-imgurl={item.imgUri} onClick={onTrigger}>{item.label}</span>
          {item.children && renderNestedList(item.children)}
        </li>
      ))}
    </ul>
  );
};

  return (
     <div>
        <ul id="myUL">
        {listItem.map((item, index) => (
          <li key={index}>
            <span className="caret" >&#128194;{item.label} </span>
            {item.children && renderNestedList(item.children)}
            
          </li>
        ))}
        </ul>
     </div>
  )
}

export default Treeview;

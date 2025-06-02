import React, { useEffect, useRef, useState } from 'react';
import './collectionCategory.css';
import {levelsByCategory, collectionNames} from '../../levels';
import { useSwipeable } from 'react-swipeable';

type CollectionCategoryProps = {
  onClose: () => void
  category: string
  categoryIndex: number
}


const CollectionCategory: React.FC<CollectionCategoryProps> = ({onClose, category, categoryIndex}) => {
    const [index, setIndex] = useState(categoryIndex);
    console.log(index);
    const getLeftButton = () => {
      if(index === 0) return;
      setIndex(index - 1);
    }
    const getRightButton = () => {
      if(index === levelsByCategory[category].length - 1) return;
      setIndex(index + 1);
    }
    const handlers = useSwipeable({
      onSwipedLeft: () => getRightButton(),
      onSwipedRight: () => getLeftButton(),
      trackTouch: true,
      preventDefaultTouchmoveEvent: true,
    });
    const [isClosing, setIsClosing] = useState(false);
    const closeModal = () => {
      setIsClosing(true);
      setTimeout(() => {
        onClose();
      }, 350);
    }

    return (
    <div className={`modal-bg modal-collection-category ${isClosing ? 'collection-category_closing' : ''}`}>
      <div className="blackout" onClick={closeModal}></div>
      <div className="collection-category-container" {...handlers}>
        <div className="collection-category-main">

          <div className="collection-category-main-title">
            <div className="collection-category-main-title-center">
              <div className={`collection-category-main-title-icon collection-category-main-title-icon_${category}`}></div>
              <div className="collection-category-main-title-text">
                {collectionNames[category as keyof typeof collectionNames]}
              </div>
            </div>
            <div className="modal-close" onClick={onClose}></div>
          </div>

            <div className='rules-track'>
              <div className="slide">
                  <div className="collection-category-main-quote">
                  «{levelsByCategory[category][index].text}»  
                  </div>
                  <div className="collection-category-main-bottom">
                    <div className="collection-category-main-count">
                      {index + 1}/{levelsByCategory[category].length}
                    </div>
                    <div className="collection-category-main-author">
                      <div className="collection-category-main-author-name">{levelsByCategory[category][index].name}</div>
                      <div className="collection-category-main-author-desc">{levelsByCategory[category][index].desc}</div>
                    </div>
                  </div>
              </div>
            </div>
          


        </div>     
        <div className="collection-category-buttons">
          <div 
            className={`collection-category-buttons-button ${index === 0 ? 'collection-category-buttons-button_disabled' : ''}`}
            onClick={getLeftButton}
          >
          </div>
          <div
            className={`collection-category-buttons-button collection-category-buttons-button_right ${index === levelsByCategory[category].length - 1 ? 'collection-category-buttons-button_disabled' : ''}`}
            onClick={getRightButton}
           >
          </div>
        </div>
        
      </div>
    </div>
  );
}

export default CollectionCategory; 
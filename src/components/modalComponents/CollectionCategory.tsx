import React, { useEffect, useRef, useState } from 'react';
import './collectionCategory.css';
import {levelsByCategory, collectionNames, LevelData, namesDescs} from '../../levels';
import { useSwipeable } from 'react-swipeable';
import { getTextForLevelEnd } from '../Phrase';
import { useTranslation } from 'react-i18next';
import { gpBannerSize, isCopyAvailable } from '../../main';
import { useHasScroll } from '../hooks/useHasScroll';
type CollectionCategoryProps = {
  onClose: () => void
  category: string
  categoryIndex: number
  copyFunction: (collectionData: {text: string, name: string, desc: string}) => void
  collectionLevelData?: {
    text: string
    name: string
    desc: string
  } | LevelData
}

const CollectionCategory: React.FC<CollectionCategoryProps> = ({onClose, category, categoryIndex, copyFunction,
  collectionLevelData = null
}) => {
    const [index, setIndex] = useState(categoryIndex > 0 ? categoryIndex - 1 : 0);
    const [collectionData, setCollectionData] = useState<{text: string, name: string, desc: string}>({
      text: levelsByCategory[category][index].text,
      name: levelsByCategory[category][index].name,
      desc: levelsByCategory[category][index].desc
    });
    const { t } = useTranslation();
    const ref = useRef<HTMLDivElement>(null);
    const hasScroll = useHasScroll(ref);
    
    useEffect(() => {
      if(collectionLevelData) {
        setCollectionData(collectionLevelData);
      }
    }, [collectionLevelData]);

    useEffect(() => {
      if(!collectionLevelData) {
        setCollectionData({
          text: levelsByCategory[category][index].text,
          name: levelsByCategory[category][index].name,
          desc: levelsByCategory[category][index].desc
        });
      }
    }, [index, category]);

    const getLeftButton = () => {
      if(index === 0) return;
      setIndex(index - 1);
    }
    const getRightButton = () => {
      if(categoryIndex === 0 || index === (categoryIndex-1) ||
        index === levelsByCategory[category].length - 1) return;
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

    const copyPhrase = () => {
      if(collectionData) {
        copyFunction(collectionData);
      } else {
        copyFunction(levelsByCategory[category][index]);
      }
    }

    return (
    <div className={`modal-bg modal-collection-category ${isClosing ? 'collection-category_closing' : ''}`}>
      <div className="blackout" onClick={closeModal}></div>
      <div className={`collection-category-container ${gpBannerSize > 0 ? 'miniModal' : ''}`} {...handlers}>
        <div className={`collection-category-main ${collectionLevelData ? 'collection-category-main_oneLevel' : ''}`}>

          <div className="collection-category-main-title">
            <div className="collection-category-main-title-center">
              <div className={`collection-category-main-title-icon collection-category-main-title-icon_${category}`}></div>
              <div className="collection-category-main-title-text">
                {t(category)}
              </div>
            </div>
            <div className="modal-close" onClick={closeModal}></div>
          </div>

            <div className='rules-track'>
              <div className="slide">
                  <div  ref={ref} className={`
                    collection-category-main-quote
                    ${hasScroll ? 'hasScroll' : ''}
                     ${collectionData.text.length > 150 ?
                      'collection-category-main-quote_small' : ''}`}>
                        {categoryIndex === 0 ?
                        t('collection-category-text') :
                        getTextForLevelEnd(collectionData.text)}
                  </div>
                  {categoryIndex !== 0 &&
                  <div className="collection-category-main-bottom">
                    <div className="collection-category-main-count"
                       style={{ opacity: collectionLevelData ? '0' : '1' }}
                    >
                      {index + 1}/{categoryIndex}
                    </div>
                    <div className="collection-category-main-author">
                      
                        <div>
                          <div className="collection-category-main-author-name">{collectionData.name}</div>
                          <div className="collection-category-main-author-desc">
                            {namesDescs[collectionData.name as keyof typeof namesDescs]
                             || collectionData.desc}
                          </div>
                        </div>
                      

                      {isCopyAvailable && <div className="game-main_copyButton" onClick={copyPhrase}></div>}
                    </div>
                  </div>
                  }
              </div>
            </div>
          


        </div>     
        {!collectionLevelData && <div className="collection-category-buttons">
          <div 
            className={`collection-category-buttons-button ${index === 0 ? 'collection-category-buttons-button_disabled' : ''}`}
            onClick={getLeftButton}
          >
          </div>
          <div
            className={`collection-category-buttons-button collection-category-buttons-button_right
              ${(index === levelsByCategory[category].length - 1) ||
                (index === (categoryIndex-1)) || categoryIndex === 0
              ? 'collection-category-buttons-button_disabled' : ''}`}
            onClick={getRightButton}
           >
          </div>
        </div>}
        
      </div>
    </div>
  );
}

export default CollectionCategory; 
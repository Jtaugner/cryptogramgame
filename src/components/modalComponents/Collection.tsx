import React, { useState } from 'react';
import './collection.css';
import { UserDataProps } from '../../App';
import Modal from './Modal';
import { typesOfCategories, levels, levelsByCategory, collectionNames, LevelData} from '../../levels';
import CollectionCategory from './CollectionCategory';
import { useTranslation } from 'react-i18next';

type CollectionProps = {
  userData: UserDataProps,
  onClose: () => void;
  copyFunction: (levelData: LevelData) => void;
};

function findTypesCount(untilLevel?: number) {
  //Создаём объект для хранения количества уровней в каждой категории
  let collectionTypesCount: { [key: string]: number } = {};
  typesOfCategories.forEach(type => {
    collectionTypesCount[type] = 0;
  }); 
  //Считаем количество уровней в каждой категории
  let max = untilLevel !== undefined ? untilLevel : levels.length;
  for(let i = 0; i < max; i++){
    collectionTypesCount[levels[i].type]++;
  }
  return collectionTypesCount;
}


const Collection: React.FC<CollectionProps> = ({userData, onClose, copyFunction }) => {
  const [userTypesCount, setUserTypesCount] = useState(findTypesCount(userData.lastLevel));
  const [showCollectionCategory, setShowCollectionCategory] = useState(false);
  const [categoryType, setCategoryType] = useState('quotes');

  const { t } = useTranslation();

  const openCollectionCategory = (type: string) => {
    setCategoryType(type);
    setShowCollectionCategory(true);
  }
  
  return (
    <>
        <Modal
          title={t('collection')}
          modalClassName="modal-collection"
          onClose={onClose}>
            <div className="modal-section">
            {typesOfCategories.map((item, index) => (
                <div className="modal-shop-row" key={'shop-item-' + index}>
                  <div className={`modal-collection-icon modal-collection-icon_${item}`}>
                  </div>
                  <div className="modal-shop-row-name">{t(item)}</div>
                  <div
                    className={`modal-shop-row-price`}
                    onClick={() => openCollectionCategory(item)}
                    >
                    <div className="modal-collection-book-icon"></div>
                    <div className="modal-collection-value">{userTypesCount[item]}/{levelsByCategory[item].length}</div>
                  </div>
                </div>
              ))}
            </div>
        </Modal>
        {showCollectionCategory && (
            <CollectionCategory
              onClose={() => setShowCollectionCategory(false)}
              category={categoryType}
              categoryIndex={userTypesCount[categoryType]}
              copyFunction={copyFunction}
            />
          )}
    </>
  )
}

export default Collection; 
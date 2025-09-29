import React, { useEffect, useState } from 'react';
import './rating.css';
import {scrollIntoViewY, UserDataProps } from '../../App';
import Modal from './Modal';
import { getLeaderboard, setUserToLeaderboard } from '../../main';
import { useTranslation } from 'react-i18next';
type RatingProps = {
  userData: UserDataProps,
  onClose: () => void;
};
type RatingItem = {
  score: number,
  rank: number,
  player: {
    getAvatarSrc: (size: string) => string,
    publicName: string
  }
}

const ratingTest = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];


const Rating: React.FC<RatingProps> = ({userData, onClose }) => {
  const [rating, setRating] = useState<RatingItem[] | null>(null);
  const [userRank, setUserRank] = useState<number>(-1);
  const { t } = useTranslation();

  useEffect(() => {
    getLeaderboard((res: any) => {
      setRating(res.entries);
      if(res.userRank){
        setUserRank(res.userRank);
      }
      //Тест результата юзера
      res.entries.forEach((item: any) => {
        if(item.rank === userRank){
          if(userData.statistics.iq > item.score){
            setUserToLeaderboard(userData.statistics.iq);
          }
        }
      })


      //Скролл до юзера
      setTimeout(() => {
        try{
          let scrollEl = document.querySelector('.rating-row-player');
          scrollIntoViewY(document.querySelector('.modal-wrapper'), scrollEl, { behavior: 'smooth', align: 'start' });
          // if(scrollEl) scrollEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }catch(ignored){}
      }, 700)
    })
  }, [])
  return <Modal
   title={t('rating') + ' IQ'}
   modalClassName="modal-rating"
   onClose={onClose}>
        <div className="modal-section">
        {rating === null ?
        ratingTest.map((_, i) =>
            <div
              className="rating-row skeleton-row"
              key={'sceleton-row-' + i}
            >
              <div className="rating-row-left">
                <div className="rating-row-icon"></div>
              </div>
            </div>
          )
        :
        rating.map((item, index) => (
            <div
             className={`
              rating-row
               ${item.rank === userRank ? 'rating-row-player' : ''}
               ${item.rank === 20 ? 'lastInTop' : ''}
            `}
             key={'rating-row-' + index}
             >
              <div className="rating-row-left">
                <div
                style={{
                  background: `url(${item.player.getAvatarSrc('medium')}) center center no-repeat`,
                  backgroundSize: '100%'
                }}
                className={`rating-row-icon ${!item.player.getAvatarSrc('medium') ? 'rating-row-icon_empty' : ''}`}
                
                ></div>
                <div className="rating-row-name">{item.player.publicName === "" ? 'Anonymous' : item.player.publicName}</div>
              </div>
            
              <div className="rating-row-score">
                <span className="rating-row-score-value">{item.score} </span>
                IQ
              </div>
              <div
               className={`rating-row-rank rating-row-rank_${item.rank}`}>
                {item.rank > 3 ? item.rank : ''}
                </div>
            </div>
          ))}
        </div>
  </Modal>
};

export default Rating; 
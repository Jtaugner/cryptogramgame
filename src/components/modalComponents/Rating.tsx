import React, { useState } from 'react';
import './rating.css';
import {UserDataProps } from '../../App';
import Modal from './Modal';

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
const ratingTest = [
  {
    score: 256,
    rank: 1,
    player: {
      getAvatarSrc: () => '',
      publicName: 'Блаблашка Икаровна'
    }
  },
  {
    score: 254,
    rank: 2,
    player: {
      getAvatarSrc: () => '',
      publicName: 'Блаблашка Икаровна'
    }
  },
  {
    score: 250,
    rank: 3,
    player: {
      getAvatarSrc: () => '',
      publicName: 'Блаблашка Икаровна'
    }
  },
  {
    score: 250,
    rank: 4,
    player: {
      getAvatarSrc: () => '',
      publicName: 'Якорный Собачонок'
    }
  },
  {
    score: 250,
    rank: 5,
    player: {
      getAvatarSrc: () => '',
      publicName: 'Блаблашка Икаровна'
    }
  },
  {
    score: 250,
    rank: 6,
    player: {
      getAvatarSrc: () => '',
      publicName: 'Блаблашка Икаровна'
    }
  },
  {
    score: 250,
    rank: 7,
    player: {
      getAvatarSrc: () => '',
      publicName: 'Блаблашка Икаровна'
    }
  }
];

const playerRait =   {
  score: 250,
  rank: 4,
  player: {
    getAvatarSrc: () => '',
    publicName: 'Якорный Собачонок'
  }
}

const Rating: React.FC<RatingProps> = ({userData, onClose }) => {
  const [rating, setRating] = useState<RatingItem[]>(ratingTest);
  return <Modal
   title="РЕЙТИНГ IQ"
   modalClassName="modal-rating"
   onClose={onClose}>
        <div className="modal-section">
        {rating.map((item, index) => (
            <div
             className={`rating-row ${item.rank === playerRait.rank ? 'rating-row-player' : ''}`}
             key={'rating-row-' + index}
             >
              <div className="rating-row-left">
                <div className="rating-row-icon"></div>
                <div className="rating-row-name">{item.player.publicName}</div>
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
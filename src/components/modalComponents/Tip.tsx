import React, { useEffect, useState } from 'react';
import './tip.css';
import Lottie from 'react-lottie-player';
import nerdData from '../../Hi/Nerd.json'
import danceData from '../../Hi/Dance.json'
import sadData from '../../Hi/Sad.json'

const allCharacters = {
  "nerd": nerdData,
  "dance": danceData,
  "sad": sadData,
}
interface TipProps {
  character: string,
  tipClassName?: string,
  children?: React.ReactNode,
  notShow?: boolean,
  onClick?: () => void
}
const Tip: React.FC<TipProps> = ({children, character, tipClassName, notShow, onClick}) => {
  const getCharacter = () => {
    if(allCharacters[character as keyof typeof allCharacters]){
      return allCharacters[character as keyof typeof allCharacters]
    }
    return allCharacters['nerd']
  }
  const [isShow, setIsShow] = useState(true);

  useEffect(() => {
    if(!notShow){
      setIsShow(true)
    }
  }, [notShow])
  return <div
          className={`tip-text ${tipClassName} ${notShow ? 'tip-text_notShow' : ''}`}
          onTransitionEnd={(e) => {if(notShow)setIsShow(false)}}
          onClick={onClick}
          >
            {children}
            {isShow && 
            <div className="tip-character">
              <Lottie
                          loop         // зациклить
                          play         // сразу запускать
                          animationData={getCharacter()}
                          
                      />
            </div>
            }

        </div>
};

export default Tip; 
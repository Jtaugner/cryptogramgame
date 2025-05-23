import React from 'react';
import './tip.css';
import Lottie from 'react-lottie-player';
import nerdData from '../../Hi/Nerd.json'
import danceData from '../../Hi/Dance.json'

const allCharacters = {
  "nerd": nerdData,
  "dance": danceData,
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
  return <div
          className={`tip-text ${tipClassName} ${notShow ? 'tip-text_notShow' : ''}`}
          onClick={onClick}
          >
            {children}
            <div className="tip-character">
            <Lottie
                        loop         // зациклить
                        play         // сразу запускать
                        animationData={getCharacter()}
                        
                    />
            </div>
        </div>
};

export default Tip; 
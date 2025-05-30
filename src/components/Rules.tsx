import React, { useEffect, useRef, useState } from 'react';
import './rules.css';
import Phrase from './Phrase';
import { LevelDataProps } from '../App';
import { useSwipeable } from 'react-swipeable';

type RulesProps = {
  onClose: () => void
}
const levelPhraseRules = {
  text:"ИГРА ПРОСТА",
  numbers:[1,2,7,8,0,8,7,4,5,6,8],
  hiddenIndexes:[3,6],
  filledLetters:{},
  completedNumbers:new Set([1,2,4,5,6])
};
const levelPhraseRules2 = {
  text:"ШИНШИЛЛА ПИЩИТ",
  numbers:[6,4,3,6,4,1,1,5,0,8,4,5,4,9],
  hiddenIndexes:[1,4,10,13],
  filledLetters:{},
  completedNumbers:new Set([3,5,6,1,5,8])
};
const rulesTexts = [
  {
    id: 'phrase-step-1',
    title: 'Число - это буква',
    text: <span>Каждое число относится к букве. <br></br>К примеру, <span className="rules-text-important">8</span> - это <span className="rules-text-important">А</span></span>,
    levelRules: levelPhraseRules
  },
  {
    id: 'phrase-step-advice',
    title: 'Совет',
    text: 'Сначала заполните те клетки, числа которых вы уже знаете',
    levelRules: levelPhraseRules2
  },
  {
    id: 'phrase-step-3',
    title: 'Бустер «Расстановщик»',
    text: 'Бла-блашка',
    levelRules: levelPhraseRules
  }
]
const Rules: React.FC<RulesProps> = ({onClose }) => {
  const [ruleStep, setRuleStep] = useState(0);

  const nextStep = () => {
    if((ruleStep+1) >= rulesTexts.length){
      onClose();
    }else{
      setRuleStep(ruleStep + 1);
    }
  }
  const changeSlide = (dir: string) => {
    setRuleStep((prev) =>
      dir === 'next'
        ? (prev + 1) % rulesTexts.length
        : (prev - 1 + rulesTexts.length) % rulesTexts.length
    );
  };
  const handlers = useSwipeable({
    onSwipedLeft: () => changeSlide('next'),
    onSwipedRight: () => changeSlide('prev'),
    trackTouch: true,
    preventDefaultTouchmoveEvent: true,
  });

    return (
    <div className={`modal-bg modal-rules`}>
      <div className="blackout" onClick={onClose}></div>
      <div className="rules" {...handlers}>
            <div
              className="rules-track"
              style={{ transform: `translateX(-${ruleStep * 100}%)` }}
            >
              {rulesTexts.map((rulesText, i) => (
                <div className="slide" key={rulesText.id}>
                      <div className="rules-title">
                        {rulesText.title}
                      </div>
                      <div className="rules-main">
                        <Phrase 
                            key={rulesText.id + '-phrase'}
                            data={rulesText.levelRules}
                            onError={() => {}}
                            onLetterFill={() => {}}
                            onCompleteNumber={() => {}}
                            blockedTime={0}
                            isTipSelecting={false}
                            useTip={() => {}}
                            isLevelCompleted={false}
                            level={i}
                            isFromRules={true}
                            adviceStepFromRules={rulesText.id === 'phrase-step-advice'}
                          />
                      </div>
                      <div className="rules-text">
                        {rulesText.text}
                      </div>
                </div>
              ))}
            </div>
        <div className="rules-steps">
          {[...Array(rulesTexts.length)].map((_, index) => (
            <div className={`rules-step ${index === ruleStep ? 'rules-step-active' : ''}`} key={index} onClick={() => setRuleStep(index)}></div>
          ))}
        </div>
        <div className="rules-button" onClick={nextStep}>
          {ruleStep === rulesTexts.length - 1 ? 'ИГРАТЬ' : 'ДАЛЕЕ'}
        </div>
      </div>
    </div>
  );
}

export default Rules; 
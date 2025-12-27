import React, { useEffect, useRef, useState } from 'react';
import './rules.css';
import Phrase from './Phrase';
import { LevelDataProps } from '../App';
import { useSwipeable } from 'react-swipeable';
import { useTranslation } from 'react-i18next';
import {levelPhraseRules} from './rulesPhrases'
import { gpBannerSize } from '../main';

type RulesProps = {
  onClose: () => void
  gameMode?: string
  gameLanguage: string
}

const mainRulesTextIDs = [0, 1, 1, 2];
const rulesDicesTextIDs = [0, 1, 2];

let mainRulesTexts = [
  {
    id: 'phrase-step-1',
    title: 'rules-step-1',
    text: 'rules-step-1-text',
    levelRules: levelPhraseRules.ru[mainRulesTextIDs[0]]
  },
  {
    id: 'phrase-step-2',
    title: 'rules-step-2',
    text: 'rules-step-2-text',
    levelRules: levelPhraseRules.ru[mainRulesTextIDs[1]]
  },
  {
    id: 'phrase-step-keyboard',
    title: 'rules-step-3',
    text: 'rules-step-3-text',
    levelRules: levelPhraseRules.ru[mainRulesTextIDs[2]]
  },
  {
    id: 'phrase-step-advice',
    title: 'rules-step-4',
    text: 'rules-step-4-text',
    levelRules: levelPhraseRules.ru[mainRulesTextIDs[3]]
  }
]
let rulesDicesTexts = [
  {
    id: 'phrase-step-1',
    title: 'rulesDice-step-1',
    text: 'rulesDice-step-1-text',
    levelRules: levelPhraseRules.ru[rulesDicesTextIDs[0]]
  },
  {
    id: 'phrase-step-2',
    title: 'rulesDice-step-2',
    text: 'rulesDice-step-2-text',
    levelRules: levelPhraseRules.ru[rulesDicesTextIDs[1]]
  },
  {
    id: 'phrase-step-advice',
    title: 'rulesDice-step-3',
    text: 'rulesDice-step-3-text',
    levelRules: levelPhraseRules.ru[rulesDicesTextIDs[2]]
  }
]
let dailyRulesTexts = [
  {
    id: 'phrase-step-1',
    title: 'dailyTask',
    text: 'daily-rules-step-1-text',
    levelRules: levelPhraseRules.ru[mainRulesTextIDs[0]]
  }
]
const Rules: React.FC<RulesProps> = ({onClose, gameMode = 'default', gameLanguage}) => {
  const [ruleStep, setRuleStep] = useState(0);
  const { t } = useTranslation();
  const [rulesTexts, setRulesTexts] = useState(null);

  useEffect(() => {
    let newRulesText;
    if(gameMode === 'dice'){
      newRulesText = rulesDicesTexts.map((rule, index) => {
        rule.levelRules = levelPhraseRules[gameLanguage as keyof typeof levelPhraseRules][rulesDicesTextIDs[index]];
        return rule;
      });
    }else if(gameMode === 'glagolitic'){
      newRulesText = dailyRulesTexts.map((rule, index) => {
        rule.levelRules = levelPhraseRules[gameLanguage as keyof typeof levelPhraseRules][mainRulesTextIDs[index]];
        return rule;
      });
    }else{
      newRulesText = mainRulesTexts.map((rule, index) => {
        rule.levelRules = levelPhraseRules[gameLanguage as keyof typeof levelPhraseRules][mainRulesTextIDs[index]];
        return rule;
      });
    }



    setRulesTexts(newRulesText);
  }, []);

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
      <div className={`rules ${gpBannerSize > 0 ? 'miniModal' : ''}`} {...handlers}>
        {
           rulesTexts && 
           <div className="rules-wrap">
              <div
                className="rules-track"
                style={{ transform: `translateX(-${ruleStep * 100}%)` }}
              >
                {rulesTexts.map((rulesText, i) => (
                  <div className="slide" key={rulesText.id}>
                        <div className="rules-title">
                          {t(rulesText.title)}
                        </div>
                        <div className={`rules-main ${rulesText.id === 'phrase-step-keyboard' ? 'rules-main-keyboard' : ''}`}>
                          {rulesText.id === 'phrase-step-keyboard' ?
                            <div className={`rules-keyboard rules-keyboard_${gameLanguage}`}></div>
                          :
                          <Phrase 
                              key={rulesText.id + '-phrase'}
                              data={rulesText.levelRules}
                              onError={() => {}}
                              onLetterFill={() => {}}
                              onCompleteNumber={() => {}}
                              blockedTime={0}
                              isTipSelecting={false}
                              useTip={() => {}}
                              gameMode={gameMode}
                              isLevelCompleted={false}
                              level={i}
                              isFromRules={true}
                              adviceStepFromRules={rulesText.id === 'phrase-step-advice'}
                              gameLanguage={gameLanguage}
                            />
                          }
                        </div>
                        <div className="rules-text"
                         dangerouslySetInnerHTML={{ __html: t(rulesText.text) }}>
                        </div>
                  </div>
                ))}
              </div>
          <div className="rules-steps">
            {[...Array(rulesTexts.length)].map((_, index) => (
              <div className={`rules-step ${index === ruleStep ? 'rules-step-active' : ''}`} key={index} onClick={() => setRuleStep(index)}></div>
            ))}
          </div>
          <div className="rules-button shiny-button" onClick={nextStep}>
            {ruleStep === rulesTexts.length - 1 ? t('play') : t('next')}
          </div>
        </div>
        }
        
      </div>
    </div>
  );
}

export default Rules; 
import React, { useState } from 'react';
import './settings.css';
import { UserDataProps } from '../../App';
import Modal from './Modal';
import Rules from '../Rules';
import { useTranslation } from 'react-i18next';
type SettingsProps = {
  userData: UserDataProps,
  onClose: () => void;
  setUserData: (userData: UserDataProps) => void;
  onHome?: () => void;
  diceMode?: boolean;
  openedFromGame?: boolean;
  gameLanguage: string;
};

const Settings: React.FC<SettingsProps> = ({userData, onClose, setUserData, onHome,
   diceMode = false, openedFromGame = false, gameLanguage}) => {
  const [showRules, setShowRules] = useState(openedFromGame);
  const { t } = useTranslation();
  const changeSettings = (newSettings: object) => {
    setUserData({
      ...userData,
      settings: {
        ...userData.settings,
        ...newSettings
      }
    })
  }
  return <>
      <Modal
            title={t('settings')}
            modalClassName="modal-settings"
            onClose={onClose}
            >
              <div className="modal-settings-row">
                <span className="modal-settings-row-text">{t('sounds')}</span>
                <label className="switch">
                  <input type="checkbox" checked={userData.settings.sounds} onChange={() => changeSettings({sounds: !userData.settings.sounds})}/>
                  <span className="slider">
                    <span className="label off">{t('off')}</span>
                    <span className="label on">{t('on')}</span>
                    <span className="circle"></span>
                  </span>
                </label>
              </div>
              <div className="modal-settings-row">
                <span className="modal-settings-row-text">{t('music')}</span>
                <label className="switch">
                  <input type="checkbox" checked={userData.settings.music} onChange={() => changeSettings({music: !userData.settings.music})}/>
                  <span className="slider">
                    <span className="label off">{t('off')}</span>
                    <span className="label on">{t('on')}</span>
                    <span className="circle"></span>
                  </span>
                </label>
              </div>
              <div className="modal-settings-row">
                <span className="modal-settings-row-text">{t('arrowLeft')}</span>
                <label className="switch">
                  <input type="checkbox" checked={userData.settings.arrowLeft} onChange={() => changeSettings({arrowLeft: !userData.settings.arrowLeft})}/>
                  <span className="slider">
                    <span className="label off">{t('off')}</span>
                    <span className="label on">{t('on')}</span>
                    <span className="circle"></span>
                  </span>
                </label>
              </div>
              <div className="modal-settings-row modal-settings-row_rules" onClick={() => setShowRules(true)}>
                <span className="modal-settings-row-text">{t('howToPlay')}</span>
                <div className='modal-settings-row-icon'></div>
              </div>
              {onHome && (
                <div
                 className="modal-settings-row modal-settings-row_important"
                 onClick={onHome}
                >
                  <span className="modal-settings-row-text">{t('home')}</span>
                  <div className='modal-settings-row-icon modal-settings-row-icon_home' onClick={onHome}></div>
                </div>
              )}
          </Modal>
    {showRules &&
     <Rules
     gameLanguage={gameLanguage}
     onClose={() => {
      if(openedFromGame){
        onClose();
      }else{
        setShowRules(false)
      }
    }}
     diceMode={diceMode}
     />}
    </>
}

export default Settings; 
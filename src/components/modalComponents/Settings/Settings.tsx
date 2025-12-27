import React, { useState } from 'react';
import './settings.css';
import { UserDataProps } from '../../../App';
import Modal from '../Modal';
import Rules from '../../Rules';
import { useTranslation } from 'react-i18next';
import Language from './Language';
import { useAutoFontSizeWithNearElement } from '../../hooks/useAutoFontSizeWithNearElement';
type SettingsProps = {
  userData: UserDataProps,
  onClose: () => void;
  setUserData: (userData: UserDataProps) => void;
  onHome?: () => void;
  gameMode?: string;
  openedFromGame?: boolean;
  gameLanguage: string;
};

const settingsRows: Array<keyof UserDataProps['settings']> = [
  'sounds', 'music', 'arrowLeft', 'autoScroll'
]

const Settings: React.FC<SettingsProps> = ({userData, onClose, setUserData, onHome,
   gameMode = 'default', openedFromGame = false, gameLanguage}) => {
  const [showRules, setShowRules] = useState(openedFromGame);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const { t } = useTranslation();
  const changeSettings = (newSettings: object) => {
    console.log(newSettings);
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
              {
                settingsRows.map(row => {
                  const ref = useAutoFontSizeWithNearElement<HTMLDivElement>();
                  const ref2 = useAutoFontSizeWithNearElement<HTMLDivElement>();
                  return(
                  <div
                   className={`modal-settings-row`}
                    key={row}
                  >
                    <span className="modal-settings-row-text">{t(row)}</span>
                    <label className="switch">
                      <input type="checkbox" checked={userData.settings[row]} onChange={() => changeSettings({[row]: !userData.settings[row]})}/>
                      <span className="slider">
                        {
                          userData.settings[row] ? (
                            <span className="label on" ref={ref2}>{t('on')}</span>
                          ) : (
                            <span className="label off" ref={ref}>{t('off')}</span>
                          )
                        }
                        <span className="circle"></span>
                      </span>
                    </label>
                  </div>
                )})
              }
              {/* Язык можно открыть только в меню */}
              {!onHome && (
                <div
                 className="modal-settings-row modal-settings-row_important"
                 onClick={() => setShowLanguageModal(true)}
                >
                  <span className="modal-settings-row-text">{t('language')}</span>
                  <div className='modal-settings-row-icon modal-settings-row-icon_language'></div>
                </div>
              )}
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
                  <div className='modal-settings-row-icon modal-settings-row-icon_home'></div>
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
    gameMode={gameMode}
     />}
     {showLanguageModal &&
      <Language
      userData={userData}
      setUserData={setUserData}
      gameLanguage={gameLanguage}
      onClose={() => setShowLanguageModal(false)}
      />
     }
    </>
}

export default Settings; 
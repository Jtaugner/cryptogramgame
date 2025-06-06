import React, { useState } from 'react';
import './settings.css';
import { UserDataProps } from '../../App';
import Modal from './Modal';
import Rules from '../Rules';

type SettingsProps = {
  userData: UserDataProps,
  onClose: () => void;
  setUserData: (userData: UserDataProps) => void;
  onHome?: () => void;
};

const Settings: React.FC<SettingsProps> = ({userData, onClose, setUserData, onHome }) => {
  const [showRules, setShowRules] = useState(false);
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
            title="НАСТРОЙКИ"
            modalClassName="modal-settings"
            onClose={onClose}>
              <div className="modal-settings-row">
                <span className="modal-settings-row-text">Звуки</span>
                <label className  ="switch">
                  <input type="checkbox" checked={userData.settings.sounds} onChange={() => changeSettings({sounds: !userData.settings.sounds})}/>
                  <span className="slider">
                    <span className="label off">ВЫК</span>
                    <span className="label on">ВКЛ</span>
                    <span className="circle"></span>
                  </span>
                </label>
              </div>
              <div className="modal-settings-row">
                <span className="modal-settings-row-text">Музыка</span>
                <label className="switch">
                  <input type="checkbox" checked={userData.settings.music} onChange={() => changeSettings({music: !userData.settings.music})}/>
                  <span className="slider">
                    <span className="label off">ВЫК</span>
                    <span className="label on">ВКЛ</span>
                    <span className="circle"></span>
                  </span>
                </label>
              </div>
              <div className="modal-settings-row">
                <span className="modal-settings-row-text">Стрелочки слева</span>
                <label className="switch">
                  <input type="checkbox" checked={userData.settings.arrowLeft} onChange={() => changeSettings({arrowLeft: !userData.settings.arrowLeft})}/>
                  <span className="slider">
                    <span className="label off">ВЫК</span>
                    <span className="label on">ВКЛ</span>
                    <span className="circle"></span>
                  </span>
                </label>
              </div>
              <div className="modal-settings-row modal-settings-row_rules" onClick={() => setShowRules(true)}>
                <span className="modal-settings-row-text">Как играть?</span>
                <div className='modal-settings-row-icon'></div>
              </div>
              {onHome && (
                <div
                 className="modal-settings-row modal-settings-row_important"
                 onClick={onHome}
                >
                  <span className="modal-settings-row-text">Домой</span>
                  <div className='modal-settings-row-icon modal-settings-row-icon_home' onClick={onHome}></div>
                </div>
              )}
          </Modal>
    {showRules && <Rules onClose={() => setShowRules(false)}/>}
    </>
}

export default Settings; 
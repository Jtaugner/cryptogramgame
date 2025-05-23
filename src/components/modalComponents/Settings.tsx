import React from 'react';
import './settings.css';
import { UserDataProps } from '../../App';
import Modal from './Modal';

type SettingsProps = {
  userData: UserDataProps,
  onClose: () => void;
  setUserData: (userData: UserDataProps) => void;
  onHome?: () => void;
};

const Settings: React.FC<SettingsProps> = ({userData, onClose, setUserData, onHome }) => {
  const changeSounds = () => {
    setUserData({
      ...userData,
      settings: {
        ...userData.settings,
        sounds: !userData.settings.sounds
      }
    })
  }
  const changeMusic = () => {
    setUserData({
      ...userData,
      settings: {
        ...userData.settings,
        music: !userData.settings.music
      }
    })
  }
  return <Modal
            title="НАСТРОЙКИ"
            modalClassName="modal-settings"
            onClose={onClose}>
              <div className="modal-settings-row">
                <span className="modal-settings-row-text">Звуки</span>
                <label className  ="switch">
                  <input type="checkbox" checked={userData.settings.sounds} onChange={changeSounds}/>
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
                  <input type="checkbox" checked={userData.settings.music} onChange={changeMusic}/>
                  <span className="slider">
                    <span className="label off">ВЫК</span>
                    <span className="label on">ВКЛ</span>
                    <span className="circle"></span>
                  </span>
                </label>
              </div>
              <div className="modal-settings-row modal-settings-row_rules">
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
}

export default Settings; 
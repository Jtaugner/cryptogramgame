import React, { useState, useEffect } from 'react';
import './language.css';
import { UserDataProps } from '../../../App';
import Modal from '../Modal';
import { useTranslation } from 'react-i18next';
import { recreateApp } from '../../../main';
type SettingsProps = {
  userData: UserDataProps,
  onClose: () => void;
  setUserData: (userData: UserDataProps) => void;
  gameLanguage: string;
};

const defaultLanguageRows: Array<{id: string, name: string}> = [
  {id: 'en', name: 'English'},
  {id: 'fr', name: 'Français'},
  {id: 'es', name: 'Español'},
  {id: 'it', name: 'Italiano'},
  {id: 'de', name: 'Deutsch'},
  {id: 'ru', name: 'Русский'},
]

const allLangsTexts = {
  "ru": {
    "areYouSure": "Вы уверены, что хотите изменить язык?",
    "yes": "Да",
    "no": "Нет"
  },
  "en": {
    "areYouSure": "Are you sure you want to change the language?",
    "yes": "Yes",
    "no": "No"
  },
  "fr": {
    "areYouSure": "Êtes-vous sûr de vouloir changer de langue ?",
    "yes": "Oui",
    "no": "Non"
  },
  "es": {
    "areYouSure": "¿Estás seguro de querer cambiar de idioma?",
    "yes": "Sí",
    "no": "No"
  },
  "it": {
    "areYouSure": "Sei sicuro di voler cambiare lingua?",
    "yes": "Sì",
    "no": "No"
  },
  "de": {
    "areYouSure": "Sind Sie sicher, dass Sie die Sprache ändern möchten?",
    "yes": "Ja",
    "no": "Nein"
  }
}

function moveIdToStart(arr: Array<{id: string, name: string}>, targetId: string) {
  const index = arr.findIndex(item => item.id === targetId);
  if (index === -1) return arr;          // нет такого id — ничего не делаем

  const item = arr[index];
  const without = arr.filter((_, i) => i !== index);
  return [item, ...without];
}

const Language: React.FC<SettingsProps> = ({userData, onClose, setUserData, gameLanguage}) => {
  const { t } = useTranslation();
  const [chosenLang, setChosenLang] = useState(gameLanguage);
  const [languageRows, setLanguageRows] = useState(defaultLanguageRows);
  const [isShowConfirmChange, setIsShowConfirmChange] = useState(false);
  useEffect(() => {
    setLanguageRows(moveIdToStart(defaultLanguageRows, gameLanguage));
  }, [gameLanguage]);

  const changeLang = () => {
    if(chosenLang === gameLanguage) return;
    recreateApp(chosenLang);
  }
  const closeConfirmWindow = () => {
    setIsShowConfirmChange(false);
    setChosenLang(gameLanguage);
  }
  const clickOnLang = (lang: string) => {
    if(chosenLang === lang) return;
    setIsShowConfirmChange(true);
    setChosenLang(lang);
  }
  return <>
      <Modal
            title={t('language')}
            modalClassName="modal-settings modal-language"
            onClose={onClose}
            >
             <div className="modal-language__languages">
              {
                languageRows.map(row => (
                  <div
                   className={`modal-settings-row ${chosenLang === row.id ? 'modal-settings-row_chosen' : ''}`}
                    key={row.id}
                    onClick={() => clickOnLang(row.id)}
                  >
                    <span className="modal-settings-row-text">{row.name}</span>
                  </div>
                ))
              }
              </div>
              {/* <div className="modal-settings-row modal-settings-row_rules" onClick={changeLang}>
                <span className="modal-settings-row-text">{t('choose')}</span>
                <div className='modal-settings-row-icon modal-settings-row-icon_choose'></div>
              </div> */}
              {isShowConfirmChange && <div className="blackout" onClick={closeConfirmWindow}></div>}
              {isShowConfirmChange && <div className="modal-language__confirm-change">
                <div className="modal-title">
                  <div className="modal-close notVisibleClose"></div>
                  {t('confirm')}
                  <div className="modal-close" onClick={closeConfirmWindow}></div>
                </div>
                <div className="modal-language__confirm-change-text">
                  {t('areYouSure')}
                  </div>
                <div className="modal-language__confirm-change-text">
                  {allLangsTexts[chosenLang as keyof typeof allLangsTexts].areYouSure}
                </div>
                <div className='modal-language__confirm-change-buttons'>
                  <div
                   className="modal-language__confirm-change-button modal-language__confirm-change-button_no"
                   onClick={closeConfirmWindow}
                  >
                    {t('no')}/{allLangsTexts[chosenLang as keyof typeof allLangsTexts].no}
                  </div>
                  <div
                   className="modal-language__confirm-change-button"
                   onClick={changeLang}
                  >
                    {t('yes')}/{allLangsTexts[chosenLang as keyof typeof allLangsTexts].yes}
                  </div>
                </div>
              </div>}
          </Modal>
    </>
}

export default Language; 
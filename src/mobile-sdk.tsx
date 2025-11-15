import { switchOffAllMusic, switchOnAllMusic } from './main.tsx';

// Для управления звуком и музыкой при рекламе
// switchOffAllMusic(); надо вызывать перед показом рекламы
// switchOnAllMusic(); надо вызывать после закрытия рекламы

export function mobileShowFullscreenAd(){
    console.log('mobileShowFullscreenAd');
}
export function mobileShowRewardedAd(callBack: () => void){
     //При удачном просмотре вызывать колбэк
     console.log('mobileShowRewardedAd');
 }
export function mobileBackButtonClick(){
    window.dispatchEvent(new Event("back-button-click"));
}
//Добавить юзера в рейтинг
export function addUserToRating(iq: number){

}
//Открыть рейтинг
export function openRating(callback: (res: any) => void){

}
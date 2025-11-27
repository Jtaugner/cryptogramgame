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
    if(__PLATFORM__ === 'mobile'){
        try{
            if (window.Android && window.Android.addUserToRating) {
                window.Android.addUserToRating(iq);
            }
        }catch(e){}
    }
}
//Открыть рейтинг
export function openRating(){
    if(__PLATFORM__ === 'mobile'){
        try{
            if (window.Android && window.Android.openRating) {
                window.Android.openRating();
            }
        }catch(e){}
    }
}

export function paramsForMobile(language: string, data: any){
    if(__PLATFORM__ === 'mobile'){
        try{
            Android.reportEventWithParams(language, JSON.stringify(data))
        }catch(e){}
    }
}
export function mobileSaveData(data: any){
    console.log('saveData', data);
}

export function mobileShowFullscreenAd(){
    console.log('mobileShowFullscreenAd');
}
export function mobileShowRewardedAd(callBack: () => void){
     //При удачном просмотре вызывать колбэк
     console.log('mobileShowRewardedAd');
 }

export function hideBanner(){
    console.log('hideBanner');
}

export function showInterstitial(){
    console.log('showInterstitial');
}
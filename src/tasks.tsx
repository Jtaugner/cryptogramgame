const taskTypes = ['levels', 'time', 'levelWithoutMistake'];
const taskTypesNames = {
     levels: 'Пройдено уровней',
     time: 'Время в игре (мин)',
     levelWithoutMistake: 'Побед без ошибок'
}
export const getTaskName = (type: string) => {
     return taskTypesNames[type as keyof typeof taskTypesNames];
}
export const getMinutesFromSeconds = (seconds: number) => {
  return Math.floor(seconds / 60);
}
export const copyObject = (obj: any) => {
  return JSON.parse(JSON.stringify(obj));
}
export const testTasksPassed = (tasks: {
     [key: string]: {
          now: number,
          goal: number,
          taskCompleted: boolean
     }
}) => {
  let levelPassed = true;
  Object.keys(tasks).forEach(task => {
    if(tasks[task].now < tasks[task].goal){
      levelPassed = false;
    }
  })
  return levelPassed;
}
function getTimeUntillNextTask(iq: number) {
  if(iq < 5){
   return 15;
  }else if(iq < 10){
   return 30;
  }else if(iq < 20){
   return 60;
  }else if(iq < 30){
   return 120;
  }else if(iq < 50){
   return 360;
  }else if(iq < 70){
   return 720;
  }
  return 1440;
}
function getTask(type: string, iq: number) {
  if(type === 'levels'){
    if(iq < 10){
     return 3;
    }else if(iq < 20){
     return 4;
    }else if(iq < 40){
     return 5;
    }else if(iq < 60){
     return 7;
    }else if(iq < 150){
     return 10;
    }
    return 12;
  }
  if(type === 'time'){
    if(iq < 5){
     return 10;
    }else if(iq < 10){
     return 20;
    }else if(iq < 25){
     return 30;
    }else if(iq < 50){
     return 40;
    }else if(iq < 100){
     return 60;
    }
    return 80;
  }
  if(type === 'levelWithoutMistake'){
    if(iq < 10){
     return 1;
    }else if(iq < 100){
     return 2;
    }
    return 3;
  }
  return 1;
}
export const getTasks = (iq: number) => {
  const taskObject = {
     tasks: {} as any,
     time: getTimeUntillNextTask(iq)
  };
  taskTypes.forEach(type => {
    taskObject.tasks[type] = {
     goal: getTask(type, iq),
     now: 0,
     taskCompleted: false
    }
  })
  return taskObject;
}
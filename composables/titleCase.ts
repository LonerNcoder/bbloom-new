export const titleCase = (str: string) => {
    let upper = true;
    let result = "";
    for(let i = 0, l = str.length; i < l ;  i++){
      if(str[i] === " "){
        upper = true;
        result += " ";
        continue;
      }
      result += upper ? str[i].toUpperCase() : str[i].toLowerCase();
      upper = false;
    }
    return result;
  } 
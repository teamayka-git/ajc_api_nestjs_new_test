export class IndexUtils {
  public multipleIndex(array,data) {

    var indexes = [], i = -1;
    while ((i = array.indexOf(data, i+1)) != -1){
        indexes.push(i);
    }
    return indexes;


  }



  public multipleIndexChat(array,data) {

    var indexes = [], i = -1;
    while ((i = array.indexOf(it=>it.userId==data, i+1)) != -1){
        indexes.push(i);
    }
    return indexes;


  }

 
  

}

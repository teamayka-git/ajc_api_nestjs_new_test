export class IndexUtils {




  public multipleIndexChat(array,data) {

    var indexes = [];
   
    
array.map((mapItem,index)=>{
  if(mapItem.userId==data){
    indexes.push(index);
  }
  
});




    return indexes;


  }




  
  public multipleIndexSetSubProcess(array,data) {

    var indexes = [];
   
    
array.map((mapItem,index)=>{
  if(mapItem._processMasterId==data){
    indexes.push(index);
  }
  
});




    return indexes;


  }

 
  

}

export enum GuardUserRole{
    SUPER_ADMIN="super_admin",
    AGENT="agent",
    SUPPLIER="supplier"
}



export class GuardUserRoleStringGenerate {
    public generate(userRoleNumber: number): string {
     
        var userRole="";
        switch(userRoleNumber){
            case 0:userRole=GuardUserRole.SUPER_ADMIN;break;
            case 1:userRole=GuardUserRole.AGENT;break;
            case 2:userRole=GuardUserRole.SUPPLIER;break;
            }

return userRole;
    }
  
   
  }
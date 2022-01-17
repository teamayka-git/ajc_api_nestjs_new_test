export enum GuardUserRole{
    SUPER_ADMIN="super_admin"
}



export class GuardUserRoleStringGenerate {
    public generate(userRoleNumber: number): string {
     
        var userRole="";
        switch(userRoleNumber){
            case 0:userRole=GuardUserRole.SUPER_ADMIN;break;
            }

return userRole;
    }
  
   
  }
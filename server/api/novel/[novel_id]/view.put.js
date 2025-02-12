import { verifyUserId } from "~/server/utils";
import prisma from "~/prisma/middleware/reads_and_views.js";


export default eventHandler(async (event) =>{
    
    const {user_id, novel_id} = await readBody(event);
    const user_exists = await verifyUserId(parseInt(user_id));
    if(user_exists){
        try{
            await prisma.novelView.create({
                data:{
                    userId: parseInt(user_id),
                    novelId: parseInt(novel_id)
                }
            })
        }catch(e){
            console.log(e)
        }
    }
    return {statusCode: 200}
})
import {PrismaClient} from "@prisma/client"
import {defineEventHandler, readBody} from "h3"
import {verifyUser} from "~/server/utils"
const prisma = new PrismaClient()

export default defineEventHandler(async(event) =>{

    const isVerified = await verifyUser(event)
    if(!isVerified){
        throw createError({
            statusCode: 401,
            statusMessage: "You are not Authorized!"
        })
    }
    const novel_id = parseInt(event.context.params.novel_id)
    const { make_private} = await readBody(event)
    const user_id = event.context.session.user.id
    try{
        //update the novel, filter it by novel id and uploader or authorid
        await prisma.novel.update({
            where:{
                id: novel_id,
                OR:[{uploaderId: user_id}, {authorId: user_id}]
            },
            data:{isPrivate: Boolean(make_private)}
        })
        console.log("Novel's visibility updated")
    }catch{
        throw createError({
            statusCode: 400,
            statusMessage: "Failed to update novel's visibility"
        })
    }
    return {statusCode:200, statusMessage: "OK"}


})
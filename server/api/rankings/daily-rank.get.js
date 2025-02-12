import {defineEventHandler} from "h3";

export default defineEventHandler(async (event) => {
    const metadata = getQuery(event);
    const page = metadata.page || 1;
    const limit = metadata.limit || 10;
    const skip = (page - 1) * limit;

    const novels = await prisma.novel.findMany({
        orderBy: {
            dailyViews: "desc"
        },
        skip,
    })

    return {novels : novels, total: novels.length, currentPage: page, totalPages: Math.ceil(novels.length / limit)}
})
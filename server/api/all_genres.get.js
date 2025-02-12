// h3 get call to get all genres

import { getGenres } from "~/server/utils";
import { defineEventHandler } from "h3";

export default defineEventHandler(async (event) => {

    const genres = await getGenres();

    return {
        statusCode: 200,
        body: genres,
    };
})
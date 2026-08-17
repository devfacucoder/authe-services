import { createClient } from "redis";
import dotenv from "dotenv";
dotenv.config();
import { logger } from "./logger.config.js";
export const redisClient = createClient({
    url: `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379} `
})

redisClient.on("connect", () => {
    logger.info("redis connected")
})


redisClient.on("error", (errr) => {
    logger.error("redis error connection: ",errr)
})

await redisClient.connect();


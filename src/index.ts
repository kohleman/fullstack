import "reflect-metadata";
import { MikroORM } from "@mikro-orm/core"
import { __prod__ } from "./constants";
import { Post } from "./entities/Post";
import { User } from "./entities/User";
import mikroConfig from "./mikro-orm.config";
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { UserResolver } from "./resolvers/user";
import { PostResolver } from "./resolvers/post";

import redis from 'redis';
import session from 'express-session';
import connectRedis from 'connect-redis';

const main = async() => {

    const orm = await MikroORM.init(mikroConfig);
    await orm.getMigrator().up();

    const app  = express();

    const RedisStore = connectRedis(session);
    const redisClient = redis.createClient();

    redisClient.on("error", (error) => {
        console.error(error);
      });


    app.use(
        session({
            name: 'dude',
            store: new RedisStore({client: redisClient, disableTouch: true, disableTTL: true}),
            cookie: {
                maxAge: 1000 * 60 * 60 * 24 * 365 * 20, // 20 years
                httpOnly: true,
                secure: __prod__,
                sameSite: 'lax',
            },
            secret: "some stupid",
            resave: false,
            saveUninitialized: false
        })
    )

    const apolloServer = new ApolloServer ({
        schema: await buildSchema({
            resolvers: [UserResolver, User, PostResolver, Post],
            validate: false,
        }),
        context: ({req, res}) => ({ em: orm.em, req, res})
    })

    apolloServer.applyMiddleware({ app });

    app.get("/", (_, res) => {
        res.send("hello");
    })
    app.listen(4000, () => {
        console.log('express server started on localhost:4000')
    })

    // const post = orm.em.create(Post, {title: "First Post"});
    // await orm.em.persistAndFlush(post);

    // const posts = await orm.em.find(Post, {});
    // console.log(posts);

}


main();
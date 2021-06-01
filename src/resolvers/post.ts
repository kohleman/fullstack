import { Post } from "../entities/Post";
import { Resolver, Query, Ctx, Arg, ID, Mutation } from "type-graphql";
import { MyContext } from "../types";

@Resolver()
export class PostResolver {
    @Query(() => [Post])  // GraphQL type
    posts( @Ctx() {em}: MyContext): Promise<Post[]> {
        return em.find(Post, {});
    }

    @Query(() => Post, {nullable: true}) // GraphQL type
    post(
        @Arg('id', () => ID) id: number,
        @Ctx() {em}: MyContext): Promise<Post | null> {
        return em.findOne(Post, { id });
    }

    @Mutation(() => Post) // GraphQL type
    async createPost(
        @Arg('title') title: string,
        @Ctx() {em}: MyContext): Promise<Post> {
            const post = em.create(Post, {title})
            await em.persistAndFlush(post);
            return post;
    }

    @Mutation(() => Post, {nullable: true}) // GraphQL type
    async updatePost(
        @Arg('id', () => ID) id: number,
        @Arg('title') title: string,
        @Ctx() {em}: MyContext): Promise<Post | null> {
            const postToUpdate = await em.findOne(Post, { id })
            if (!postToUpdate) {
                return null;
            }
            postToUpdate.title = title;
            await em.persistAndFlush(postToUpdate);
            return postToUpdate;
    }

    @Mutation(() => Boolean) // GraphQL type which we expect to be returned
    async deletePost(
        @Arg('id', () => ID) id: number,
        @Ctx() {em}: MyContext): Promise<boolean> {
            // or use em.nativeDelete()
            const postToDelete = await em.findOne(Post, { id })
            if (!postToDelete) {
                return false;
            }
            await em.removeAndFlush(postToDelete);
            return true;
    }


}
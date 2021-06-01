import { User } from "../entities/User";
import { MyContext } from "src/types";
import { Arg, Ctx, Field, InputType, Mutation, Query, Resolver, ID, ObjectType } from "type-graphql";
import argon2 from 'argon2';

@InputType()
class UserNamePasswordInput {
    @Field()
    username: string

    @Field(() => String)
    password: string;
}

@ObjectType()
class FieldError{
    @Field()
    field: string;
    @Field()
    message: string;

}

@ObjectType()
class UserResponse {
    @Field(() => [FieldError], {nullable: true})
    errors?: FieldError [];

    @Field(() => User, {nullable: true})
    user?: User;

}


@Resolver()
export class UserResolver {

    @Query(() => User, {nullable: true})
    async me (@Ctx() { req, em }: MyContext) {
        if (!req.session.userId) {
            return null;
        }

        console.log(req.session)
        const user = await em.findOne(User, { id: req.session.userId });
        return user;
    }


    @Mutation(() => UserResponse)
    async register(
        @Arg('options') options: UserNamePasswordInput,
        @Ctx() { em, req, res }: MyContext
    ): Promise<UserResponse> {
        if (options.username.length <= 2) {
            return {
                errors: [{
                    field: 'username',
                    message: 'username too short! Must be greater than 2'
                }]
            };
        }
        if (options.password.length <= 5) {
            return {
                errors: [{
                    field: 'password',
                    message: 'password too short! Must be greater than 5'
                }]
            };
        }


        const hashedPassword = await argon2.hash(options.password);
        const user = em.create(User, {
            username: options.username,
            password: hashedPassword
        });

        const userExists = await this.userByName(options.username, { em, req, res })

        if (userExists) {
            return { errors: [{
                field: 'username',
                message: "Existing User! Please choose different username."
            }]};
        }
        else {
            await em.persistAndFlush(user);
        }

        // set cookie
        req.session!.userId = user.id;
        return { user };

    }

    @Mutation(() => UserResponse)
    async login(
        @Arg('options') options: UserNamePasswordInput,
        @Ctx() { em, req }: MyContext
    ) :Promise<UserResponse> {
        const user = await em.findOne(User, {username: options.username.toLowerCase()})
        if (!user) {
            return {
                errors: [{
                    field: "username",
                    message: "username does not exist"
                }],
            };
        }
        const valid = await argon2.verify(user.password, options.password);
        if (!valid) {
            return {
                errors: [{
                    field: "password",
                    message: "invalid password"
                }],
            };
        }

        req.session!.userId = user.id;
        req.session!.userName = user.username;


        return {
            user
        };
    }


    @Query(() => User, {nullable: true}) // GraphQL type
    userById(
        @Arg('id', () => ID) id: number,
        @Ctx() {em}: MyContext): Promise<User | null> {
        return em.findOne(User, { id });
    }

    @Query(() => User, {nullable: true}) // GraphQL type
    userByName(
        @Arg('username', () => String) username: string,
        @Ctx() {em}: MyContext): Promise<User | null> {
        return em.findOne(User, { username });
    }


}

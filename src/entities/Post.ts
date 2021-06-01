import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { ObjectType, Field, ID } from "type-graphql";

@ObjectType()
@Entity()
export class Post {

    @Field(() => ID)  // this decorator exposes the field in the GraphQL API
    @PrimaryKey()
    id!: number;

    @Field(() => String)  // here we explicitly set the type for GraphQL to String as there is not Date
    @Property({type: 'date'})
    createdAt = new Date();

    @Field(() => String)
    @Property({ type: 'date', onUpdate: () => new Date()})
    upddatedAt = new Date();

    @Field()
    @Property({type: 'text'})
    title!: string;

}


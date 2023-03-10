import { Entity, Column, PrimaryGeneratedColumn, JoinColumn, ManyToOne } from "typeorm";
import { Users } from "./users.schema";
import { Posts } from "./posts.schema";

@Entity()
export class Comments {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false })
    content: string;

    @Column({ nullable: false })
    createdAt: Date;

    @ManyToOne(() => Users)
    @JoinColumn({ name: "commentOwnerUserId" })
    commentOwnerUserId: Users;

    @Column({ name: "commentOwnerUserLogin" })
    commentOwnerUserLogin: string;

    @ManyToOne(() => Posts)
    @JoinColumn({ name: "postId" })
    post: Posts;
}

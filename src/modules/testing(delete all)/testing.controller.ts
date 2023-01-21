import { Controller, Delete, HttpCode } from "@nestjs/common";
import { SkipThrottle } from "@nestjs/throttler";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { BlogClass } from "../../schemas/blogs.schema";
import { PostClass } from "../../schemas/posts.schema";
import { CommentClass } from "../../schemas/comments.schema";
import { UserAccountClass } from "../../schemas/users.schema";

@SkipThrottle()
@Controller("testing")
export class TestingController {
    constructor(
        @InjectModel(BlogClass.name) private blogsModelClass: Model<BlogClass>,
        @InjectModel(PostClass.name) private postsModelClass: Model<PostClass>,
        @InjectModel(CommentClass.name) private commentsModelClass: Model<CommentClass>,
        @InjectModel(UserAccountClass.name) private userAccountModelClass: Model<UserAccountClass>,
    ) {}

    @Delete("/all-data")
    @HttpCode(204)
    async deleteBlog(): Promise<boolean> {
        await this.blogsModelClass.deleteMany({});
        await this.postsModelClass.deleteMany({});
        await this.commentsModelClass.deleteMany({});
        await this.userAccountModelClass.deleteMany({});
        return true;
    }
}

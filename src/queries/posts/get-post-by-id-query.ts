import { IQueryHandler, QueryBus, QueryHandler } from "@nestjs/cqrs";
import { PostViewModelClass } from "../../entities/posts.entity";
import { PostsQueryRepository } from "../../query-repositories/posts.query.repository";
import { PostsFactory } from "../../factories/posts.factory";
import { BlogsQueryRepository } from "../../query-repositories/blogs.query.repository";

export class GetPostByIdCommand {
    constructor(public readonly id: string, public readonly userId: string | undefined) {}
}

@QueryHandler(GetPostByIdCommand)
export class GetPostByIdQuery implements IQueryHandler<GetPostByIdCommand> {
    constructor(
        private postsQueryRepository: PostsQueryRepository,
        private queryBus: QueryBus,
        private blogsQueryRepository: BlogsQueryRepository,
    ) {}

    async execute(query: GetPostByIdCommand): Promise<PostViewModelClass | null> {
        const post = await this.postsQueryRepository.getPostById(Number(query.id), query.userId);
        if (!post) {
            return null;
        }
        const blog = await this.blogsQueryRepository.getBlogById(Number(post.blogId));
        if (!blog || blog.isBanned) return null;
        return PostsFactory.createPostViewModelClass(post);
    }
}

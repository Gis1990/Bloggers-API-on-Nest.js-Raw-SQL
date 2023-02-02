import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { BlogsQueryRepository } from "../../query-repositories/blogs.query.repository";
import { ModelForGettingAllBlogs } from "../../dtos/blogs.dto";
import { BlogViewModelClassPagination } from "../../entities/blogs.entity";
import { BlogsFactory } from "../../factories/blogs.factory";

export class GetAllBlogsForSuperAdminCommand {
    constructor(public readonly dto: ModelForGettingAllBlogs) {}
}

@QueryHandler(GetAllBlogsForSuperAdminCommand)
export class GetAllBlogsForSuperAdminQuery implements IQueryHandler<GetAllBlogsForSuperAdminCommand> {
    constructor(private blogsQueryRepository: BlogsQueryRepository) {}

    async execute(query: GetAllBlogsForSuperAdminCommand): Promise<BlogViewModelClassPagination> {
        const result = await this.blogsQueryRepository.getAllBlogsForSuperAdmin(query.dto);
        return await BlogsFactory.createBlogViewModelPaginationClass(result);
    }
}

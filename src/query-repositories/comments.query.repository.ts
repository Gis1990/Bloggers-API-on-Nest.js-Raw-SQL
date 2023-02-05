import { CommentsClass } from "../schemas/comments.schema";
import { CommentClassPaginationDto, ModelForGettingAllComments } from "../dtos/comments.dto";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";

export class CommentsQueryRepository {
    constructor(@InjectDataSource() private dataSource: DataSource) {}

    async getCommentById(id: string, userId: number | undefined): Promise<CommentsClass | null> {
        let correctId;
        if (id) {
            correctId = Number(id);
        }
        if (!Number.isInteger(correctId)) {
            return null;
        }
        if (correctId >= 2147483647) {
            return null;
        }
        const correctUserId = Number.isInteger(Number(userId)) ? Number(userId) : 0;
        const result = await this.dataSource.query(
            `SELECT comments.*, COUNT("usersWhoPutLikeForComment"."commentId") AS "likesCount", COUNT("usersWhoPutDislikeForComment"."commentId") AS "dislikesCount",
        CASE
        WHEN EXISTS (SELECT 1 FROM "usersWhoPutLikeForComment" WHERE "commentId" = comments.id AND "userId" = $1) THEN 'Like'
        WHEN EXISTS (SELECT 1 FROM "usersWhoPutDislikeForComment" WHERE "commentId" = comments.id AND "userId" = $1) THEN 'Dislike'
        ELSE 'None'
        END AS "myStatus"
        FROM comments
        JOIN users ON comments."commentOwnerUserId" = users.id
        JOIN posts ON comments."postId" = posts.id
        JOIN blogs ON posts."blogId" = blogs.id
        LEFT JOIN "usersWhoPutLikeForComment" ON "comments".id = "usersWhoPutLikeForComment"."commentId"
        LEFT JOIN "usersWhoPutDislikeForComment" ON "comments".id = "usersWhoPutDislikeForComment"."commentId"
        WHERE users."isBanned" = false
        AND blogs."isBanned" = false
        AND comments.id = $2
        AND users.id NOT IN (
        SELECT "userId" FROM "bannedBlogs" WHERE "userId" = users.id)
        GROUP BY comments.id,comments.content,comments."createdAt",comments."commentOwnerUserId",comments."postId",comments."commentOwnerUserLogin",
        posts."createdAt"`,
            [correctUserId, correctId],
        );
        return result[0] || null;
    }

    async getAllCommentsForSpecificPost(
        dto: ModelForGettingAllComments,
        postId: number,
        userId: number | undefined,
    ): Promise<CommentClassPaginationDto> {
        const correctUserId = Number.isInteger(Number(userId)) ? Number(userId) : 0;
        const { pageNumber = 1, pageSize = 10, sortBy = "createdAt", sortDirection = "desc" } = dto;
        const sort = sortDirection === "desc" ? `DESC` : `ASC`;
        const offset = pageSize * (pageNumber - 1);
        const queryParamsForAllPosts: any = [correctUserId, postId, pageSize, offset];
        const query = `SELECT comments.*, COUNT("usersWhoPutLikeForComment"."commentId") AS "likesCount", COUNT("usersWhoPutDislikeForComment"."commentId") AS "dislikesCount",
        CASE
        WHEN EXISTS (SELECT 1 FROM "usersWhoPutLikeForComment" WHERE "commentId" = comments.id AND "userId" = $1) THEN 'Like'
        WHEN EXISTS (SELECT 1 FROM "usersWhoPutDislikeForComment" WHERE "commentId" = comments.id AND "userId" = $1) THEN 'Dislike'
        ELSE 'None'
        END AS "myStatus"
        FROM comments
        JOIN users ON comments."commentOwnerUserId" = users.id
        JOIN posts ON comments."postId" = posts.id
        JOIN blogs ON posts."blogId" = blogs.id
        LEFT JOIN "usersWhoPutLikeForComment" ON "comments".id = "usersWhoPutLikeForComment"."commentId"
        LEFT JOIN "usersWhoPutDislikeForComment" ON "comments".id = "usersWhoPutDislikeForComment"."commentId"
        WHERE users."isBanned" = false
        AND blogs."isBanned" = false
        AND comments."postId" = $2
        AND users.id NOT IN (
        SELECT "userId" FROM "bannedBlogs" WHERE "userId" = users.id)
        GROUP BY comments.id,comments.content,comments."createdAt",comments."commentOwnerUserId",comments."postId",comments."commentOwnerUserLogin",
        posts."createdAt"
        ORDER BY posts."${sortBy}"  ${sort} LIMIT $3 OFFSET $4`;
        const cursor = await this.dataSource.query(query, queryParamsForAllPosts);

        const totalCount = await this.dataSource.query(
            `SELECT COUNT(*) FROM comments  
        JOIN users ON comments."commentOwnerUserId" = users.id
        JOIN posts ON comments."postId" = posts.id
        JOIN blogs ON posts."blogId" = blogs.id
        WHERE users."isBanned" = false 
        AND blogs."isBanned" = false 
        AND comments."postId" = $1
        AND users.id NOT IN (
        SELECT "userId" FROM "bannedBlogs" WHERE "userId" = users.id)`,
            [postId],
        );
        return {
            pagesCount: Math.ceil(Number(totalCount[0].count) / pageSize),
            page: pageNumber,
            pageSize: pageSize,
            totalCount: Number(totalCount[0].count),
            items: cursor,
        };
    }

    async getAllCommentsForAllPostsForBloggersBlogs(
        dto: ModelForGettingAllComments,
        userId: number | undefined,
    ): Promise<CommentClassPaginationDto> {
        const correctUserId = Number.isInteger(Number(userId)) ? Number(userId) : 0;
        const { pageNumber = 1, pageSize = 10, sortBy = "createdAt", sortDirection = "desc" } = dto;
        const sort = sortDirection === "desc" ? `DESC` : `ASC`;
        const offset = pageSize * (pageNumber - 1);
        const queryParamsForAllPosts: any = [correctUserId, pageSize, offset];
        const query = `SELECT comments.*,posts.title,posts."blogId",blogs."name", COUNT("usersWhoPutLikeForComment"."commentId") AS "likesCount", COUNT("usersWhoPutDislikeForComment"."commentId") AS "dislikesCount",
        CASE
        WHEN EXISTS (SELECT 1 FROM "usersWhoPutLikeForComment" WHERE "commentId" = comments.id AND "userId" = $1) THEN 'Like'
        WHEN EXISTS (SELECT 1 FROM "usersWhoPutDislikeForComment" WHERE "commentId" = comments.id AND "userId" = $1) THEN 'Dislike'
        ELSE 'None'
        END AS "myStatus"
        FROM comments
        JOIN users ON comments."commentOwnerUserId" = users.id
        JOIN posts ON comments."postId" = posts.id
        JOIN blogs ON posts."blogId" = blogs.id
        LEFT JOIN "usersWhoPutLikeForComment" ON "comments".id = "usersWhoPutLikeForComment"."commentId"
        LEFT JOIN "usersWhoPutDislikeForComment" ON "comments".id = "usersWhoPutDislikeForComment"."commentId"
        WHERE users."isBanned" = false
        AND blogs."isBanned" = false
        AND blogs."blogOwnerUserId" = $1
        AND users.id NOT IN (
        SELECT "userId" FROM "bannedBlogs" WHERE "userId" = users.id)
        GROUP BY comments.id,posts.title,posts."blogId",blogs."name"
        ORDER BY posts."${sortBy}"  ${sort} LIMIT $3 OFFSET $4`;
        const cursor = await this.dataSource.query(query, queryParamsForAllPosts);

        const totalCount = await this.dataSource.query(
            `SELECT COUNT(*) FROM posts WHERE JOIN users ON posts."postOwnerUserId" = users.id 
        JOIN blogs ON posts."blogId" = blogs.id 
        WHERE users."isBanned" = false 
        AND blogs."isBanned" = false 
        AND blogs."blogOwnerUserId" = $1
        AND users.id NOT IN (
        SELECT "userId" FROM "bannedBlogs" WHERE "userId" = users.id)`,
            [userId],
        );
        return {
            pagesCount: Math.ceil(Number(totalCount[0].count) / pageSize),
            page: pageNumber,
            pageSize: pageSize,
            totalCount: Number(totalCount[0].count),
            items: cursor,
        };
    }

    async getCommentByIdForLikeOperation(id: number): Promise<CommentsClass> {
        const result = await this.dataSource.query(`SELECT * FROM comments WHERE id = $1`, [id]);
        if (!result[0]) {
            return null;
        } else {
            result[0].likesArray = await this.dataSource.query(
                `SELECT * FROM "usersWhoPutLikeForComment" WHERE "commentId" = $1`,
                [id],
            );
            result[0].dislikesArray = await this.dataSource.query(
                `SELECT * FROM "usersWhoPutDislikeForComment" WHERE "commentId" = $1`,
                [id],
            );
            return result[0];
        }
    }
}

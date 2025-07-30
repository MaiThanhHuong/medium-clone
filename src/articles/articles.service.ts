import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateArticleDto } from './dto/createArticle.dto';
import { UpdateArticleDto } from './dto/updateArticle.dto';
import slugify from 'slugify';
import { I18nContext } from 'nestjs-i18n';
import { Article, Tag, User, Comment, Prisma } from '@prisma/client';
import { CreateCommentDto } from './dto/createComment.dto';
import { QueryArticleDto } from './dto/queryArticle.dto';

type CommentWithAuthor = Comment & {
  author: Pick<User, 'username' | 'bio' | 'image'>;
};

@Injectable()
export class ArticlesService {
  constructor(private prisma: PrismaService) {}

  async createArticle(
    authorId: number,
    dto: CreateArticleDto,
  ): Promise<{ article: Article & { tags: Tag[]; author: User } }> {
    let baseSlug = slugify(dto.title, { lower: true, strict: true });
    let slug = baseSlug;

    const isExisted = await this.prisma.article.findUnique({ where: { slug } });
    if (isExisted) {
      const suffix = Math.random().toString(36).substring(2, 8);
      slug = `${baseSlug}-${suffix}`;
    }

    const tagList = dto.tagList ?? [];

    const tagsToConnectOrCreate = tagList.map((tagName) => ({
      where: { name: tagName },
      create: { name: tagName },
    }));

    const article = await this.prisma.article.create({
      data: {
        slug,
        title: dto.title,
        description: dto.description,
        body: dto.body,
        authorId,
        tags:
          tagList.length > 0
            ? {
                connectOrCreate: tagsToConnectOrCreate,
              }
            : undefined,
      },
      include: {
        author: true,
        tags: true,
      },
    });

    return { article };
  }

  async getArticle(
    slug: string,
    i18n: I18nContext,
  ): Promise<{
    article: Article & {
      author: Pick<User, 'username' | 'bio' | 'image'>;
    };
  }> {
    const article = await this.prisma.article.findUnique({
      where: { slug },
      include: {
        author: {
          select: {
            username: true,
            bio: true,
            image: true,
          },
        },
      },
    });

    if (!article) {
      throw new NotFoundException(
        await i18n.t('errors.article.notFoundWithSlug', {
          args: { slug },
        }),
      );
    }

    return { article };
  }

  async updateArticle(
    authorId: number,
    slug: string,
    dto: UpdateArticleDto,
    i18n: I18nContext,
  ): Promise<{ article: Article }> {
    const article = await this.prisma.article.findUnique({ where: { slug } });

    if (!article) {
      throw new NotFoundException(await i18n.t('errors.article.notFound'));
    }

    if (article.authorId !== authorId) {
      throw new ForbiddenException(await i18n.t('errors.article.notAuthor'));
    }

    const updatedArticle = await this.prisma.article.update({
      where: { slug },
      data: { ...dto },
    });

    return { article: updatedArticle };
  }

  async deleteArticle(
    authorId: number,
    slug: string,
    i18n: I18nContext,
  ): Promise<{ message: string }> {
    const article = await this.prisma.article.findUnique({ where: { slug } });

    if (!article) {
      throw new NotFoundException(await i18n.t('errors.article.notFound'));
    }

    if (article.authorId !== authorId) {
      throw new ForbiddenException(await i18n.t('errors.article.notAuthor'));
    }

    await this.prisma.article.update({
      where: { slug },
      data: {
        tags: {
          set: [],
        },
      },
    });

    await this.prisma.article.delete({ where: { slug } });

    return {
      message: await i18n.t('messages.article.deleted'),
    };
  }

  async addComment(
    authorId: number,
    slug: string,
    dto: CreateCommentDto,
    i18n: I18nContext,
  ): Promise<{ comment: CommentWithAuthor }> {
    const article = await this.prisma.article.findUnique({ where: { slug } });

    if (!article) {
      throw new NotFoundException(await i18n.t('errors.article.notFound'));
    }

    const comment = await this.prisma.comment.create({
      data: {
        body: dto.body,
        articleId: article.id,
        authorId,
      },
      include: {
        author: {
          select: {
            username: true,
            bio: true,
            image: true,
          },
        },
      },
    });

    return { comment };
  }

  async getComments(slug: string): Promise<{ comments: CommentWithAuthor[] }> {
    const comments = await this.prisma.comment.findMany({
      where: {
        article: {
          slug,
        },
      },
      include: {
        author: {
          select: {
            username: true,
            bio: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return { comments };
  }

  async deleteComment(
    authorId: number,
    commentId: number,
    i18n: I18nContext,
  ): Promise<void> {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException(await i18n.t('errors.comment.notFound'));
    }

    if (comment.authorId !== authorId) {
      throw new ForbiddenException(await i18n.t('errors.comment.notAuthor'));
    }

    await this.prisma.comment.delete({ where: { id: commentId } });
  }

  async getArticles(query: QueryArticleDto, currentUser?: User) {
    const whereClause: Prisma.ArticleWhereInput = {};

    if (query.tag) {
      whereClause.tags = { some: { name: query.tag } };
    }

    if (query.author) {
      whereClause.author = { username: query.author };
    }

    if (query.favorited) {
      whereClause.favoritedBy = { some: { username: query.favorited } };
    }

    const [articles, articlesCount] = await Promise.all([
      this.prisma.article.findMany({
        where: whereClause,
        skip: Number(query.offset) || 0,
        take: Number(query.limit) || 20,
        orderBy: { createdAt: 'desc' },
        include: { author: true, tags: true, favoritedBy: true },
      }),
      this.prisma.article.count({ where: whereClause }),
    ]);

    let followingIds: number[] = [];
    if (currentUser) {
      followingIds =
        (
          await this.prisma.user.findUnique({
            where: { id: currentUser.id },
            select: { following: { select: { id: true } } },
          })
        )?.following.map((f) => f.id) ?? [];
    }

    const formattedArticles = await Promise.all(
      articles.map((article) =>
        this.buildArticleResponse(article, currentUser, followingIds),
      ),
    );

    return {
      articles: formattedArticles.map((a) => a.article),
      articlesCount,
    };
  }

  async getFeed(currentUser: User, query: QueryArticleDto) {
    const followedUsers = await this.prisma.user.findUnique({
      where: { id: currentUser.id },
      select: { following: { select: { id: true } } },
    });

    const followedUserIds =
      followedUsers?.following.map((user) => user.id) ?? [];

    if (followedUserIds.length === 0) {
      return { articles: [], articlesCount: 0 };
    }

    const [articles, articlesCount] = await Promise.all([
      this.prisma.article.findMany({
        where: { authorId: { in: followedUserIds } },
        skip: Number(query.offset) ?? 0,
        take: Number(query.limit) ?? 20,
        orderBy: { createdAt: 'desc' },
        include: { author: true, tags: true, favoritedBy: true },
      }),
      this.prisma.article.count({
        where: { authorId: { in: followedUserIds } },
      }),
    ]);

    const formattedArticles = await Promise.all(
      articles.map((article) =>
        this.buildArticleResponse(article, currentUser, followedUserIds),
      ),
    );

    return {
      articles: formattedArticles.map((a) => a.article),
      articlesCount,
    };
  }

  private buildArticleResponse(
    article: any,
    currentUser?: User,
    followingIds: number[] = [],
  ) {
    const tagList = article.tags.map((tag) => tag.name);
    const favoritesCount = article.favoritedBy.length;

    const favorited = currentUser && article.favoritedBy.some((user) => user.id === currentUser.id);

    const authorFollowing = currentUser && followingIds.includes(article.authorId);

    const formattedArticle = {
      slug: article.slug,
      title: article.title,
      description: article.description,
      body: article.body,
      tagList,
      createdAt: article.createdAt,
      updatedAt: article.updatedAt,
      favorited,
      favoritesCount,
      author: this.formatAuthor(article.author, authorFollowing),
    };

    return { article: formattedArticle };
  }

  private formatAuthor(author: User, following: boolean) {
    const { password, ...safeAuthor } = author;
    return {
      username: safeAuthor.username,
      bio: safeAuthor.bio,
      image: safeAuthor.image,
      following,
    };
  }
}

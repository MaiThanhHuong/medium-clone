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
import { Article, Tag, User } from '@prisma/client';

@Injectable()
export class ArticlesService {
  constructor(private prisma: PrismaService) {}

  async createArticle(
    authorId: number,
    dto: CreateArticleDto,
  ): Promise<{ article: Article & { tags: Tag[]; author: User } }> {
    const slug = slugify(dto.title, { lower: true, strict: true });

    const tagsToConnectOrCreate = dto.tagList?.map((tagName) => ({
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
        tags: {
          connectOrCreate: tagsToConnectOrCreate,
        },
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
  ): Promise<void> {
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
  }
}

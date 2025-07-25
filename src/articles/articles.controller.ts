import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Param,
  Put,
  HttpStatus,
  HttpCode,
  Delete,
  NotFoundException,
  ForbiddenException,
  ParseIntPipe,
} from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/auth/decorator/getUser.decorator';
import { CreateArticleDto } from './dto/createArticle.dto';
import { UpdateArticleDto } from './dto/updateArticle.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { I18n, I18nContext } from 'nestjs-i18n';
import { CreateCommentDto } from './dto/createComment.dto';

@ApiTags('Articles')
@Controller('api/articles')
export class ArticlesController {
  constructor(private articlesService: ArticlesService) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new article' })
  @ApiResponse({ status: 201, description: 'Article successfully created' })
  @UseGuards(AuthGuard('jwt'))
  @Post()
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        article: { $ref: '#/components/schemas/CreateArticleDto' },
      },
    },
  })
  async createArticle(
    @GetUser('id') authorId: number,
    @Body('article') createArticleDto: CreateArticleDto,
  ) {
    const article = await this.articlesService.createArticle(
      authorId,
      createArticleDto,
    );
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Article created successfully',
      data: { article },
    };
  }

  @ApiOperation({ summary: 'Get an article by slug' })
  @ApiResponse({ status: 200, description: 'Article successfully retrieved' })
  @ApiParam({ name: 'slug', description: 'Unique identifier of the article' })
  @Get(':slug')
  async getArticle(@Param('slug') slug: string, @I18n() i18n: I18nContext) {
    const article = await this.articlesService.getArticle(slug, i18n);
    return {
      statusCode: HttpStatus.OK,
      message: 'Article retrieved successfully',
      data: { article },
    };
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an article by slug' })
  @ApiResponse({ status: 200, description: 'Article successfully updated' })
  @ApiParam({ name: 'slug', description: 'Unique identifier of the article' })
  @UseGuards(AuthGuard('jwt'))
  @Put(':slug')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        article: { $ref: '#/components/schemas/UpdateArticleDto' },
      },
    },
  })
  async updateArticle(
    @GetUser('id') authorId: number,
    @Param('slug') slug: string,
    @Body('article') updateArticleDto: UpdateArticleDto,
    @I18n() i18n: I18nContext,
  ) {
    const article = await this.articlesService.updateArticle(
      authorId,
      slug,
      updateArticleDto,
      i18n,
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Article updated successfully',
      data: { article },
    };
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete an article by slug' })
  @ApiResponse({ status: 200, description: 'Article successfully deleted' })
  @ApiParam({ name: 'slug', description: 'Unique identifier of the article' })
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  @Delete(':slug')
  async deleteArticle(
    @GetUser('id') authorId: number,
    @Param('slug') slug: string,
    @I18n() i18n: I18nContext,
  ) {
    await this.articlesService.deleteArticle(authorId, slug, i18n);
    return {
      statusCode: HttpStatus.OK,
      message: 'Article deleted successfully',
    };
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a comment to an article' })
  @ApiResponse({ status: 201, description: 'Comment successfully added' })
  @ApiParam({ name: 'slug', description: 'Slug of the article to comment on' })
  @UseGuards(AuthGuard('jwt'))
  @Post(':slug/comments')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        comment: { $ref: '#/components/schemas/CreateCommentDto' },
      },
    },
  })
  async addComment(
    @GetUser('id') authorId: number,
    @Param('slug') slug: string,
    @Body('comment') createCommentDto: CreateCommentDto,
    @I18n() i18n: I18nContext,
  ) {
    const comment = await this.articlesService.addComment(
      authorId,
      slug,
      createCommentDto,
      i18n,
    );

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Comment added successfully',
      data: { comment },
    };
  }

  @ApiOperation({ summary: 'Get all comments for an article' })
  @ApiResponse({ status: 200, description: 'Comments successfully retrieved' })
  @ApiParam({ name: 'slug', description: 'Slug of the article' })
  @Get(':slug/comments')
  async getComments(@Param('slug') slug: string) {
    const comments = await this.articlesService.getComments(slug);

    return {
      statusCode: HttpStatus.OK,
      message: 'Comments retrieved successfully',
      data: { comments },
    };
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a comment' })
  @ApiResponse({ status: 204, description: 'Comment successfully deleted' })
  @ApiParam({ name: 'slug', description: 'Slug of the article' })
  @ApiParam({ name: 'id', description: 'ID of the comment to delete' })
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':slug/comments/:id')
  async deleteComment(
    @GetUser('id') authorId: number,
    @Param('id', ParseIntPipe) commentId: number,
    @I18n() i18n: I18nContext,
  ) {
    await this.articlesService.deleteComment(authorId, commentId, i18n);

    return {
      statusCode: HttpStatus.NO_CONTENT,
      message: 'Comment deleted successfully',
    };
  }
}

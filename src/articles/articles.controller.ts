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
}

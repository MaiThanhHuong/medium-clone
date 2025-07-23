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
  constructor(private readonly articlesService: ArticlesService) {}

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
  createArticle(
    @GetUser('id') authorId: number,
    @Body('article') createArticleDto: CreateArticleDto,
  ) {
    return this.articlesService.createArticle(authorId, createArticleDto);
  }

  @ApiOperation({ summary: 'Get an article by slug' })
  @ApiResponse({ status: 200, description: 'Article successfully retrieved' })
  @ApiParam({ name: 'slug', description: 'Unique identifier of the article' })
  @Get(':slug')
  getArticle(@Param('slug') slug: string, @I18n() i18n: I18nContext) {
    return this.articlesService.getArticle(slug, i18n);
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
  updateArticle(
    @GetUser('id') authorId: number,
    @Param('slug') slug: string,
    @Body('article') updateArticleDto: UpdateArticleDto,
    @I18n() i18n: I18nContext,
  ) {
    return this.articlesService.updateArticle(
      authorId,
      slug,
      updateArticleDto,
      i18n,
    );
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete an article by slug' })
  @ApiResponse({ status: 204, description: 'Article successfully deleted' })
  @ApiParam({ name: 'slug', description: 'Unique identifier of the article' })
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':slug')
  deleteArticle(
    @GetUser('id') authorId: number,
    @Param('slug') slug: string,
    @I18n() i18n: I18nContext,
  ) {
    return this.articlesService.deleteArticle(authorId, slug, i18n);
  }
}

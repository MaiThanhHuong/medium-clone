import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateArticleDto {
  @ApiProperty({
    example: 'How to build a Node.js API',
    description: 'The title of the article',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: 'An introduction to building RESTful APIs with NestJS',
    description: 'A short description of the article',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    example: 'NestJS is a framework for building scalable server-side apps...',
    description: 'The main content/body of the article',
  })
  @IsString()
  @IsNotEmpty()
  body: string;

  @ApiPropertyOptional({
    example: ['nestjs', 'api', 'backend'],
    description: 'A list of related tags (optional)',
    type: [String],
  })
  @IsString({ each: true })
  @IsOptional()
  tagList?: string[];
}

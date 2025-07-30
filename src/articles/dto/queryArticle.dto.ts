import { IsOptional, IsString } from 'class-validator';

export class QueryArticleDto {
  @IsString()
  @IsOptional()
  tag?: string;

  @IsString()
  @IsOptional()
  author?: string;

  @IsString()
  @IsOptional()
  favorited?: string;

  @IsOptional()
  limit?: number;

  @IsOptional()
  offset?: number;
}

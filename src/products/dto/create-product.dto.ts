import {
  IsArray,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MinLength,
  IsIn,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @MinLength(1)
  title: string;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  price?: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsInt()
  @IsPositive()
  @IsOptional()
  stock?: number;

  //Validamos que cada uno de los elementos sean string
  @IsString({ each: true })
  @IsArray()
  sizes: string[];

  // validamos que conetnga alguno de los valores el array
  @IsIn(['men', 'women', 'kid', 'unisex'])
  gender: string;

  @IsString({ each: true })
  @IsOptional()
  @IsArray()
  tags: string[];

  @IsString({ each: true })
  @IsOptional()
  @IsArray()
  images: string[];
}

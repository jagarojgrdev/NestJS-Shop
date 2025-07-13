import { PartialType } from '@nestjs/swagger';
import { CreateProductDto } from './create-product.dto';

//importar PartialType de swagger
export class UpdateProductDto extends PartialType(CreateProductDto) {}

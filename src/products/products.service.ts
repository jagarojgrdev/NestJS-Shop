import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { isUUID } from 'class-validator';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { Product, ProductImage } from './entities';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger('ProductsService');
  // Para la insersión de datos usaremos el patron repositorio
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    //Cargamos la tabla imagenes
    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,

    private readonly dataSource: DataSource,
  ) {}

  async create(createProductDto: CreateProductDto) {
    try {
      //Destructuramos la data
      const { images = [], ...productDetails } = createProductDto;
      // Guardarmos en memoria para tratarlo
      const product = this.productRepository.create({
        ...productDetails,
        //Creamos array y guardamos dentro del producto
        images: images.map((image) =>
          this.productImageRepository.create({ url: image }),
        ),
      });

      //Guardamos en DB
      await this.productRepository.save(product);

      return product;
      // Controlamos errores
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    // Desestructuramos pagination
    const { limit = 10, offset = 0 } = paginationDto;

    //Mandamos limit y skip
    const products = await this.productRepository.find({
      take: limit,
      skip: offset,
      relations: {
        images: true,
      },
    });

    // return products;

    //Esto nos devuelve el contenido de las imagenes aplanadas, si nos devolvería el array completo
    return products.map(({ images, ...productDetails }) => ({
      ...productDetails,
      images: images?.map((img) => img.url),
    }));
  }

  async findOne(term: string) {
    let product: Product | null = null;

    if (isUUID(term)) {
      product = await this.productRepository.findOneBy({ id: term });
    } else {
      //Buscar por slug
      // product = await this.productRepository.findOneBy({ slug: term });

      //Buscar por title y slug
      //Dentro del create builder, asignameos el alias de la tabla
      const queryBuilder = this.productRepository.createQueryBuilder('product');
      product = await queryBuilder
        .where(`UPPER(title) =:title or slug=:slug`, {
          title: term.toUpperCase(),
          slug: term.toLocaleLowerCase(),
        })
        // Realizamos relación DBQquerybuilder.campo , aliasTablaRelacionada
        .leftJoinAndSelect('product.images', 'prodImages')
        .getOne();
    }

    if (!product) {
      throw new NotFoundException(
        `Product with identifier "${term}" not found`,
      );
    }

    return product;
  }

  async findOnePlain(term: string) {
    const { images = [], ...product } = await this.findOne(term);
    return {
      ...product,
      images: images?.map((img) => img.url),
    };
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const { images, ...productDetails } = updateProductDto;

    const product = await this.productRepository.preload({
      //Obtiene el ID
      id: id,
      //Carga las propiedades recogidas
      ...productDetails,
      images: [],
    });

    if (!product)
      throw new NotFoundException(`Product with id: ${id} not found`);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      //Si tiene imagenes, las eliminamos todas, se podría hacer un softdelete
      if (images) {
        await queryRunner.manager.delete(ProductImage, { product: { id } });

        //Agregamos la nuevas imagenes al producto
        product.images = images.map((image) =>
          this.productImageRepository.create({ url: image }),
        );
      }

      // Guardamos los cambios
      await queryRunner.manager.save(product);

      // Ejcutamos todas las queryRunner
      await queryRunner.commitTransaction();
      await queryRunner.release();

      // Guardar cuando no tiene relaciones
      // await this.productRepository.save(product);

      return this.findOnePlain(id);
    } catch (error) {
      //En caso de dar error query que no se ejecute
      await queryRunner.rollbackTransaction();
      await queryRunner.release();

      this.handleDBExceptions(error);
    }
  }

  //SE RECOMIENDA CREAR QUERYBUILDER PARA BORRAR PRIMERO LAS IMAGENES Y DESPEUS EL PRODUCTO
  // Ahora se esta borrnado por que en la entidad image hemos puesto la propiedad CASCADE
  async remove(id: string) {
    const result = await this.productRepository.delete({ id });
    if (result.affected === 0) {
      throw new NotFoundException(`Product with id "${id}" not found`);
    }
    return;
  }

  private handleDBExceptions(error: any) {
    // Asegura que error no es null, ni un tipo primitivo como string, number, etc.
    if (
      typeof error === 'object' &&
      error !== null &&
      // Comprueba que la propiedad code existe
      'code' in error &&
      // Accede a code de forma segura, haciendo un cast a un objeto genérico.
      // Es una forma de decirle a TypeScript    "Este es un objeto con claves string y valores de tipo desconocido".
      (error as Record<string, unknown>)['code'] === '23505'
    ) {
      throw new BadRequestException(
        (error as Record<string, unknown>)['detail'],
      );
    }
    this.logger.error(error);

    throw new InternalServerErrorException(
      'Unexpected error - Check Server Logs',
    );
  }

  async deleteAllProducts() {
    const query = this.productRepository.createQueryBuilder('product');
    // Se debería de añadir condiciones para que solo se ejeucte desde desarrollo y capar en producción
    try {
      return await query.delete().execute();
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }
}

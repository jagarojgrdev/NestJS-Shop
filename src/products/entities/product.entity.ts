import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ProductImage } from './product-image.entity';
import { User } from 'src/auth/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';

// Podemos renombrar la tabla especificandole el nombre.
//  En caso de que renombremos sobre una tabla ya creda, habría que eliminarla y volver a crearla
// @Entity({ name: 'products' })
// Asignamos a Product como entity de typeorm y asigname que sea un tabla (Lo importamos tbn en el module)
@Entity()
export class Product {
  @ApiProperty({
    example: '70750ec5-65db-4712-946d-9954aaf3af1e',
    description: 'Product ID',
    uniqueItems: true,
  })
  // Generamos clave primaria
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: 'Javier Shirt',
    description: 'Product Title',
    uniqueItems: true,
  })
  //Generamos campo
  @Column('text', {
    unique: true,
  })
  title: string;

  @ApiProperty({
    example: 0,
    description: 'Product Price',
  })
  @Column('float', {
    default: 0,
  })
  price: number;

  @ApiProperty({
    example: 'Camiseta de verano,fabricada de algodón poliester.',
    description: 'Product Description',
  })
  @Column({
    type: 'text',
    nullable: true,
  })
  description: string;

  @ApiProperty({
    example: 'javier_shirt',
    description: 'Product Slug -  for SE0',
    uniqueItems: true,
  })
  @Column('text', {
    unique: true,
  })
  slug: string;

  @ApiProperty({
    example: 10,
    description: 'Product Stock',
    default: 0,
  })
  @Column('int', {
    default: 0,
  })
  stock: number;

  // Se podría asociar con un nueva nueva tabla, pero tendría mas sentido si hubiesen muchos nulos
  @ApiProperty({
    example: ['S', 'M', 'L'],
    description: 'Product Sizes',
  })
  @Column('text', {
    array: true,
  })
  sizes: string[];

  @ApiProperty({
    example: 'men',
    description: 'Product Gender',
  })
  @Column('text')
  gender: string;

  @ApiProperty({
    example: ['summer', 'cottom'],
    description: 'Product Tags',
  })
  @Column('text', {
    array: true,
    default: [],
  })
  tags: string[];

  @ApiProperty({
    example: [
      ['1149', 'https://image1.jpg'],
      ['1150', 'https://image2.jpg'],
    ],
    description: 'Product Images',
  })
  // Hacemos relación de uno a muchos
  @OneToMany(() => ProductImage, (productImage) => productImage.product, {
    // Sirve para que si borramos un producto, borre tambien las imagenes asociadas
    cascade: true,
    // Srive para cargar las relaciones automaticamente
    eager: true,
  })
  images?: ProductImage[];

  @ManyToOne(() => User, (user) => user.product, {
    eager: true,
  })
  user: User;

  //Modifica slug antes de insertar
  @BeforeInsert()
  checkSlugInsert() {
    if (!this.slug) {
      this.slug = this.title;
    }
    this.slug = this.slug
      .toLocaleLowerCase()
      .replaceAll(' ', '_')
      .replaceAll("'", '');
  }

  //Modifica slug antes de actualizar
  @BeforeUpdate()
  checkSlugUpdate() {
    this.slug = this.slug
      .toLocaleLowerCase()
      .replaceAll(' ', '_')
      .replaceAll("'", '');
  }
}

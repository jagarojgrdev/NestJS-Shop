import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ProductImage } from './product-image.entity';

// Podemos renombrar la tabla especificandole el nombre.
//  En caso de que renombremos sobre una tabla ya creda, habría que eliminarla y volver a crearla
// @Entity({ name: 'products' })
// Asignamos a Product como entity de typeorm y asigname que sea un tabla (Lo importamos tbn en el module)
@Entity()
export class Product {
  // Generamos clave primaria
  @PrimaryGeneratedColumn('uuid')
  id: string;

  //Generamos campo
  @Column('text', {
    unique: true,
  })
  title: string;

  @Column('float', {
    default: 0,
  })
  price: number;

  @Column({
    type: 'text',
    nullable: true,
  })
  description: string;

  @Column('text', {
    unique: true,
  })
  slug: string;

  @Column('int', {
    default: 0,
  })
  stock: number;

  // Se podría asociar con un nueva nueva tabla, pero tendría mas sentido si hubiesen muchos nulos
  @Column('text', {
    array: true,
  })
  sizes: string[];

  @Column('text')
  gender: string;

  @Column('text', {
    array: true,
    default: [],
  })
  tags: string[];

  // Hacemos relación de uno a muchos
  @OneToMany(() => ProductImage, (productImage) => productImage.product, {
    // Sirve para que si borramos un producto, borre tambien las imagenes asociadas
    cascade: true,
    // Srive para cargar las relaciones automaticamente
    eager: true,
  })
  images?: ProductImage[];

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

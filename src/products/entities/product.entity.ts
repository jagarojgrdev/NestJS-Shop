import { Column, Entity, PrimaryColumn } from 'typeorm';

//Asignamos a Product como entity de typeorm y asigname qu sea un tabla (Lo importamos tbn en el module)
@Entity()
export class Product {
  // Generamos clave primaria
  @PrimaryColumn('uuid')
  id: string;

  //Generamos campo
  @Column('text', {
    unique: true,
  })
  title: string;

  @Column('numeric', {
    default: 0,
  })
  price: string;

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
}

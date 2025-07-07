import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from './product.entity';

@Entity()
export class ProductImage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  url: string;

  //Hacemos relación de muchos a uno
  @ManyToOne(() => Product, (product) => product.images, {
    //Si eliminamos un producto, se elimnas su imagenes dependientes
    onDelete: 'CASCADE',
  })
  product: Product;
}

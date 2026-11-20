import { collection, doc, writeBatch } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { SAMPLE_PRODUCTS } from '../data/sampleProducts';

/** Cadastra o catálogo de exemplo de uma vez (usado quando o banco está vazio). */
export async function seedSampleProducts(): Promise<void> {
  const batch = writeBatch(db);
  SAMPLE_PRODUCTS.forEach((product) => {
    batch.set(doc(collection(db, 'products')), product);
  });
  await batch.commit();
}

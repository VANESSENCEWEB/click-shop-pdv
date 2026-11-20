import { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Product } from '../types';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Se o banco não responder (sem internet, Firestore desativado...),
    // o SDK fica tentando em silêncio. Depois de 12 s avisamos a pessoa.
    let answered = false;
    const timeout = setTimeout(() => {
      if (answered) return;
      setError('timeout');
      setLoading(false);
    }, 12000);

    const unsubscribe = onSnapshot(
      collection(db, 'products'),
      (snapshot) => {
        const productsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Product[];

        answered = true;
        clearTimeout(timeout);
        setProducts(productsData);
        setLoading(false);
        setError(null);
      },
      (err) => {
        answered = true;
        clearTimeout(timeout);
        console.error('Erro ao buscar produtos:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => {
      clearTimeout(timeout);
      unsubscribe();
    };
  }, []);

  const addProduct = async (product: Omit<Product, 'id'>) => {
    await addDoc(collection(db, 'products'), product);
  };

  return { products, loading, error, addProduct };
}
"use server"
import fs from 'fs';
import path from 'path';

export async function getProduct() {
  const filePath = path.join(process.cwd(), 'data', 'variete_product.json');
  const jsonData = fs.readFileSync(filePath, 'utf8');
  const productMap = JSON.parse(jsonData);

  return productMap;
}
import { Router } from 'express'
import { redis } from '@/dataSources/redis'
import { postgres } from '@/dataSources'
import { products as productTable } from '@/models/schema'
import winston from 'winston'

export const products = (router: Router): void => {
  router.get('/products', async (req, res) => {
    try {
      const cachedProducts = await redis.client.get('products_cache')
      if (cachedProducts) {
        return res.json(JSON.parse(cachedProducts))
      }

      const allProducts = await postgres
        .select({
          id: productTable.id,
          name: productTable.name,
          description: productTable.description,
          sku: productTable.sku,
          taxPercentage: productTable.taxPercentage,
          isActive: productTable.isActive,
          createdAt: productTable.createdAt,
          deletedAt: productTable.deletedAt
        })
        .from(productTable)

      if (!allProducts.length) {
        return res.status(404).json({ error: 'No products found' })
      }

      await redis.client.set('products_cache', JSON.stringify(allProducts), {
        EX: 3600
      })

      return res.json(allProducts)
    } catch (error) {
      winston.error('❌ Error fetching products:', error)
      return res.status(500).json({ error: 'Internal Server Error' })
    }
  })
}

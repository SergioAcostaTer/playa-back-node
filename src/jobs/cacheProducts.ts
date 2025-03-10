import cron from 'node-cron'
import { products as productTable } from '@/models/schema'
import { postgres } from '@/dataSources'
import { redis } from '@/dataSources/redis' // Import your Redis instance
import winston from 'winston'

async function cacheProducts() {
  try {
    console.log('🔄 Fetching products from PostgreSQL...')

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
      console.warn('⚠️ No products found in database.')
      return
    }

    // Ensure Redis is connected
    if (!redis.client) {
      console.error('❌ Redis client is not initialized.')
      return
    }

    // Store products in Redis
    await redis.client.set('products_cache', JSON.stringify(allProducts), {
      EX: 3600 // Expire after 1 hour
    })

    console.log('✅ Products cached in Redis!')
  } catch (error) {
    winston.error('❌ Error caching products:', error)
  }
}

// Schedule job to run every hour
cron.schedule('0 * * * *', async () => {
  console.log('⏳ Running product cache update...')
  await cacheProducts()
})

export { cacheProducts }

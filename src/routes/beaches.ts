import { beachController } from '@/controllers/beachController'
import { Router } from 'express'

/**
 * @swagger
 * tags:
 *   name: Beaches
 *   description: Beaches management endpoints
 */

/**
 * @swagger
 * /beaches:
 *   get:
 *     summary: Get all beaches
 *     description: Retrieve a paginated list of all beaches with optional filtering by name, island, province, and facilities.
 *     tags: [Beaches]
 *     parameters:
 *       - name: page
 *         in: query
 *         description: Page number for pagination (default: 1)
 *         schema:
 *           type: integer
 *       - name: limit
 *         in: query
 *         description: Number of items per page (default: 10, max: 50)
 *         schema:
 *           type: integer
 *       - name: name
 *         in: query
 *         description: Filter by beach name
 *         schema:
 *           type: string
 *       - name: island
 *         in: query
 *         description: Filter by island
 *         schema:
 *           type: string
 *       - name: province
 *         in: query
 *         description: Filter by province
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully fetched beaches
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   description: HTTP status code
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       slug:
 *                         type: string
 *                       island:
 *                         type: string
 *                       province:
 *                         type: string
 *       500:
 *         description: Internal server error
 */
const beaches = (router: Router): void => {
  router.get('/beaches', beachController.getAllBeaches)

  /**
   * @swagger
   * /beaches/search:
   *   get:
   *     summary: Search for beaches
   *     description: Search beaches by name and optional filters.
   *     tags: [Beaches]
   *     parameters:
   *       - name: q
   *         in: query
   *         description: Search term for beach name
   *         schema:
   *           type: string
   *       - name: page
   *         in: query
   *         description: Page number for pagination (default: 1)
   *         schema:
   *           type: integer
   *       - name: limit
   *         in: query
   *         description: Number of items per page (default: 10, max: 50)
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Successfully fetched search results
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: integer
   *                 data:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       id:
   *                         type: integer
   *                       name:
   *                         type: string
   *                       slug:
   *                         type: string
   *       500:
   *         description: Internal server error
   */
  router.get('/beaches/search', beachController.search)

  /**
   * @swagger
   * /beaches/{slug}:
   *   get:
   *     summary: Get a beach by slug
   *     description: Retrieve a single beach by its slug.
   *     tags: [Beaches]
   *     parameters:
   *       - name: slug
   *         in: path
   *         required: true
   *         description: Slug of the beach to fetch
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Successfully fetched the beach
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: integer
   *                   description: HTTP status code
   *                 data:
   *                   type: object
   *                   properties:
   *                     id:
   *                       type: integer
   *                     name:
   *                       type: string
   *                     slug:
   *                       type: string
   *       404:
   *         description: Beach not found
   *       500:
   *         description: Internal server error
   */
  router.get('/beaches/:slug', beachController.getBeachBySlug)
}

export { beaches }

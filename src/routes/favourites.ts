import { Router } from 'express'
import { favouritesController } from '@/controllers/favourites'
import { authMiddleware } from '@/middlewares/authMiddleware'

const router = Router()

// Ruta para agregar una playa a favoritos
router.post('/:beachId', authMiddleware, favouritesController.addFavourite)

export default router

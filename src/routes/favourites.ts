import { Router } from 'express'
import { favouritesController } from '@/controllers/favourites'
import { authMiddleware } from '@/middlewares/authMiddleware'

// Ruta para agregar una playa a favoritos
const favourites = (router: Router): void => {
    router.get('/favourites', authMiddleware, favouritesController.getFavourites)
    router.post('/like/:beachId', authMiddleware, favouritesController.addFavourite),
    router.delete('/like/:beachId', authMiddleware, favouritesController.removeFavourite)
}

export { favourites }

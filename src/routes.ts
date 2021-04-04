import { Router } from 'express'

import { SurveysController } from './controllers/SurveysController'
import { UserController } from './controllers/UserController'

const router = Router()

// instanciando as classes criadas
const userController = new UserController()
const surveysController = new SurveysController()

router.post('/users', userController.create)

router.get('/surveys', surveysController.show)
router.post('/surveys', surveysController.create)

export { router }
import { Router } from 'express'

import { UserController } from './controllers/UserController'

const router = Router()

// instanciando a classe de usuários criada
const userController = new UserController()

router.post('/users', userController.create)

export { router }
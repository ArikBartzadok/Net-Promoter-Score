import { Request, Response } from 'express'
import { getCustomRepository } from 'typeorm'
import { UserRepository } from '../repositories/UsersRepository'
import { AppError } from '../errors/AppError'
import * as yup from 'yup'

class UserController {
    async create(request: Request, response: Response) {
        const { name, email } = request.body

        const schema = yup.object().shape({
            name: yup.string().required('Name is required'),
            email: yup.string().email().required('E-mail is required')
        })

        // To validade

        // if (!(await schema.isValid(request.body)))
        //     return response.status(400).json({ message: 'Validation failed'})

        // or

        try {
            await schema.validate(request.body, { abortEarly: false })
        } catch (err) {
            throw new AppError(err, 400)
        }
        
        const usersRepository = getCustomRepository(UserRepository)

        const userAlreadyExists = await usersRepository.findOne({
            email
        })

        if(userAlreadyExists)
            throw new AppError('User already exists', 400)

        const user = usersRepository.create({
            name,
            email
        })

        await usersRepository.save(user)
        
        return response.status(201).json(user)
    }
}

export { UserController }

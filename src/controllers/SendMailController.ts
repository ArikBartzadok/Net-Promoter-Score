import { resolve } from 'path'
import { Request, Response } from 'express'
import { getCustomRepository } from 'typeorm'
import { SurveysRepository } from '../repositories/SurveysRespository'
import { SurveyUsersRepository } from '../repositories/SurveysUsersRepository'
import { UserRepository } from '../repositories/UsersRepository'
import SendMailService from '../services/SendMailService'

class SendMailController {
    async execute(request: Request, response: Response) {
        const { email, survey_id } = request.body

        const usersRepository = getCustomRepository(UserRepository)
        const surveyRepository = getCustomRepository(SurveysRepository)
        const surveysUsersRepository = getCustomRepository(SurveyUsersRepository)

        const userAlreadyExists = await usersRepository.findOne({ email })

        if(!userAlreadyExists)
            return response.status(400).json({ message: 'User does not exists' })

        const surveyAlreadyExists = await surveyRepository.findOne({ id: survey_id })

        if(!surveyAlreadyExists)
            return response.status(400).json({ message: 'Survey does not exists' })

        const npsPath = resolve(__dirname, '..', 'views', 'emails', 'npsMail.hbs')

        const variables = {
            name: userAlreadyExists.name,
            title: surveyAlreadyExists.title,
            description: surveyAlreadyExists.description,
            user_id: userAlreadyExists.id,
            link: process.env.URL_MAIL
        }
        
        const surveyUserAlreadyExists = await surveysUsersRepository.findOne({
            where: [
                {
                    user_id: userAlreadyExists.id
                }, 
                {
                    value: null
                }
            ],
            relations: ['user', 'survey']
        })

        if(surveyUserAlreadyExists) {
            await SendMailService.execute(email, surveyAlreadyExists.title, variables, npsPath)

            return response.json(surveyUserAlreadyExists)
        }

        // Salvando informações
        const surveyUser = surveysUsersRepository.create({
            user_id: userAlreadyExists.id,
            survey_id
        })

        await surveysUsersRepository.save(surveyUser)
        
        // Enviando e-mail
        await SendMailService.execute(email, surveyAlreadyExists.title,variables, npsPath)

        return response.json(surveyUser)
    }
}

export { SendMailController }
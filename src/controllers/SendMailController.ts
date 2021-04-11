import { resolve } from 'path'
import { Request, Response } from 'express'
import { getCustomRepository } from 'typeorm'
import { SurveysRepository } from '../repositories/SurveysRespository'
import { SurveyUsersRepository } from '../repositories/SurveysUsersRepository'
import { UserRepository } from '../repositories/UsersRepository'
import { AppError } from '../errors/AppError'
import SendMailService from '../services/SendMailService'
import { SurveyUser } from '../models/SurveyUser'

class SendMailController {
    async execute(request: Request, response: Response) {
        const { email, survey_id } = request.body

        const usersRepository = getCustomRepository(UserRepository)
        const surveyRepository = getCustomRepository(SurveysRepository)
        const surveysUsersRepository = getCustomRepository(SurveyUsersRepository)

        const userAlreadyExists = await usersRepository.findOne({ email })

        if(!userAlreadyExists)
            throw new AppError('User does not exists', 400)

        const surveyAlreadyExists = await surveyRepository.findOne({ id: survey_id })

        if(!surveyAlreadyExists)
            throw new AppError('Survey does not exists', 400)

        const npsPath = resolve(__dirname, '..', 'views', 'emails', 'npsMail.hbs')
        
        const surveyUserAlreadyExists = await surveysUsersRepository.findOne({
            where: 
                {
                    user_id: userAlreadyExists.id,
                    value: null
                }
            ,
            relations: ['user', 'survey']
        })

        const variables = {
            name: userAlreadyExists.name,
            title: surveyAlreadyExists.title,
            description: surveyAlreadyExists.description,
            id: "",
            link: process.env.URL_MAIL
        }

        if(surveyUserAlreadyExists) {
            variables.id = surveyUserAlreadyExists.id
            await SendMailService.execute(email, surveyAlreadyExists.title, variables, npsPath)

            return response.json(surveyUserAlreadyExists)
        }

        // Salvando informações
        const surveyUser = surveysUsersRepository.create({
            user_id: userAlreadyExists.id,
            survey_id
        })

        await surveysUsersRepository.save(surveyUser)

        // Definindo id da pesquisa com usuário criado
        variables.id = surveyUser.id
        
        // Enviando e-mail
        await SendMailService.execute(email, surveyAlreadyExists.title,variables, npsPath)

        return response.json(surveyUser)
    }
}

export { SendMailController }
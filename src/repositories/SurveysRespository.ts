import { EntityRepository, Repository } from "typeorm"
import { Survey } from "../models/Survey"

// herdando as funcionalidades do repositório do typeORM
@EntityRepository(Survey)
class SurveysRepository extends Repository<Survey> {

}

export { SurveysRepository }

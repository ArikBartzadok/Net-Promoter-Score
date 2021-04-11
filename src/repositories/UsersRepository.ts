import { Entity, EntityRepository, Repository } from "typeorm"
import { User } from "../models/User"

// herdando as funcionalidades do repositório do typeORM
@EntityRepository(User)
class UserRepository extends Repository<User> {

}

export { UserRepository }